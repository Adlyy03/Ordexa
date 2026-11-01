<?php

namespace App\Modules\Partner\Services;

use App\Models\User;
use App\Modules\Partner\Models\Partner;
use App\Modules\Partner\Models\PartnerAuditLog;
use App\Modules\Partner\Models\PartnerCommissionSetting;
use App\Modules\Partner\Models\PartnerReferral;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PartnerService
{
    /**
     * Register a user as an Ordexa Partner
     */
    public function registerPartner(User $user, array $data): Partner
    {
        return DB::transaction(function () use ($user, $data) {
            $existing = Partner::where('user_id', $user->id)->first();
            if ($existing) {
                if ($existing->status === 'rejected') {
                    // Allow re-application if previously rejected
                    $existing->update([
                        'status' => 'pending',
                        'bank_name' => $data['bank_name'] ?? $existing->bank_name,
                        'bank_account_number' => $data['bank_account_number'] ?? $existing->bank_account_number,
                        'bank_account_name' => $data['bank_account_name'] ?? $existing->bank_account_name,
                        'rejection_reason' => null,
                    ]);

                    return $existing;
                }

                throw ValidationException::withMessages([
                    'partner' => ['Anda sudah terdaftar sebagai mitra dengan status: '.$existing->status],
                ]);
            }

            $referralCode = $this->generateUniqueReferralCode($user);

            return Partner::create([
                'user_id' => $user->id,
                'referral_code' => $referralCode,
                'status' => 'pending',
                'bank_name' => $data['bank_name'] ?? null,
                'bank_account_number' => $data['bank_account_number'] ?? null,
                'bank_account_name' => $data['bank_account_name'] ?? null,
            ]);
        });
    }

    /**
     * Generate unique referral code (8-10 chars uppercase)
     */
    public function generateUniqueReferralCode(User $user): string
    {
        $prefix = Str::upper(substr(preg_replace('/[^A-Za-z0-9]/', '', $user->name), 0, 4));
        if (strlen($prefix) < 3) {
            $prefix = 'ORD';
        }

        do {
            $code = $prefix.Str::upper(Str::random(4));
        } while (Partner::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Validate a referral code
     */
    public function validateReferralCode(string $code): ?Partner
    {
        $setting = PartnerCommissionSetting::getActiveSettings();
        if (! $setting->is_active) {
            return null;
        }

        $partner = Partner::where('referral_code', Str::upper(trim($code)))
            ->where('status', 'approved')
            ->first();

        return $partner;
    }

    /**
     * Track and attach a referral to a newly registered restaurant
     */
    public function trackReferral(Restaurant $restaurant, string $referralCode, int $ownerUserId): ?PartnerReferral
    {
        $partner = $this->validateReferralCode($referralCode);
        if (! $partner) {
            return null;
        }

        // Rule: Partners cannot refer their own restaurants or accounts
        if ($partner->user_id === $ownerUserId) {
            return null;
        }

        // Prevent duplicate attribution
        if (PartnerReferral::where('restaurant_id', $restaurant->id)->exists()) {
            return null;
        }

        return PartnerReferral::create([
            'partner_id' => $partner->id,
            'restaurant_id' => $restaurant->id,
            'referral_code' => $partner->referral_code,
            'attribution_source' => 'referral_code',
            'status' => 'registered',
            'registered_at' => now(),
        ]);
    }

    /**
     * Admin approves partner
     */
    public function approvePartner(Partner $partner, User $admin): Partner
    {
        $partner->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $admin->id,
            'rejection_reason' => null,
        ]);

        PartnerAuditLog::create([
            'user_id' => $admin->id,
            'action' => 'partner_approved',
            'target_type' => Partner::class,
            'target_id' => $partner->id,
            'payload' => ['partner_id' => $partner->id, 'referral_code' => $partner->referral_code],
        ]);

        return $partner;
    }

    /**
     * Admin rejects partner
     */
    public function rejectPartner(Partner $partner, User $admin, string $reason): Partner
    {
        $partner->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        PartnerAuditLog::create([
            'user_id' => $admin->id,
            'action' => 'partner_rejected',
            'target_type' => Partner::class,
            'target_id' => $partner->id,
            'payload' => ['reason' => $reason],
        ]);

        return $partner;
    }

    /**
     * Admin suspends partner
     */
    public function suspendPartner(Partner $partner, User $admin, ?string $reason = null): Partner
    {
        $partner->update(['status' => 'suspended']);

        PartnerAuditLog::create([
            'user_id' => $admin->id,
            'action' => 'partner_suspended',
            'target_type' => Partner::class,
            'target_id' => $partner->id,
            'payload' => ['reason' => $reason],
        ]);

        return $partner;
    }

    /**
     * Admin reactivates partner
     */
    public function reactivatePartner(Partner $partner, User $admin): Partner
    {
        $partner->update(['status' => 'approved']);

        PartnerAuditLog::create([
            'user_id' => $admin->id,
            'action' => 'partner_reactivated',
            'target_type' => Partner::class,
            'target_id' => $partner->id,
            'payload' => ['partner_id' => $partner->id],
        ]);

        return $partner;
    }
}
