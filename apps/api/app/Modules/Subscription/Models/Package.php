<?php

namespace App\Modules\Subscription\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'price_monthly',
        'price_yearly',
        'features',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'price_monthly' => 'integer',
        'price_yearly' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];
}
