<?php

namespace App\Modules\Order\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Branch\Models\Branch;
use App\Modules\Menu\Models\MenuCategory;
use App\Modules\Table\Models\Table;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Http\JsonResponse;

class PublicOrderController extends Controller
{
    public function getMenu(string $restaurantSlug, string $branchSlug, string $tableToken): JsonResponse
    {
        // 1. Find Restaurant
        $restaurant = Restaurant::where('slug', $restaurantSlug)->first();
        if (! $restaurant) {
            return response()->json(['message' => 'Restoran tidak ditemukan.'], 404);
        }

        // 2. Find Branch
        $branch = Branch::withoutGlobalScopes()
            ->where('restaurant_id', $restaurant->id)
            ->where('slug', $branchSlug)
            ->where('is_active', true)
            ->first();

        if (! $branch) {
            return response()->json(['message' => 'Cabang tidak ditemukan atau sedang tutup.'], 404);
        }

        // 3. Find Table by QR token
        $table = Table::withoutGlobalScopes()
            ->where('branch_id', $branch->id)
            ->where('qr_token', $tableToken)
            ->where('is_active', true)
            ->first();

        if (! $table) {
            return response()->json(['message' => 'Meja tidak ditemukan atau kode QR tidak valid.'], 404);
        }

        // 4. Retrieve Active Categories & Items
        $categories = MenuCategory::withoutGlobalScopes()
            ->where('restaurant_id', $restaurant->id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->with(['items' => function ($query) {
                $query->withoutGlobalScopes()
                    ->where('is_available', true)
                    ->orderBy('sort_order');
            }])
            ->get();

        // 5. Filter out items disabled at this specific branch
        $categories->each(function ($cat) use ($branch) {
            $cat->setRelation(
                'items',
                $cat->items->filter(fn ($item) => $item->isAvailableAtBranch($branch->id))->values()
            );
        });

        return response()->json([
            'data' => [
                'restaurant' => [
                    'id' => $restaurant->id,
                    'name' => $restaurant->name,
                    'slug' => $restaurant->slug,
                    'logo_url' => $restaurant->logo_url,
                ],
                'branch' => [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'slug' => $branch->slug,
                    'address' => $branch->address,
                    'phone' => $branch->phone,
                ],
                'table' => [
                    'id' => $table->id,
                    'name' => $table->name,
                    'capacity' => $table->capacity,
                    'qr_token' => $table->qr_token,
                ],
                'categories' => $categories,
            ],
        ]);
    }
}
