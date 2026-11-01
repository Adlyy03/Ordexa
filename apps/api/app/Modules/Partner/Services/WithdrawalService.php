<?php

namespace App\Modules\Partner\Services;

use App\Models\User;
use App\Modules\Partner\Models\Partner;
use App\Modules\Partner\Models\PartnerAuditLog;
use App\Modules\Partner\Models\PartnerCommissionSetting;
use App\Modules\Partner\Models\PartnerWithdrawal;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WithdrawalService
{
    /**
     * Partner submits a withdrawal request
     */
    public function requestWithdrawal(Partner $partner, array $data): PartnerWithdrawal
    {
        $settings = PartnerCommissionSetting::getActiveSettings();

        $amount = (int) $data['amount'];

        if ($amount < $settings->minimum_withdrawal) {
            throw ValidationException::withMessages([
                'amount' => [
                    'Jumlah penarikan minimal adalah '.'Rp '.number_format($settings->minimum_withdrawal, 0, ',', '.'),
                ],
            ]);
        }

        return DB::transaction(function () use ($partner, $data, $amount) {
            // Lock partner row to prevent race conditions in concurrent requests
            $lockedPartner = Partner::where('id', $partner->id)->lockForUpdate()->first();

            $availableBalance = $lockedPartner->available_balance;

            if ($amount > $availableBalance) {
                throw ValidationException::withMessages([
                    'amount' => [
                        'Saldo komisi tidak mencukupi. Saldo tersedia: Rp '.number_format($availableBalance, 0, ',', '.'),
                    ],
                ]);
            }

            // Save or reuse bank info
            $payoutProvider = $data['payout_provider'] ?? $lockedPartner->bank_name;
            $payoutAccountNumber = $data['payout_account_number'] ?? $lockedPartner->bank_account_number;
            $payoutAccountName = $data['payout_account_name'] ?? $lockedPartner->bank_account_name;

            if (! $payoutProvider || ! $payoutAccountNumber || ! $payoutAccountName) {
                throw ValidationException::withMessages([
                    'payout_provider' => ['Informasi rekening bank tujuan penarikan wajib diisi.'],
                ]);
            }

            // Update partner default bank info if newly supplied
            $lockedPartner->update([
                'bank_name' => $payoutProvider,
                'bank_account_number' => $payoutAccountNumber,
                'bank_account_name' => $payoutAccountName,
            ]);

            return PartnerWithdrawal::create([
                'partner_id' => $lockedPartner->id,
                'amount' => $amount,
                'payout_method' => $data['payout_method'] ?? 'bank_transfer',
                'payout_provider' => $payoutProvider,
                'payout_account_number' => $payoutAccountNumber,
                'payout_account_name' => $payoutAccountName,
                'status' => 'pending',
            ]);
        });
    }

    /**
     * Admin approves withdrawal request
     */
    public function approveWithdrawal(PartnerWithdrawal $withdrawal, User $admin, ?string $adminNote = null): PartnerWithdrawal
    {
        if ($withdrawal->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Penarikan hanya bisa disetujui jika dalam status pending.'],
            ]);
        }

        $withdrawal->update([
            'status' => 'approved',
            'admin_note' => $adminNote ?? $withdrawal->admin_note,
            'processed_by' => $admin->id,
            'processed_at' => now(),
        ]);

        PartnerAuditLog::create([
            'user_id' => $admin->id,
            'action' => 'withdrawal_approved',
            'target_type' => PartnerWithdrawal::class,
            'target_id' => $withdrawal->id,
            'payload' => ['amount' => $withdrawal->amount, 'note' => $adminNote],
        ]);

        return $withdrawal;
    }

    /**
     * Admin rejects withdrawal request
     */
    public function rejectWithdrawal(PartnerWithdrawal $withdrawal, User $admin, string $reason): PartnerWithdrawal
    {
        if (! in_array($withdrawal->status, ['pending', 'approved'], true)) {
            throw ValidationException::withMessages([
                'status' => ['Hanya penarikan pending atau approved yang dapat ditolak.'],
            ]);
        }

        $withdrawal->update([
            'status' => 'rejected',
            'admin_note' => $reason,
            'processed_by' => $admin->id,
            'processed_at' => now(),
        ]);

        PartnerAuditLog::create([
            'user_id' => $admin->id,
            'action' => 'withdrawal_rejected',
            'target_type' => PartnerWithdrawal::class,
            'target_id' => $withdrawal->id,
            'payload' => ['reason' => $reason, 'amount' => $withdrawal->amount],
        ]);

        return $withdrawal;
    }

    /**
     * Admin marks withdrawal as paid
     */
    public function markAsPaid(PartnerWithdrawal $withdrawal, User $admin, string $paymentReference, ?string $adminNote = null): PartnerWithdrawal
    {
        if (! in_array($withdrawal->status, ['pending', 'approved'], true)) {
            throw ValidationException::withMessages([
                'status' => ['Penarikan harus berstatus pending atau approved untuk dapat ditandai lunas.'],
            ]);
        }

        $withdrawal->update([
            'status' => 'paid',
            'payment_reference' => $paymentReference,
            'admin_note' => $adminNote ?? $withdrawal->admin_note,
            'processed_by' => $admin->id,
            'processed_at' => now(),
        ]);

        PartnerAuditLog::create([
            'user_id' => $admin->id,
            'action' => 'withdrawal_paid',
            'target_type' => PartnerWithdrawal::class,
            'target_id' => $withdrawal->id,
            'payload' => [
                'amount' => $withdrawal->amount,
                'payment_reference' => $paymentReference,
            ],
        ]);

        return $withdrawal;
    }
}
