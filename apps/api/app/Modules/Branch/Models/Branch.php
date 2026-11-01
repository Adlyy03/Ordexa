<?php

namespace App\Modules\Branch\Models;

use App\Modules\Table\Models\Table;
use App\Modules\Tenant\Models\Restaurant;
use App\Modules\Tenant\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'restaurant_id',
        'name',
        'slug',
        'address',
        'phone',
        'operational_hours',
        'is_active',
    ];

    protected $casts = [
        'operational_hours' => 'array',
        'is_active' => 'boolean',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function tables(): HasMany
    {
        return $this->hasMany(Table::class);
    }
}
