<?php

namespace App\Modules\Menu\Models;

use App\Modules\Tenant\Models\Restaurant;
use App\Modules\Tenant\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'restaurant_id',
        'menu_category_id',
        'name',
        'description',
        'price',
        'image_url',
        'is_available',
        'variants',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'integer',
        'is_available' => 'boolean',
        'variants' => 'array',
        'sort_order' => 'integer',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id');
    }

    public function branchSettings(): HasMany
    {
        return $this->hasMany(BranchMenuSetting::class);
    }

    public function isAvailableAtBranch(int $branchId): bool
    {
        $setting = $this->branchSettings()
            ->where('branch_id', $branchId)
            ->first();

        if ($setting !== null) {
            return $setting->is_available;
        }

        return $this->is_available;
    }
}
