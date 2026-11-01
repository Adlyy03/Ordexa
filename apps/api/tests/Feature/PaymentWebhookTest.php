<?php

namespace Tests\Feature;

use App\Modules\Payment\Models\PaymentTransaction;
use App\Modules\Subscription\Models\Package;
use App\Modules\Subscription\Models\Subscription;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentWebhookTest extends TestCase
{
    use RefreshDatabase;

    private string $token;
    private int $restaurantId;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed packages
        $this->seed(\Database\Seeders\PackageSeeder::class);

        $res = $this->postJson('/api/auth/register', [
            'name' => 'Owner Resto',
            'email' => 'owner@warungmakan.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'Warung Makan Enak',
        ]);

        $this->token = $res->json('data.token');
        $this->restaurantId = $res->json('data.restaurant.id');

        $this->app['auth']->forgetGuards();
    }

    private function asTenant(string $token)
    {
        $this->app['auth']->forgetGuards();
        return $this->withHeader('Authorization', 'Bearer ' . $token);
    }

    public function test_xendit_webhook_requires_valid_token(): void
    {
        $response = $this->withHeader('x-callback-token', 'wrong_token')
            ->postJson('/api/webhooks/xendit', [
                'external_id' => 'SUB-12345',
                'status' => 'PAID',
                'amount' => 149000,
            ]);

        $response->assertStatus(401);
    }

    public function test_xendit_webhook_activates_subscription_on_paid(): void
    {
        // 1. Subscribe to Professional package
        $pkg = Package::where('slug', 'professional')->first();

        $subRes = $this->asTenant($this->token)
            ->postJson('/api/subscriptions/subscribe', [
                'package_id' => $pkg->id,
                'billing_period' => 'monthly',
                'gateway' => 'xendit',
            ]);

        $subRes->assertStatus(201);
        $refId = $subRes->json('data.payment.reference_id');
        $subId = $subRes->json('data.subscription.id');

        // Restaurant subscription is still pending
        $restaurant = Restaurant::find($this->restaurantId);
        $this->assertEquals('pending_payment', $restaurant->subscription_status);

        // 2. Webhook arrives from Xendit
        $webhookToken = config('services.xendit.webhook_token', 'xnd_webhook_secret_key');

        $this->app['auth']->forgetGuards();

        $webhookRes = $this->withHeader('x-callback-token', $webhookToken)
            ->postJson('/api/webhooks/xendit', [
                'external_id' => $refId,
                'status' => 'PAID',
                'amount' => $pkg->price_monthly,
                'paid_at' => now()->toIso8601String(),
                'payment_method' => 'QRIS',
            ]);

        $webhookRes->assertStatus(200)
            ->assertJsonPath('status', 'success');

        // 3. Verify transaction, subscription, and restaurant are now active
        $this->assertDatabaseHas('payment_transactions', [
            'external_id' => $refId,
            'status' => 'paid',
        ]);

        $subscription = Subscription::find($subId);
        $this->assertEquals('active', $subscription->status);
        $this->assertNotNull($subscription->starts_at);
        $this->assertNotNull($subscription->ends_at);

        $restaurant->refresh();
        $this->assertEquals('active', $restaurant->subscription_status);
    }

    public function test_xendit_webhook_idempotency_prevents_duplicate_processing(): void
    {
        $pkg = Package::where('slug', 'starter')->first();

        $subRes = $this->asTenant($this->token)
            ->postJson('/api/subscriptions/subscribe', [
                'package_id' => $pkg->id,
                'billing_period' => 'monthly',
                'gateway' => 'xendit',
            ]);

        $refId = $subRes->json('data.payment.reference_id');
        $webhookToken = config('services.xendit.webhook_token', 'xnd_webhook_secret_key');

        $this->app['auth']->forgetGuards();

        $payload = [
            'external_id' => $refId,
            'status' => 'PAID',
            'amount' => $pkg->price_monthly,
            'paid_at' => now()->toIso8601String(),
        ];

        // First call -> Success
        $first = $this->withHeader('x-callback-token', $webhookToken)
            ->postJson('/api/webhooks/xendit', $payload);
        $first->assertStatus(200)->assertJsonPath('status', 'success');

        // Second call -> Duplicate detected, returns 200 without duplicate processing
        $second = $this->withHeader('x-callback-token', $webhookToken)
            ->postJson('/api/webhooks/xendit', $payload);
        $second->assertStatus(200)->assertJsonPath('status', 'duplicate');
    }

    public function test_midtrans_webhook_requires_valid_sha512_signature(): void
    {
        $serverKey = config('services.midtrans.server_key', 'midtrans_dev_server_key');
        $orderId = 'SUB-TEST-999';
        $statusCode = '200';
        $grossAmount = '349000.00';

        $validSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        // 1. Invalid signature -> 401
        $this->postJson('/api/webhooks/midtrans', [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => 'invalid_hash',
            'transaction_status' => 'settlement',
        ])->assertStatus(401);

        // 2. Valid signature -> 200
        $this->postJson('/api/webhooks/midtrans', [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $validSignature,
            'transaction_status' => 'settlement',
        ])->assertStatus(200);
    }
}
