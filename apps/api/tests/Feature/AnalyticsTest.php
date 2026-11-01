<?php

namespace Tests\Feature;

use App\Models\RestaurantMembership;
use App\Models\User;
use App\Modules\Branch\Models\Branch;
use App\Modules\Menu\Models\MenuCategory;
use App\Modules\Menu\Models\MenuItem;
use App\Modules\Order\Models\Order;
use App\Modules\Subscription\Models\Package;
use App\Modules\Subscription\Models\Subscription;
use App\Modules\Table\Models\Table;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_restaurant_owner_can_fetch_isolated_analytics(): void
    {
        // 1. Tenant A
        $userA = User::factory()->create();
        $restoA = Restaurant::create(['name' => 'Resto A', 'slug' => 'resto-a']);
        RestaurantMembership::create(['user_id' => $userA->id, 'restaurant_id' => $restoA->id, 'role' => 'owner']);
        $branchA = Branch::create(['restaurant_id' => $restoA->id, 'name' => 'Cabang A', 'slug' => 'cabang-a']);
        $tableA = Table::create(['restaurant_id' => $restoA->id, 'branch_id' => $branchA->id, 'name' => 'T1', 'qr_token' => 't1']);
        
        $orderA = Order::create([
            'order_number' => 'ORD-A1',
            'restaurant_id' => $restoA->id,
            'branch_id' => $branchA->id,
            'table_id' => $tableA->id,
            'status' => 'completed',
            'payment_status' => 'paid',
            'subtotal' => 150000,
            'total_amount' => 150000,
        ]);

        // 2. Tenant B
        $userB = User::factory()->create();
        $restoB = Restaurant::create(['name' => 'Resto B', 'slug' => 'resto-b']);
        RestaurantMembership::create(['user_id' => $userB->id, 'restaurant_id' => $restoB->id, 'role' => 'owner']);
        $branchB = Branch::create(['restaurant_id' => $restoB->id, 'name' => 'Cabang B', 'slug' => 'cabang-b']);
        $tableB = Table::create(['restaurant_id' => $restoB->id, 'branch_id' => $branchB->id, 'name' => 'T2', 'qr_token' => 't2']);

        $orderB = Order::create([
            'order_number' => 'ORD-B1',
            'restaurant_id' => $restoB->id,
            'branch_id' => $branchB->id,
            'table_id' => $tableB->id,
            'status' => 'completed',
            'payment_status' => 'paid',
            'subtotal' => 800000,
            'total_amount' => 800000,
        ]);

        // Request as Tenant A
        $this->app['auth']->forgetGuards();
        $tokenA = $userA->createToken('token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->getJson('/api/analytics/overview');

        $response->assertStatus(200)
            ->assertJsonPath('summary.total_revenue', 150000)
            ->assertJsonPath('summary.total_orders', 1);

        // Ensure Tenant B revenue was NOT leaked
        $this->assertNotEquals(950000, $response->json('summary.total_revenue'));
    }

    public function test_super_admin_overview(): void
    {
        $admin = User::factory()->create();
        $resto = Restaurant::create(['name' => 'Resto Premium', 'slug' => 'resto-premium']);
        $pkg = Package::create([
            'name' => 'Professional',
            'slug' => 'professional',
            'price_monthly' => 299000,
            'price_yearly' => 2990000,
            'features' => ['kds' => true],
        ]);
        Subscription::create([
            'restaurant_id' => $resto->id,
            'package_id' => $pkg->id,
            'status' => 'active',
            'amount' => 299000,
            'starts_at' => now(),
            'expires_at' => now()->addMonth(),
        ]);

        $token = $admin->createToken('token')->plainTextToken;
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/super-admin/overview');

        $response->assertStatus(200)
            ->assertJsonPath('metrics.active_subscriptions', 1)
            ->assertJsonPath('metrics.monthly_recurring_revenue', 299000);
    }
}
