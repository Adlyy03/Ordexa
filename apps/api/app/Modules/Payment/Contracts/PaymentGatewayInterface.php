<?php

namespace App\Modules\Payment\Contracts;

use App\Modules\Payment\DTOs\CreateInvoiceDTO;
use App\Modules\Payment\DTOs\InvoiceResultDTO;
use App\Modules\Payment\DTOs\WebhookPayloadDTO;

interface PaymentGatewayInterface
{
    public function createInvoice(CreateInvoiceDTO $dto): InvoiceResultDTO;
    public function verifyWebhook(array $payload, string $signature): bool;
    public function parseWebhook(array $payload): WebhookPayloadDTO;
    public function getTransactionStatus(string $referenceId): string;
}
