<?php

namespace App\Modules\Subscription\Models;

use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'restaurant_id',
        'package_id',
        'status',
        'billing_period',
        'amount',
        'starts_at',
        'ends_at',
        'grace_ends_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'grace_ends_at' => 'datetime',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }
}
