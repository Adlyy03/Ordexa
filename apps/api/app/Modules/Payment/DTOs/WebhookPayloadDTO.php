<?php

namespace App\Modules\Payment\DTOs;

readonly class WebhookPayloadDTO
{
    public function __construct(
        public string $gateway,
        public string $referenceId,
        public string $status, // pending, paid, failed, expired
        public int $amount,
        public ?string $paidAt = null,
        public ?string $paymentMethod = null,
        public array $rawPayload = []
    ) {}
}
