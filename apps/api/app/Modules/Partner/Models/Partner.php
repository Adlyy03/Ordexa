<?php

namespace App\Modules\Partner\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Partner extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'referral_code',
        'status',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'rejection_reason',
        'approved_at',
        'approved_by',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(PartnerReferral::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(PartnerCommission::class);
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(PartnerWithdrawal::class);
    }

    /**
     * Total earned commission across lifetime (available or already paid out)
     */
    public function getTotalEarnedAttribute(): int
    {
        return (int) $this->commissions()
            ->whereIn('status', ['available', 'paid'])
            ->sum('commission_amount');
    }

    /**
     * Currently available balance that can be withdrawn
     */
    public function getAvailableBalanceAttribute(): int
    {
        $earned = $this->commissions()
            ->whereIn('status', ['available', 'paid'])
            ->sum('commission_amount');

        $withdrawnOrCommitted = $this->withdrawals()
            ->whereIn('status', ['pending', 'approved', 'paid'])
            ->sum('amount');

        return max(0, (int) ($earned - $withdrawnOrCommitted));
    }

    /**
     * Balance currently held in pending or approved withdrawal requests
     */
    public function getPendingWithdrawalAttribute(): int
    {
        return (int) $this->withdrawals()
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');
    }

    /**
     * Total paid out withdrawals
     */
    public function getPaidWithdrawalAttribute(): int
    {
        return (int) $this->withdrawals()
            ->where('status', 'paid')
            ->sum('amount');
    }
}
