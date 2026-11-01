<?php

namespace App\Modules\Payment\DTOs;

readonly class CreateInvoiceDTO
{
    public function __construct(
        public string $referenceId,
        public int $amount,
        public string $description,
        public string $payerEmail,
        public string $successRedirectUrl,
        public string $failureRedirectUrl,
        public ?string $merchantAccountId = null,
        public array $metadata = []
    ) {}
}
