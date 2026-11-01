<?php

namespace App\Modules\Partner\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Partner\Models\PartnerWithdrawal;
use App\Modules\Partner\Services\WithdrawalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminWithdrawalController extends Controller
{
    public function __construct(
        protected WithdrawalService $withdrawalService
    ) {}

    protected function checkSuperAdmin(Request $request): ?JsonResponse
    {
        if (! $request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Akses ditolak. Hanya Super Admin yang diizinkan.'], 403);
        }

        return null;
    }

    /**
     * View all withdrawal requests
     */
    public function index(Request $request): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $query = PartnerWithdrawal::with(['partner.user', 'processor']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $withdrawals = $query->latest()->paginate(20);

        return response()->json([
            'summary' => [
                'pending_count' => PartnerWithdrawal::where('status', 'pending')->count(),
                'pending_amount' => (int) PartnerWithdrawal::where('status', 'pending')->sum('amount'),
                'paid_count' => PartnerWithdrawal::where('status', 'paid')->count(),
                'paid_amount' => (int) PartnerWithdrawal::where('status', 'paid')->sum('amount'),
            ],
            'data' => $withdrawals->through(fn ($w) => [
                'id' => $w->id,
                'partner_id' => $w->partner_id,
                'partner_name' => $w->partner?->user?->name ?? '-',
                'partner_email' => $w->partner?->user?->email ?? '-',
                'referral_code' => $w->partner?->referral_code ?? '-',
                'amount' => $w->amount,
                'payout_method' => $w->payout_method,
                'payout_provider' => $w->payout_provider,
                'payout_account_number' => $w->payout_account_number,
                'payout_account_name' => $w->payout_account_name,
                'status' => $w->status,
                'admin_note' => $w->admin_note,
                'payment_reference' => $w->payment_reference,
                'processed_by_name' => $w->processor?->name,
                'created_at' => $w->created_at->toISOString(),
                'processed_at' => $w->processed_at?->toISOString(),
            ]),
        ]);
    }

    /**
     * Approve withdrawal request
     */
    public function approve(Request $request, PartnerWithdrawal $withdrawal): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $adminNote = $request->input('admin_note');
        $updated = $this->withdrawalService->approveWithdrawal($withdrawal, $request->user(), $adminNote);

        return response()->json([
            'message' => 'Pengajuan penarikan berhasil disetujui.',
            'data' => $updated,
        ]);
    }

    /**
     * Reject withdrawal request
     */
    public function reject(Request $request, PartnerWithdrawal $withdrawal): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $request->validate(['reason' => ['required', 'string', 'max:500']]);

        $updated = $this->withdrawalService->rejectWithdrawal($withdrawal, $request->user(), $request->input('reason'));

        return response()->json([
            'message' => 'Pengajuan penarikan dana berhasil ditolak.',
            'data' => $updated,
        ]);
    }

    /**
     * Mark approved withdrawal as paid
     */
    public function markAsPaid(Request $request, PartnerWithdrawal $withdrawal): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $request->validate([
            'payment_reference' => ['required', 'string', 'max:100'],
            'admin_note' => ['nullable', 'string', 'max:500'],
        ]);

        $updated = $this->withdrawalService->markAsPaid(
            $withdrawal,
            $request->user(),
            $request->input('payment_reference'),
            $request->input('admin_note')
        );

        return response()->json([
            'message' => 'Penarikan berhasil ditandai sebagai telah ditransfer / dibayar.',
            'data' => $updated,
        ]);
    }
}
