<?php

namespace App\Modules\Partner\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerCommissionSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'commission_type',
        'commission_rate',
        'fixed_amount',
        'is_recurring',
        'commission_duration_months',
        'minimum_withdrawal',
        'attribution_days',
        'is_active',
    ];

    protected $casts = [
        'commission_rate' => 'float',
        'fixed_amount' => 'integer',
        'is_recurring' => 'boolean',
        'commission_duration_months' => 'integer',
        'minimum_withdrawal' => 'integer',
        'attribution_days' => 'integer',
        'is_active' => 'boolean',
    ];

    public static function getActiveSettings(): self
    {
        return self::firstOrCreate(
            ['id' => 1],
            [
                'commission_type' => 'percentage',
                'commission_rate' => 10.00,
                'fixed_amount' => 50000,
                'is_recurring' => true,
                'commission_duration_months' => 12,
                'minimum_withdrawal' => 100000,
                'attribution_days' => 30,
                'is_active' => true,
            ]
        );
    }
}
