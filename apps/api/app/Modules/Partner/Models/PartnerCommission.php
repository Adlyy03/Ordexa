<?php

namespace App\Modules\Partner\Models;

use App\Modules\Payment\Models\PaymentTransaction;
use App\Modules\Subscription\Models\Subscription;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerCommission extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'referral_id',
        'restaurant_id',
        'subscription_id',
        'payment_transaction_id',
        'commission_type',
        'commission_rate',
        'commission_amount',
        'status',
        'note',
        'available_at',
        'paid_at',
    ];

    protected $casts = [
        'commission_rate' => 'float',
        'commission_amount' => 'integer',
        'available_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function referral(): BelongsTo
    {
        return $this->belongsTo(PartnerReferral::class, 'referral_id');
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function paymentTransaction(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class);
    }
}
