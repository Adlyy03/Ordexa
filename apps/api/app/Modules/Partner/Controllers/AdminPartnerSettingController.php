<?php

namespace App\Modules\Partner\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Partner\Models\PartnerAuditLog;
use App\Modules\Partner\Models\PartnerCommissionSetting;
use App\Modules\Partner\Requests\UpdatePartnerSettingRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPartnerSettingController extends Controller
{
    protected function checkSuperAdmin(Request $request): ?JsonResponse
    {
        if (! $request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Akses ditolak. Hanya Super Admin yang diizinkan.'], 403);
        }

        return null;
    }

    /**
     * Get current partner program settings
     */
    public function show(Request $request): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $settings = PartnerCommissionSetting::getActiveSettings();

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Update partner program settings
     */
    public function update(UpdatePartnerSettingRequest $request): JsonResponse
    {
        if ($res = $this->checkSuperAdmin($request)) {
            return $res;
        }

        $settings = PartnerCommissionSetting::getActiveSettings();
        $oldSettings = $settings->toArray();

        $settings->update($request->validated());

        PartnerAuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'partner_settings_updated',
            'target_type' => PartnerCommissionSetting::class,
            'target_id' => $settings->id,
            'payload' => [
                'old' => $oldSettings,
                'new' => $settings->toArray(),
            ],
        ]);

        return response()->json([
            'message' => 'Pengaturan program mitra berhasil diperbarui.',
            'data' => $settings,
        ]);
    }
}
