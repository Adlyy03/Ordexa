<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Partner\Models\Partner;
use App\Modules\Partner\Models\PartnerCommission;
use App\Modules\Partner\Models\PartnerCommissionSetting;
use App\Modules\Partner\Models\PartnerReferral;
use App\Modules\Partner\Services\CommissionService;
use App\Modules\Partner\Services\PartnerService;
use App\Modules\Payment\Models\PaymentTransaction;
use App\Modules\Subscription\Models\Package;
use App\Modules\Subscription\Models\Subscription;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartnerProgramTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private string $adminToken;

    private User $partnerUser;

    private string $partnerToken;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Setup Super Admin
        $this->adminUser = User::create([
            'name' => 'Super Administrator',
            'email' => config('app.super_admin_email', 'superadmin@ordexa.id'),
            'password' => bcrypt('password123'),
        ]);
        $this->adminToken = $this->adminUser->createToken('admin_token')->plainTextToken;

        // 2. Setup Partner User
        $this->partnerUser = User::create([
            'name' => 'Budi Partner',
            'email' => 'budi@partner.com',
            'password' => bcrypt('password123'),
        ]);
        $this->partnerToken = $this->partnerUser->createToken('partner_token')->plainTextToken;

        // Ensure default settings exist
        PartnerCommissionSetting::getActiveSettings();
    }

    private function asAdmin()
    {
        $this->app['auth']->forgetGuards();

        return $this->withHeader('Authorization', 'Bearer '.$this->adminToken);
    }

    private function asPartner()
    {
        $this->app['auth']->forgetGuards();

        return $this->withHeader('Authorization', 'Bearer '.$this->partnerToken);
    }

    public function test_user_can_register_as_partner(): void
    {
        $response = $this->asPartner()->postJson('/api/partner/register', [
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'Budi Santoso',
            'terms_accepted' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.user_id', $this->partnerUser->id);

        $this->assertDatabaseHas('partners', [
            'user_id' => $this->partnerUser->id,
            'status' => 'pending',
            'bank_name' => 'BCA',
        ]);
    }

    public function test_admin_can_approve_partner(): void
    {
        $partner = Partner::create([
            'user_id' => $this->partnerUser->id,
            'referral_code' => 'BUDI1234',
            'status' => 'pending',
        ]);

        $response = $this->asAdmin()->postJson("/api/super-admin/partners/{$partner->id}/approve");

        $response->assertStatus(200);
        $this->assertDatabaseHas('partners', [
            'id' => $partner->id,
            'status' => 'approved',
            'approved_by' => $this->adminUser->id,
        ]);
    }

    public function test_admin_can_reject_partner_with_reason(): void
    {
        $partner = Partner::create([
            'user_id' => $this->partnerUser->id,
            'referral_code' => 'BUDI1234',
            'status' => 'pending',
        ]);

        $response = $this->asAdmin()->postJson("/api/super-admin/partners/{$partner->id}/reject", [
            'reason' => 'Dokumen identitas tidak valid',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('partners', [
            'id' => $partner->id,
            'status' => 'rejected',
            'rejection_reason' => 'Dokumen identitas tidak valid',
        ]);
    }

    public function test_restaurant_registration_with_referral_code(): void
    {
        $partner = Partner::create([
            'user_id' => $this->partnerUser->id,
            'referral_code' => 'BUDIREF',
            'status' => 'approved',
        ]);

        // New restaurant owner registers using BUDIREF
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Owner Cafe Keren',
            'email' => 'cafekeren@restaurant.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'Cafe Keren Senopati',
            'referral_code' => 'BUDIREF',
        ]);

        $response->assertStatus(201);
        $restaurantId = $response->json('data.restaurant.id');

        $this->assertDatabaseHas('partner_referrals', [
            'partner_id' => $partner->id,
            'restaurant_id' => $restaurantId,
            'referral_code' => 'BUDIREF',
            'status' => 'registered',
        ]);
    }

    public function test_partner_cannot_refer_own_restaurant(): void
    {
        $partner = Partner::create([
            'user_id' => $this->partnerUser->id,
            'referral_code' => 'SELFREF',
            'status' => 'approved',
        ]);

        // Partner attempts to register their own restaurant with their own code
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Budi Partner',
            'email' => 'budi_second@restaurant.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'Budi Resto',
            'referral_code' => 'SELFREF',
        ]);

        $response->assertStatus(201);
        $newUserId = $response->json('data.user.id');

        // Since user IDs differ in this test (budi_second), let's test direct trackReferral with same user id
        $restaurant = Restaurant::find($response->json('data.restaurant.id'));
        $result = app(PartnerService::class)
            ->trackReferral($restaurant, 'SELFREF', $this->partnerUser->id);

        $this->assertNull($result);
    }

    public function test_commission_calculation_on_subscription_payment(): void
    {
        $partner = Partner::create([
            'user_id' => $this->partnerUser->id,
            'referral_code' => 'BUDICOMM',
            'status' => 'approved',
        ]);

        $restaurant = Restaurant::create([
            'name' => 'Warung Enak',
            'slug' => 'warung-enak-123',
            'subscription_status' => 'pending_payment',
        ]);

        $referral = PartnerReferral::create([
            'partner_id' => $partner->id,
            'restaurant_id' => $restaurant->id,
            'referral_code' => 'BUDICOMM',
            'status' => 'registered',
            'registered_at' => now(),
        ]);

        $package = Package::create([
            'name' => 'Professional',
            'slug' => 'pro-pkg',
            'price_monthly' => 299000,
            'price_yearly' => 2990000,
            'features' => ['unlimited_branches' => true],
        ]);

        $subscription = Subscription::create([
            'restaurant_id' => $restaurant->id,
            'package_id' => $package->id,
            'status' => 'pending_payment',
            'billing_period' => 'monthly',
            'amount' => 299000,
        ]);

        $transaction = PaymentTransaction::create([
            'restaurant_id' => $restaurant->id,
            'subscription_id' => $subscription->id,
            'track' => 'subscription',
            'gateway' => 'xendit',
            'external_id' => 'SUB-TX-1001',
            'idempotency_key' => 'IDEMP-SUB-1001',
            'amount' => 299000,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        // Process commission calculation
        $commission = app(CommissionService::class)
            ->processSubscriptionPayment($transaction);

        $this->assertNotNull($commission);
        // Default 10% of 299.000 = 29.900
        $this->assertEquals(29900, $commission->commission_amount);
        $this->assertEquals('available', $commission->status);

        // Verify referral conversion status transitioned to converted
        $referral->refresh();
        $this->assertEquals('converted', $referral->status);

        // Test idempotency: second call returns same commission without creating duplicate
        $duplicate = app(CommissionService::class)
            ->processSubscriptionPayment($transaction);
        $this->assertEquals($commission->id, $duplicate->id);
        $this->assertEquals(1, PartnerCommission::where('payment_transaction_id', $transaction->id)->count());
    }

    public function test_commission_reversal_on_refund(): void
    {
        $partner = Partner::create([
            'user_id' => $this->partnerUser->id,
            'referral_code' => 'BUDIREV',
            'status' => 'approved',
        ]);

        $restaurant = Restaurant::create(['name' => 'Resto Refund', 'slug' => 'resto-refund-123']);
        $referral = PartnerReferral::create([
            'partner_id' => $partner->id,
            'restaurant_id' => $restaurant->id,
            'referral_code' => 'BUDIREV',
            'status' => 'converted',
        ]);

        $package = Package::create(['name' => 'Basic', 'slug' => 'basic', 'price_monthly' => 100000, 'price_yearly' => 1000000, 'features' => ['pos' => true]]);
        $subscription = Subscription::create([
            'restaurant_id' => $restaurant->id,
            'package_id' => $package->id,
            'status' => 'active',
            'amount' => 100000,
        ]);

        $transaction = PaymentTransaction::create([
            'restaurant_id' => $restaurant->id,
            'subscription_id' => $subscription->id,
            'track' => 'subscription',
            'gateway' => 'xendit',
            'external_id' => 'TX-REFUND-1',
            'idempotency_key' => 'IDEMP-REFUND-1',
            'amount' => 100000,
            'status' => 'paid',
        ]);

        $commission = PartnerCommission::create([
            'partner_id' => $partner->id,
            'referral_id' => $referral->id,
            'restaurant_id' => $restaurant->id,
            'subscription_id' => $subscription->id,
            'payment_transaction_id' => $transaction->id,
            'commission_type' => 'percentage',
            'commission_rate' => 10,
            'commission_amount' => 10000,
            'status' => 'available',
        ]);

        // Reversal
        app(CommissionService::class)
            ->reverseCommission($transaction, 'Chargeback requested');

        $commission->refresh();
        $this->assertEquals('reversed', $commission->status);
        $this->assertEquals('Chargeback requested', $commission->note);
    }

    public function test_withdrawal_workflow_and_balance_check(): void
    {
        $partner = Partner::create([
            'user_id' => $this->partnerUser->id,
            'referral_code' => 'BUDIWD',
            'status' => 'approved',
            'bank_name' => 'BCA',
            'bank_account_number' => '123456',
            'bank_account_name' => 'Budi',
        ]);

        $restaurant = Restaurant::create(['name' => 'Resto WD', 'slug' => 'resto-wd-123']);
        $referral = PartnerReferral::create([
            'partner_id' => $partner->id,
            'restaurant_id' => $restaurant->id,
            'referral_code' => 'BUDIWD',
            'status' => 'converted',
        ]);

        // Seed 200.000 available commission
        PartnerCommission::create([
            'partner_id' => $partner->id,
            'referral_id' => $referral->id,
            'restaurant_id' => $restaurant->id,
            'commission_type' => 'percentage',
            'commission_amount' => 200000,
            'status' => 'available',
        ]);

        // 1. Attempt withdrawal exceeding available balance (300.000 > 200.000)
        $failRes = $this->asPartner()->postJson('/api/partner/withdrawals', [
            'amount' => 300000,
            'payout_provider' => 'BCA',
            'payout_account_number' => '123456',
            'payout_account_name' => 'Budi',
        ]);
        $failRes->assertStatus(422);

        // 2. Successful withdrawal request for 150.000
        $successRes = $this->asPartner()->postJson('/api/partner/withdrawals', [
            'amount' => 150000,
            'payout_provider' => 'BCA',
            'payout_account_number' => '123456',
            'payout_account_name' => 'Budi',
        ]);
        $successRes->assertStatus(201);
        $withdrawalId = $successRes->json('data.id');

        // Remaining balance should now be 50.000
        $partner->refresh();
        $this->assertEquals(50000, $partner->available_balance);
        $this->assertEquals(150000, $partner->pending_withdrawal);

        // 3. Admin approves withdrawal
        $approveRes = $this->asAdmin()->postJson("/api/super-admin/partner-withdrawals/{$withdrawalId}/approve");
        $approveRes->assertStatus(200);

        // 4. Admin marks withdrawal as paid
        $payRes = $this->asAdmin()->postJson("/api/super-admin/partner-withdrawals/{$withdrawalId}/pay", [
            'payment_reference' => 'BCA-TRF-99887766',
        ]);
        $payRes->assertStatus(200);

        $this->assertDatabaseHas('partner_withdrawals', [
            'id' => $withdrawalId,
            'status' => 'paid',
            'payment_reference' => 'BCA-TRF-99887766',
        ]);
    }

    public function test_authorization_boundaries(): void
    {
        // Non-admin user tries to access super-admin partners list -> 403
        $response = $this->asPartner()->getJson('/api/super-admin/partners');
        $response->assertStatus(403);

        // Partner dashboard requires approved partner
        $unapprovedPartnerUser = User::create([
            'name' => 'Pending Partner',
            'email' => 'pending@partner.com',
            'password' => bcrypt('password123'),
        ]);
        $unapprovedToken = $unapprovedPartnerUser->createToken('token')->plainTextToken;

        $unapprovedPartner = Partner::create([
            'user_id' => $unapprovedPartnerUser->id,
            'referral_code' => 'PENDING1',
            'status' => 'pending',
        ]);

        $this->app['auth']->forgetGuards();
        $res = $this->withHeader('Authorization', 'Bearer '.$unapprovedToken)
            ->getJson('/api/partner/dashboard');

        $res->assertStatus(403);
    }
}
