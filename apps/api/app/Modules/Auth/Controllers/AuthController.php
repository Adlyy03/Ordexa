<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Requests\RegisterRequest;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $restaurantSlug = Str::slug($request->restaurant_name) . '-' . Str::lower(Str::random(5));
            $restaurant = Restaurant::create([
                'name' => $request->restaurant_name,
                'slug' => $restaurantSlug,
                'subscription_status' => 'registered',
            ]);

            // Create default main branch
            $branch = $restaurant->branches()->create([
                'name' => 'Cabang Utama',
                'slug' => 'cabang-utama-' . Str::lower(Str::random(4)),
                'is_active' => true,
            ]);

            // Attach user as owner
            $membership = $restaurant->memberships()->create([
                'user_id' => $user->id,
                'role' => 'owner',
                'branch_id' => $branch->id,
                'is_active' => true,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'token' => $token,
                'user' => $user,
                'restaurant' => $restaurant,
                'branch' => $branch,
                'membership' => $membership,
            ];
        });

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'data' => $result,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.',
            ], 422);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $memberships = $user->memberships()
            ->with(['restaurant', 'branch'])
            ->where('is_active', true)
            ->get();

        return response()->json([
            'message' => 'Login berhasil.',
            'data' => [
                'token' => $token,
                'user' => $user,
                'memberships' => $memberships,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->tokens()->delete();
        }

        if ($request->hasSession()) {
            auth()->guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        auth()->forgetGuards();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $membership = $user->currentMembership();

        return response()->json([
            'data' => [
                'user' => $user,
                'current_membership' => $membership?->load(['restaurant', 'branch']),
                'memberships' => $user->memberships()->with(['restaurant', 'branch'])->get(),
            ],
        ]);
    }
}
