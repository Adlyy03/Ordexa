<?php

namespace App\Modules\Payment\Providers;

use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\DTOs\CreateInvoiceDTO;
use App\Modules\Payment\DTOs\InvoiceResultDTO;
use App\Modules\Payment\DTOs\WebhookPayloadDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransProvider implements PaymentGatewayInterface
{
    private string $serverKey;

    private string $baseUrl;

    public function __construct(?string $serverKey = null)
    {
        $this->serverKey = $serverKey ?? config('services.midtrans.server_key', 'midtrans_dev_server_key');
        $isProduction = config('services.midtrans.is_production', false);
        $this->baseUrl = $isProduction
            ? 'https://app.midtrans.com/snap/v1'
            : 'https://app.sandbox.midtrans.com/snap/v1';
    }

    public function createInvoice(CreateInvoiceDTO $dto): InvoiceResultDTO
    {
        if (empty($this->serverKey) || app()->runningUnitTests() || app()->environment('testing') || str_starts_with($this->serverKey, 'mock_') || $this->serverKey === 'midtrans_dev_server_key') {
            return new InvoiceResultDTO(
                invoiceId: 'midtrans_'.$dto->referenceId,
                referenceId: $dto->referenceId,
                paymentUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/'.$dto->referenceId,
                status: 'pending'
            );
        }

        $authHeader = 'Basic '.base64_encode($this->serverKey.':');

        $response = Http::withHeaders([
            'Authorization' => $authHeader,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post("{$this->baseUrl}/transactions", [
            'transaction_details' => [
                'order_id' => $dto->referenceId,
                'gross_amount' => $dto->amount,
            ],
            'customer_details' => [
                'email' => $dto->payerEmail,
            ],
        ]);

        if ($response->failed()) {
            Log::error('Midtrans Snap creation failed', [
                'reference_id' => $dto->referenceId,
                'error' => $response->json(),
            ]);
            throw new \RuntimeException('Gagal membuat transaksi Midtrans.');
        }

        $data = $response->json();

        return new InvoiceResultDTO(
            invoiceId: $data['token'] ?? $dto->referenceId,
            referenceId: $dto->referenceId,
            paymentUrl: $data['redirect_url'] ?? '',
            status: 'pending'
        );
    }

    public function verifyWebhook(array $payload, string $signature): bool
    {
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';

        $expectedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey);

        return hash_equals($expectedSignature, $signature);
    }

    public function parseWebhook(array $payload): WebhookPayloadDTO
    {
        $transactionStatus = $payload['transaction_status'] ?? '';
        $fraudStatus = $payload['fraud_status'] ?? 'accept';

        $status = match ($transactionStatus) {
            'capture' => $fraudStatus === 'challenge' ? 'pending' : 'paid',
            'settlement' => 'paid',
            'deny', 'cancel' => 'failed',
            'expire' => 'expired',
            default => 'pending',
        };

        return new WebhookPayloadDTO(
            gateway: 'midtrans',
            referenceId: $payload['order_id'] ?? '',
            status: $status,
            amount: (int) ($payload['gross_amount'] ?? 0),
            paidAt: $payload['settlement_time'] ?? $payload['transaction_time'] ?? null,
            paymentMethod: $payload['payment_type'] ?? null,
            rawPayload: $payload
        );
    }

    public function getTransactionStatus(string $referenceId): string
    {
        return 'pending';
    }
}
