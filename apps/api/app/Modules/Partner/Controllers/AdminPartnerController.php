<?php

namespace App\Modules\Partner\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Partner\Models\Partner;
use App\Modules\Partner\Services\PartnerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPartnerController extends Controller
{
    public function __construct(
        protected PartnerService $partnerService
    ) {}

    protected function checkSuperAdmin(Request $request): ?JsonResponse
    {
        if (! $request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Akses ditolak. Hanya Super Admin yang diizinkan.'], 403);
        }

        return null;
    }

    /**
     * List all partner accounts with search and filtering
     */
    public function index(Request $request): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $query = Partner::with(['user', 'approver'])
            ->withCount([
                'referrals as total_referrals',
                'referrals as converted_referrals' => fn ($q) => $q->where('status', 'converted'),
            ]);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('referral_code', 'ilike', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'ilike', "%{$search}%")
                            ->orWhere('email', 'ilike', "%{$search}%");
                    });
            });
        }

        $partners = $query->latest()->paginate(20);

        return response()->json([
            'data' => $partners->through(fn ($p) => [
                'id' => $p->id,
                'user_name' => $p->user->name,
                'user_email' => $p->user->email,
                'referral_code' => $p->referral_code,
                'status' => $p->status,
                'bank_name' => $p->bank_name,
                'bank_account_number' => $p->bank_account_number,
                'bank_account_name' => $p->bank_account_name,
                'total_referrals' => $p->total_referrals,
                'converted_referrals' => $p->converted_referrals,
                'total_earned' => $p->total_earned,
                'available_balance' => $p->available_balance,
                'rejection_reason' => $p->rejection_reason,
                'approved_at' => $p->approved_at?->toISOString(),
                'created_at' => $p->created_at->toISOString(),
            ]),
        ]);
    }

    /**
     * View partner details
     */
    public function show(Request $request, Partner $partner): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $partner->load([
            'user',
            'approver',
            'referrals.restaurant.activeSubscription.package',
            'commissions.restaurant',
            'withdrawals',
        ]);

        return response()->json([
            'data' => [
                'id' => $partner->id,
                'user' => [
                    'id' => $partner->user->id,
                    'name' => $partner->user->name,
                    'email' => $partner->user->email,
                ],
                'referral_code' => $partner->referral_code,
                'status' => $partner->status,
                'bank_name' => $partner->bank_name,
                'bank_account_number' => $partner->bank_account_number,
                'bank_account_name' => $partner->bank_account_name,
                'rejection_reason' => $partner->rejection_reason,
                'total_earned' => $partner->total_earned,
                'available_balance' => $partner->available_balance,
                'pending_withdrawal' => $partner->pending_withdrawal,
                'paid_withdrawal' => $partner->paid_withdrawal,
                'approved_at' => $partner->approved_at?->toISOString(),
                'created_at' => $partner->created_at->toISOString(),
                'referrals' => $partner->referrals->map(fn ($r) => [
                    'id' => $r->id,
                    'restaurant_name' => $r->restaurant?->name,
                    'status' => $r->status,
                    'package' => $r->restaurant?->activeSubscription?->package?->name ?? '-',
                    'registered_at' => $r->registered_at->toISOString(),
                ]),
                'recent_commissions' => $partner->commissions->take(10)->map(fn ($c) => [
                    'id' => $c->id,
                    'restaurant_name' => $c->restaurant?->name,
                    'amount' => $c->commission_amount,
                    'type' => $c->commission_type,
                    'status' => $c->status,
                    'created_at' => $c->created_at->toISOString(),
                ]),
            ],
        ]);
    }

    /**
     * Approve partner application
     */
    public function approve(Request $request, Partner $partner): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $updated = $this->partnerService->approvePartner($partner, $request->user());

        return response()->json([
            'message' => "Mitra {$updated->user->name} berhasil disetujui.",
            'data' => $updated,
        ]);
    }

    /**
     * Reject partner application
     */
    public function reject(Request $request, Partner $partner): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $request->validate(['reason' => ['required', 'string', 'max:500']]);

        $updated = $this->partnerService->rejectPartner($partner, $request->user(), $request->input('reason'));

        return response()->json([
            'message' => "Pengajuan mitra {$updated->user->name} ditolak.",
            'data' => $updated,
        ]);
    }

    /**
     * Suspend partner
     */
    public function suspend(Request $request, Partner $partner): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $updated = $this->partnerService->suspendPartner($partner, $request->user(), $request->input('reason'));

        return response()->json([
            'message' => "Mitra {$updated->user->name} berhasil dinonaktifkan/disuspend.",
            'data' => $updated,
        ]);
    }

    /**
     * Reactivate partner
     */
    public function reactivate(Request $request, Partner $partner): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $updated = $this->partnerService->reactivatePartner($partner, $request->user());

        return response()->json([
            'message' => "Mitra {$updated->user->name} berhasil diaktifkan kembali.",
            'data' => $updated,
        ]);
    }
}
