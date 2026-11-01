<?php

namespace App\Modules\Partner\Services;

use App\Models\User;
use App\Modules\Partner\Models\Partner;
use App\Modules\Partner\Models\PartnerAuditLog;
use App\Modules\Partner\Models\PartnerCommission;
use App\Modules\Partner\Models\PartnerCommissionSetting;
use App\Modules\Partner\Models\PartnerReferral;
use App\Modules\Payment\Models\PaymentTransaction;
use Illuminate\Support\Facades\DB;

class CommissionService
{
    /**
     * Calculate and record commission from a successful subscription payment transaction
     */
    public function processSubscriptionPayment(PaymentTransaction $transaction): ?PartnerCommission
    {
        // 1. Guard: Only process subscription tracks
        if ($transaction->track !== 'subscription' || ! $transaction->subscription_id) {
            return null;
        }

        // 2. Check settings
        $settings = PartnerCommissionSetting::getActiveSettings();
        if (! $settings->is_active) {
            return null;
        }

        // 3. Prevent duplicate commission for the exact same payment transaction (Idempotency)
        $existing = PartnerCommission::where('payment_transaction_id', $transaction->id)->first();
        if ($existing) {
            return $existing;
        }

        return DB::transaction(function () use ($transaction, $settings) {
            // 4. Find referral record for this restaurant
            $referral = PartnerReferral::where('restaurant_id', $transaction->restaurant_id)->first();
            if (! $referral) {
                return null;
            }

            // 5. Verify partner is currently approved
            $partner = Partner::find($referral->partner_id);
            if (! $partner || $partner->status !== 'approved') {
                return null;
            }

            // 6. Check attribution duration / recurring eligibility
            $isInitialConversion = ($referral->status === 'registered');

            if (! $isInitialConversion) {
                // This is a renewal / recurring payment
                if (! $settings->is_recurring) {
                    return null; // Recurring disabled
                }

                if ($settings->commission_duration_months > 0) {
                    $monthsSinceRegistration = $referral->registered_at->diffInMonths(now());
                    if ($monthsSinceRegistration >= $settings->commission_duration_months) {
                        return null; // Eligibility period expired
                    }
                }
            }

            // 7. Calculate commission amount
            if ($settings->commission_type === 'percentage') {
                $rate = (float) $settings->commission_rate;
                $amount = (int) round(($transaction->amount * $rate) / 100);
            } else {
                $rate = null;
                $amount = (int) min($settings->fixed_amount, $transaction->amount);
            }

            if ($amount <= 0) {
                return null;
            }

            $commissionType = $isInitialConversion ? $settings->commission_type : 'recurring';

            // 8. Create commission record
            $commission = PartnerCommission::create([
                'partner_id' => $partner->id,
                'referral_id' => $referral->id,
                'restaurant_id' => $transaction->restaurant_id,
                'subscription_id' => $transaction->subscription_id,
                'payment_transaction_id' => $transaction->id,
                'commission_type' => $commissionType,
                'commission_rate' => $rate,
                'commission_amount' => $amount,
                'status' => 'available',
                'available_at' => now(),
            ]);

            // 9. Update referral conversion status
            if ($isInitialConversion) {
                $referral->update([
                    'status' => 'converted',
                    'converted_at' => now(),
                ]);
            }

            return $commission;
        });
    }

    /**
     * Reverse commission if subscription payment was refunded or disputed
     */
    public function reverseCommission(PaymentTransaction $transaction, ?string $reason = null): ?PartnerCommission
    {
        $commission = PartnerCommission::where('payment_transaction_id', $transaction->id)->first();
        if (! $commission || $commission->status === 'reversed') {
            return $commission;
        }

        $commission->update([
            'status' => 'reversed',
            'note' => $reason ?? 'Pembayaran langganan direfund/dibatalkan',
        ]);

        PartnerAuditLog::create([
            'user_id' => $transaction->restaurant?->memberships()->where('role', 'owner')->first()?->user_id ?? auth()->id(),
            'action' => 'commission_reversed',
            'target_type' => PartnerCommission::class,
            'target_id' => $commission->id,
            'payload' => [
                'transaction_id' => $transaction->id,
                'amount' => $commission->commission_amount,
                'reason' => $reason,
            ],
        ]);

        return $commission;
    }

    /**
     * Manual adjustment of commission by Admin with audit trail
     */
    public function manualAdjustment(Partner $partner, int $amount, string $reason, User $admin): PartnerCommission
    {
        return DB::transaction(function () use ($partner, $amount, $reason, $admin) {
            $referral = $partner->referrals()->first();
            $restaurantId = $referral?->restaurant_id ?? 1;

            $commission = PartnerCommission::create([
                'partner_id' => $partner->id,
                'referral_id' => $referral?->id ?? 1,
                'restaurant_id' => $restaurantId,
                'commission_type' => 'adjustment',
                'commission_rate' => null,
                'commission_amount' => $amount,
                'status' => 'available',
                'note' => $reason,
                'available_at' => now(),
            ]);

            PartnerAuditLog::create([
                'user_id' => $admin->id,
                'action' => 'manual_commission_adjustment',
                'target_type' => PartnerCommission::class,
                'target_id' => $commission->id,
                'payload' => [
                    'partner_id' => $partner->id,
                    'amount' => $amount,
                    'reason' => $reason,
                ],
            ]);

            return $commission;
        });
    }
}
