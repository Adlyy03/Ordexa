<?php

namespace App\Modules\Partner\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Partner\Models\Partner;
use App\Modules\Partner\Models\PartnerCommission;
use App\Modules\Partner\Requests\AdjustCommissionRequest;
use App\Modules\Partner\Services\CommissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCommissionController extends Controller
{
    public function __construct(
        protected CommissionService $commissionService
    ) {}

    protected function checkSuperAdmin(Request $request): ?JsonResponse
    {
        if (! $request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Akses ditolak. Hanya Super Admin yang diizinkan.'], 403);
        }

        return null;
    }

    /**
     * List all commission transactions across the platform
     */
    public function index(Request $request): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $query = PartnerCommission::with(['partner.user', 'restaurant', 'paymentTransaction']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('partner_id')) {
            $query->where('partner_id', $request->query('partner_id'));
        }

        if ($request->filled('commission_type')) {
            $query->where('commission_type', $request->query('commission_type'));
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->query('start_date'), $request->query('end_date')]);
        }

        $commissions = $query->latest()->paginate(20);

        return response()->json([
            'summary' => [
                'total_commissions_count' => PartnerCommission::count(),
                'total_commissions_amount' => (int) PartnerCommission::whereIn('status', ['available', 'paid'])->sum('commission_amount'),
                'pending_commissions_amount' => (int) PartnerCommission::where('status', 'pending')->sum('commission_amount'),
            ],
            'data' => $commissions->through(fn ($c) => [
                'id' => $c->id,
                'partner_id' => $c->partner_id,
                'partner_name' => $c->partner?->user?->name ?? '-',
                'partner_email' => $c->partner?->user?->email ?? '-',
                'referral_code' => $c->partner?->referral_code ?? '-',
                'restaurant_name' => $c->restaurant?->name ?? '-',
                'commission_type' => $c->commission_type,
                'commission_rate' => $c->commission_rate,
                'commission_amount' => $c->commission_amount,
                'status' => $c->status,
                'note' => $c->note,
                'created_at' => $c->created_at->toISOString(),
            ]),
        ]);
    }

    /**
     * Manual commission adjustment with audit trail
     */
    public function adjust(AdjustCommissionRequest $request): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $partner = Partner::findOrFail($request->partner_id);

        $commission = $this->commissionService->manualAdjustment(
            $partner,
            $request->amount,
            $request->reason,
            $request->user()
        );

        return response()->json([
            'message' => 'Penyesuaian komisi berhasil disimpan.',
            'data' => $commission,
        ], 201);
    }

    /**
     * Reverse a commission record
     */
    public function reverse(Request $request, PartnerCommission $commission): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $request->validate(['reason' => ['required', 'string', 'max:500']]);

        $commission->update([
            'status' => 'reversed',
            'note' => $request->input('reason'),
        ]);

        return response()->json([
            'message' => 'Komisi berhasil direverse / dibatalkan.',
            'data' => $commission,
        ]);
    }
}
