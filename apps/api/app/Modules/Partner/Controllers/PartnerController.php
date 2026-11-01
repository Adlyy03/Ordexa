<?php

namespace App\Modules\Partner\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Partner\Models\Partner;
use App\Modules\Partner\Models\PartnerCommissionSetting;
use App\Modules\Partner\Requests\PartnerRegisterRequest;
use App\Modules\Partner\Requests\WithdrawalRequest;
use App\Modules\Partner\Services\PartnerService;
use App\Modules\Partner\Services\WithdrawalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerController extends Controller
{
    public function __construct(
        protected PartnerService $partnerService,
        protected WithdrawalService $withdrawalService
    ) {}

    /**
     * Public endpoint to validate referral code
     */
    public function validateCode(string $code): JsonResponse
    {
        $partner = $this->partnerService->validateReferralCode($code);

        if (! $partner) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode referral tidak valid atau tidak aktif.',
            ], 404);
        }

        return response()->json([
            'valid' => true,
            'code' => $partner->referral_code,
            'partner_name' => $partner->user->name,
        ]);
    }

    /**
     * Register authenticated user as partner
     */
    public function register(PartnerRegisterRequest $request): JsonResponse
    {
        $user = $request->user();

        $partner = $this->partnerService->registerPartner($user, $request->validated());

        return response()->json([
            'message' => 'Pendaftaran program mitra berhasil diajukan.',
            'data' => $partner->load('user'),
        ], 201);
    }

    /**
     * Get current user's partner profile & status
     */
    public function me(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        if (! $partner) {
            return response()->json([
                'is_partner' => false,
                'partner' => null,
            ]);
        }

        return response()->json([
            'is_partner' => true,
            'partner' => [
                'id' => $partner->id,
                'referral_code' => $partner->referral_code,
                'status' => $partner->status,
                'rejection_reason' => $partner->rejection_reason,
                'bank_name' => $partner->bank_name,
                'bank_account_number' => $partner->bank_account_number,
                'bank_account_name' => $partner->bank_account_name,
                'approved_at' => $partner->approved_at?->toISOString(),
                'created_at' => $partner->created_at->toISOString(),
            ],
        ]);
    }

    /**
     * Partner Dashboard Statistics
     */
    public function dashboard(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        if (! $partner) {
            return response()->json(['message' => 'Akun Anda belum terdaftar sebagai mitra.'], 403);
        }

        if ($partner->status !== 'approved') {
            return response()->json([
                'message' => 'Akun mitra Anda berstatus '.$partner->status.'. Dashboard hanya tersedia setelah disetujui.',
                'status' => $partner->status,
            ], 403);
        }

        $referrals = $partner->referrals()->with('restaurant.activeSubscription.package')->get();
        $totalReferrals = $referrals->count();
        $convertedReferrals = $referrals->where('status', 'converted')->count();

        $activeSubscriptions = $referrals->filter(function ($ref) {
            return $ref->restaurant && $ref->restaurant->subscription_status === 'active';
        })->count();

        $totalEarned = $partner->total_earned;
        $availableBalance = $partner->available_balance;
        $pendingWithdrawal = $partner->pending_withdrawal;
        $paidWithdrawal = $partner->paid_withdrawal;

        $recentReferrals = $partner->referrals()
            ->with('restaurant')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($ref) => [
                'id' => $ref->id,
                'restaurant_name' => $ref->restaurant?->name ?? 'Restoran dihapus',
                'status' => $ref->status,
                'registered_at' => $ref->registered_at->toISOString(),
                'converted_at' => $ref->converted_at?->toISOString(),
            ]);

        $recentCommissions = $partner->commissions()
            ->with(['restaurant', 'paymentTransaction'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($comm) => [
                'id' => $comm->id,
                'restaurant_name' => $comm->restaurant?->name ?? '-',
                'commission_type' => $comm->commission_type,
                'commission_amount' => $comm->commission_amount,
                'status' => $comm->status,
                'created_at' => $comm->created_at->toISOString(),
            ]);

        return response()->json([
            'stats' => [
                'total_referrals' => $totalReferrals,
                'converted_referrals' => $convertedReferrals,
                'active_subscriptions' => $activeSubscriptions,
                'total_earned' => $totalEarned,
                'available_balance' => $availableBalance,
                'pending_withdrawal' => $pendingWithdrawal,
                'paid_withdrawal' => $paidWithdrawal,
            ],
            'recent_referrals' => $recentReferrals,
            'recent_commissions' => $recentCommissions,
        ]);
    }

    /**
     * Partner Referral Management
     */
    public function referrals(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        if (! $partner || $partner->status !== 'approved') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $referrals = $partner->referrals()
            ->with('restaurant.activeSubscription.package')
            ->latest()
            ->paginate(15);

        $baseUrl = config('app.frontend_url', 'http://localhost:3000');
        $referralLink = "{$baseUrl}/register?ref={$partner->referral_code}";

        return response()->json([
            'referral_code' => $partner->referral_code,
            'referral_link' => $referralLink,
            'data' => $referrals->through(fn ($ref) => [
                'id' => $ref->id,
                'restaurant_name' => $ref->restaurant?->name ?? 'Restoran dihapus',
                'restaurant_slug' => $ref->restaurant?->slug ?? '',
                'subscription_status' => $ref->restaurant?->subscription_status ?? 'unknown',
                'package_name' => $ref->restaurant?->activeSubscription?->package?->name ?? '-',
                'conversion_status' => $ref->status,
                'registered_at' => $ref->registered_at->toISOString(),
                'converted_at' => $ref->converted_at?->toISOString(),
            ]),
        ]);
    }

    /**
     * Commission History
     */
    public function commissions(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        if (! $partner || $partner->status !== 'approved') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $query = $partner->commissions()->with('restaurant');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $commissions = $query->latest()->paginate(15);

        return response()->json([
            'summary' => [
                'total_earned' => $partner->total_earned,
                'available_balance' => $partner->available_balance,
            ],
            'data' => $commissions->through(fn ($comm) => [
                'id' => $comm->id,
                'restaurant_name' => $comm->restaurant?->name ?? '-',
                'commission_type' => $comm->commission_type,
                'commission_rate' => $comm->commission_rate,
                'commission_amount' => $comm->commission_amount,
                'status' => $comm->status,
                'note' => $comm->note,
                'available_at' => $comm->available_at?->toISOString(),
                'paid_at' => $comm->paid_at?->toISOString(),
                'created_at' => $comm->created_at->toISOString(),
            ]),
        ]);
    }

    /**
     * Withdrawal History & Balance Info
     */
    public function withdrawals(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        if (! $partner || $partner->status !== 'approved') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $settings = PartnerCommissionSetting::getActiveSettings();
        $withdrawals = $partner->withdrawals()->latest()->paginate(15);

        return response()->json([
            'balance' => [
                'available_balance' => $partner->available_balance,
                'pending_withdrawal' => $partner->pending_withdrawal,
                'paid_withdrawal' => $partner->paid_withdrawal,
                'minimum_withdrawal' => $settings->minimum_withdrawal,
            ],
            'saved_payout_info' => [
                'bank_name' => $partner->bank_name,
                'bank_account_number' => $partner->bank_account_number,
                'bank_account_name' => $partner->bank_account_name,
            ],
            'data' => $withdrawals->through(fn ($w) => [
                'id' => $w->id,
                'amount' => $w->amount,
                'payout_method' => $w->payout_method,
                'payout_provider' => $w->payout_provider,
                'payout_account_number' => $w->payout_account_number,
                'payout_account_name' => $w->payout_account_name,
                'status' => $w->status,
                'admin_note' => $w->admin_note,
                'payment_reference' => $w->payment_reference,
                'created_at' => $w->created_at->toISOString(),
                'processed_at' => $w->processed_at?->toISOString(),
            ]),
        ]);
    }

    /**
     * Submit Withdrawal Request
     */
    public function requestWithdrawal(WithdrawalRequest $request): JsonResponse
    {
        $partner = $request->user()->partner;

        if (! $partner || $partner->status !== 'approved') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $withdrawal = $this->withdrawalService->requestWithdrawal($partner, $request->validated());

        return response()->json([
            'message' => 'Pengajuan penarikan dana berhasil dibuat.',
            'data' => $withdrawal,
        ], 201);
    }
}
