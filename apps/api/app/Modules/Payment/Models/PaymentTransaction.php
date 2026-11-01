<?php

namespace App\Modules\Payment\Models;

use App\Modules\Branch\Models\Branch;
use App\Modules\Subscription\Models\Subscription;
use App\Modules\Tenant\Models\Restaurant;
use App\Modules\Tenant\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'subscription_id',
        'order_id',
        'track',
        'gateway',
        'external_id',
        'idempotency_key',
        'amount',
        'status',
        'payment_method',
        'payment_url',
        'paid_at',
        'expires_at',
        'payload',
    ];

    protected $casts = [
        'amount' => 'integer',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
        'payload' => 'array',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
