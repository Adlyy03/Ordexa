<?php

namespace App\Modules\Tenant\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function current(Request $request): JsonResponse
    {
        $membership = $request->user()->currentMembership();

        if (! $membership) {
            return response()->json([
                'message' => 'User tidak memiliki restoran aktif.',
            ], 404);
        }

        $restaurant = $membership->restaurant->load(['branches', 'activeSubscription.package']);

        return response()->json([
            'data' => $restaurant,
            'role' => $membership->role,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $membership = $request->user()->currentMembership();

        if (! $membership || ! in_array($membership->role, ['owner', 'admin'], true)) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya owner atau admin yang dapat mengubah profil restoran.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'description' => ['nullable', 'string', 'max:1000'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'operational_hours' => ['nullable', 'array'],
        ]);

        $restaurant = $membership->restaurant;
        $restaurant->update($validated);

        return response()->json([
            'message' => 'Profil restoran berhasil diperbarui.',
            'data' => $restaurant,
        ]);
    }
}
