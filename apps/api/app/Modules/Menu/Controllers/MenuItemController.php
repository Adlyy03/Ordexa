<?php

namespace App\Modules\Menu\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Menu\Models\BranchMenuSetting;
use App\Modules\Menu\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MenuItem::with(['category']);

        if ($request->has('category_id')) {
            $query->where('menu_category_id', $request->input('category_id'));
        }

        if ($request->has('is_available')) {
            $query->where('is_available', filter_var($request->input('is_available'), FILTER_VALIDATE_BOOLEAN));
        }

        $items = $query->orderBy('sort_order')->get();

        // Optional branch status mapping
        if ($branchId = $request->input('branch_id')) {
            $items->transform(function ($item) use ($branchId) {
                $item->branch_available = $item->isAvailableAtBranch((int) $branchId);
                return $item;
            });
        }

        return response()->json([
            'data' => $items,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'menu_category_id' => ['required', 'exists:menu_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['required', 'integer', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'is_available' => ['sometimes', 'boolean'],
            'variants' => ['nullable', 'array'],
            'sort_order' => ['sometimes', 'integer'],
        ]);

        $item = MenuItem::create($validated);

        return response()->json([
            'message' => 'Menu berhasil ditambahkan.',
            'data' => $item->load('category'),
        ], 201);
    }

    public function show(MenuItem $item): JsonResponse
    {
        return response()->json([
            'data' => $item->load('category'),
        ]);
    }

    public function update(Request $request, MenuItem $item): JsonResponse
    {
        $validated = $request->validate([
            'menu_category_id' => ['sometimes', 'exists:menu_categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['sometimes', 'integer', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'is_available' => ['sometimes', 'boolean'],
            'variants' => ['nullable', 'array'],
            'sort_order' => ['sometimes', 'integer'],
        ]);

        $item->update($validated);

        return response()->json([
            'message' => 'Menu berhasil diperbarui.',
            'data' => $item->load('category'),
        ]);
    }

    public function destroy(MenuItem $item): JsonResponse
    {
        $item->delete();

        return response()->json([
            'message' => 'Menu berhasil dihapus.',
        ]);
    }

    public function toggleBranchAvailability(Request $request, MenuItem $item): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'exists:branches,id'],
            'is_available' => ['required', 'boolean'],
        ]);

        $setting = BranchMenuSetting::updateOrCreate(
            [
                'branch_id' => $validated['branch_id'],
                'menu_item_id' => $item->id,
            ],
            [
                'is_available' => $validated['is_available'],
            ]
        );

        return response()->json([
            'message' => 'Ketersediaan menu cabang berhasil diperbarui.',
            'data' => $setting,
        ]);
    }
}
