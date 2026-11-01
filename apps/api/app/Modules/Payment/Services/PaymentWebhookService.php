<?php

namespace App\Modules\Payment\Services;

use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\DTOs\WebhookPayloadDTO;
use App\Modules\Payment\Models\PaymentTransaction;
use App\Modules\Payment\Models\PaymentWebhook;
use App\Modules\Payment\Providers\MidtransProvider;
use App\Modules\Payment\Providers\XenditProvider;
use App\Modules\Subscription\Models\Subscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentWebhookService
{
    public function __construct(
        protected XenditProvider $xenditProvider,
        protected MidtransProvider $midtransProvider
    ) {}

    public function handleXenditWebhook(array $payload, string $token): array
    {
        // 1. Signature Verification
        if (! $this->xenditProvider->verifyWebhook($payload, $token)) {
            Log::warning('Xendit webhook signature verification failed.');
            return ['status' => 'unauthorized', 'code' => 401];
        }

        $dto = $this->xenditProvider->parseWebhook($payload);
        return $this->processParsedWebhook($dto);
    }

    public function handleMidtransWebhook(array $payload, string $signature): array
    {
        // 1. Signature Verification
        if (! $this->midtransProvider->verifyWebhook($payload, $signature)) {
            Log::warning('Midtrans webhook signature verification failed.');
            return ['status' => 'unauthorized', 'code' => 401];
        }

        $dto = $this->midtransProvider->parseWebhook($payload);
        return $this->processParsedWebhook($dto);
    }

    public function processParsedWebhook(WebhookPayloadDTO $dto): array
    {
        $idempotencyKey = $dto->gateway . '_' . $dto->referenceId . '_' . $dto->status;

        // 2. Idempotency Check — Prevent duplicate processing
        $existing = PaymentWebhook::where('idempotency_key', $idempotencyKey)->first();
        if ($existing && $existing->is_processed) {
            return [
                'status' => 'duplicate',
                'message' => 'Event already processed',
                'code' => 200,
            ];
        }

        $webhookRecord = PaymentWebhook::firstOrCreate(
            ['idempotency_key' => $idempotencyKey],
            [
                'gateway' => $dto->gateway,
                'event_type' => $dto->status,
                'payload' => $dto->rawPayload,
                'is_processed' => false,
            ]
        );

        // 3. Process Transaction State Transition
        try {
            DB::transaction(function () use ($dto, $webhookRecord) {
                $transaction = PaymentTransaction::withoutGlobalScopes()
                    ->where('external_id', $dto->referenceId)
                    ->lockForUpdate()
                    ->first();

                if ($transaction) {
                    $transaction->update([
                        'status' => $dto->status,
                        'paid_at' => $dto->status === 'paid' ? ($dto->paidAt ?? now()) : null,
                        'payment_method' => $dto->paymentMethod ?? $transaction->payment_method,
                    ]);

                    // Track 1: Subscription payment reconciliation
                    if ($transaction->track === 'subscription' && $transaction->subscription_id) {
                        $subscription = Subscription::withoutGlobalScopes()->find($transaction->subscription_id);
                        if ($subscription && $dto->status === 'paid') {
                            $endDate = $subscription->billing_period === 'yearly'
                                ? now()->addYear()
                                : now()->addMonth();

                            $subscription->update([
                                'status' => 'active',
                                'starts_at' => now(),
                                'ends_at' => $endDate,
                                'grace_ends_at' => null,
                            ]);

                            $subscription->restaurant()->update([
                                'subscription_status' => 'active',
                            ]);
                        }
                    }

                    // Track 2: Customer order payment reconciliation
                    if ($transaction->track === 'customer_order' && $transaction->order_id) {
                        // In Phase 6, update order payment_status
                        DB::table('orders')->where('id', $transaction->order_id)->update([
                            'payment_status' => $dto->status === 'paid' ? 'paid' : 'failed',
                        ]);
                    }
                }

                $webhookRecord->update(['is_processed' => true]);
            });

            return [
                'status' => 'success',
                'message' => 'Webhook reconciled successfully',
                'code' => 200,
            ];
        } catch (\Throwable $e) {
            Log::error('Webhook reconciliation error', ['error' => $e->getMessage()]);
            $webhookRecord->update(['error_message' => $e->getMessage()]);

            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'code' => 500,
            ];
        }
    }
}
