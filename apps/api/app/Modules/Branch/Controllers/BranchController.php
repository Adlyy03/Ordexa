<?php

namespace App\Modules\Branch\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Branch\Models\Branch;
use App\Modules\Branch\Requests\StoreBranchRequest;
use App\Modules\Branch\Requests\UpdateBranchRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    public function index(): JsonResponse
    {
        $branches = Branch::with('tables')->get();

        return response()->json([
            'data' => $branches,
        ]);
    }

    public function store(StoreBranchRequest $request): JsonResponse
    {
        $restaurant = $request->user()->currentMembership()->restaurant;

        // Unlimited branches guardrail: No branch count limit!
        $branch = $restaurant->branches()->create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::lower(Str::random(4)),
            'address' => $request->address,
            'phone' => $request->phone,
            'operational_hours' => $request->operational_hours,
            'is_active' => $request->input('is_active', true),
        ]);

        return response()->json([
            'message' => 'Cabang berhasil ditambahkan.',
            'data' => $branch,
        ], 201);
    }

    public function show(Branch $branch): JsonResponse
    {
        return response()->json([
            'data' => $branch->load('tables'),
        ]);
    }

    public function update(UpdateBranchRequest $request, Branch $branch): JsonResponse
    {
        $branch->update($request->validated());

        return response()->json([
            'message' => 'Cabang berhasil diperbarui.',
            'data' => $branch,
        ]);
    }

    public function destroy(Branch $branch): JsonResponse
    {
        $branch->delete();

        return response()->json([
            'message' => 'Cabang berhasil dihapus.',
        ]);
    }
}
