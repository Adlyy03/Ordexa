<?php

namespace App\Modules\Menu\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Menu\Models\MenuCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = MenuCategory::with(['items'])->orderBy('sort_order')->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $category = MenuCategory::create($validated);

        return response()->json([
            'message' => 'Kategori menu berhasil ditambahkan.',
            'data' => $category,
        ], 201);
    }

    public function update(Request $request, MenuCategory $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Kategori menu berhasil diperbarui.',
            'data' => $category,
        ]);
    }

    public function destroy(MenuCategory $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'message' => 'Kategori menu berhasil dihapus.',
        ]);
    }
}
