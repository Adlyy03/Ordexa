<?php

namespace App\Modules\Payment\DTOs;

readonly class InvoiceResultDTO
{
    public function __construct(
        public string $invoiceId,
        public string $referenceId,
        public string $paymentUrl,
        public ?string $expiresAt = null,
        public string $status = 'pending',
        public ?string $qrString = null
    ) {}
}
