<?php

namespace App\Modules\Payment\Services;

use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\DTOs\CreateInvoiceDTO;
use App\Modules\Payment\Models\PaymentTransaction;
use App\Modules\Payment\Providers\MidtransProvider;
use App\Modules\Payment\Providers\XenditProvider;
use App\Modules\Subscription\Models\Subscription;
use Illuminate\Support\Str;

class SubscriptionPaymentService
{
    public function __construct(
        protected XenditProvider $xenditProvider,
        protected MidtransProvider $midtransProvider
    ) {}

    public function createSubscriptionInvoice(Subscription $subscription, string $gateway = 'xendit'): array
    {
        $provider = $gateway === 'midtrans' ? $this->midtransProvider : $this->xenditProvider;

        $referenceId = 'SUB-' . $subscription->id . '-' . Str::upper(Str::random(6));
        $restaurant = $subscription->restaurant;
        $package = $subscription->package;

        $dto = new CreateInvoiceDTO(
            referenceId: $referenceId,
            amount: $subscription->amount,
            description: "Langganan Ordexa Paket {$package->name} ({$subscription->billing_period}) - {$restaurant->name}",
            payerEmail: $restaurant->email ?? 'billing@' . $restaurant->slug . '.id',
            successRedirectUrl: url("/restaurant/settings/subscription?status=success"),
            failureRedirectUrl: url("/restaurant/settings/subscription?status=failed"),
            merchantAccountId: null // Subscriptions always go to platform master account (Track 1)
        );

        $result = $provider->createInvoice($dto);

        // Record transaction
        $transaction = PaymentTransaction::create([
            'restaurant_id' => $restaurant->id,
            'subscription_id' => $subscription->id,
            'track' => 'subscription',
            'gateway' => $gateway,
            'external_id' => $result->referenceId,
            'idempotency_key' => $result->referenceId,
            'amount' => $subscription->amount,
            'status' => 'pending',
            'payment_url' => $result->paymentUrl,
            'expires_at' => $result->expiresAt,
        ]);

        return [
            'transaction_id' => $transaction->id,
            'reference_id' => $result->referenceId,
            'payment_url' => $result->paymentUrl,
            'amount' => $subscription->amount,
            'status' => 'pending',
        ];
    }
}
