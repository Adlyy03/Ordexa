<?php

namespace App\Modules\Payment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Payment\Services\PaymentWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function __construct(
        protected PaymentWebhookService $webhookService
    ) {}

    public function xendit(Request $request): JsonResponse
    {
        $token = $request->header('x-callback-token', '');
        $payload = $request->all();

        $result = $this->webhookService->handleXenditWebhook($payload, $token);

        return response()->json([
            'status' => $result['status'],
            'message' => $result['message'] ?? 'Processed',
        ], $result['code'] ?? 200);
    }

    public function midtrans(Request $request): JsonResponse
    {
        $payload = $request->all();
        $signature = $payload['signature_key'] ?? '';

        $result = $this->webhookService->handleMidtransWebhook($payload, $signature);

        return response()->json([
            'status' => $result['status'],
            'message' => $result['message'] ?? 'Processed',
        ], $result['code'] ?? 200);
    }
}
