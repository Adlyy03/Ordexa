<?php

namespace App\Modules\Partner\Models;

use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartnerReferral extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'restaurant_id',
        'referral_code',
        'attribution_source',
        'status',
        'registered_at',
        'converted_at',
    ];

    protected $casts = [
        'registered_at' => 'datetime',
        'converted_at' => 'datetime',
    ];

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(PartnerCommission::class, 'referral_id');
    }
}
