<?php

namespace Tests\Feature;

use App\Models\RestaurantMembership;
use App\Models\User;
use App\Modules\Branch\Models\Branch;
use App\Modules\Menu\Models\MenuCategory;
use App\Modules\Menu\Models\MenuItem;
use App\Modules\Order\Models\Order;
use App\Modules\Table\Models\Table;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityLeakagePenetrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $tenantUserA;
    protected Restaurant $tenantA;
    protected Branch $branchA;

    protected User $attackerUserB;
    protected Restaurant $tenantB;
    protected Branch $branchB;
    protected Order $orderB;
    protected MenuItem $itemB;

    protected function setUp(): void
    {
        parent::setUp();

        // Victim Tenant A
        $this->tenantUserA = User::factory()->create();
        $this->tenantA = Restaurant::create(['name' => 'Resto Korban', 'slug' => 'resto-korban']);
        RestaurantMembership::create([
            'user_id' => $this->tenantUserA->id,
            'restaurant_id' => $this->tenantA->id,
            'role' => 'owner',
        ]);
        $this->branchA = Branch::create([
            'restaurant_id' => $this->tenantA->id,
            'name' => 'Cabang Korban',
            'slug' => 'cabang-korban',
        ]);

        // Attacker Tenant B
        $this->attackerUserB = User::factory()->create();
        $this->tenantB = Restaurant::create(['name' => 'Resto Hacker', 'slug' => 'resto-hacker']);
        RestaurantMembership::create([
            'user_id' => $this->attackerUserB->id,
            'restaurant_id' => $this->tenantB->id,
            'role' => 'owner',
        ]);
        $this->branchB = Branch::create([
            'restaurant_id' => $this->tenantB->id,
            'name' => 'Cabang Hacker',
            'slug' => 'cabang-hacker',
        ]);
        $tableB = Table::create([
            'restaurant_id' => $this->tenantB->id,
            'branch_id' => $this->branchB->id,
            'name' => 'HB-01',
            'qr_token' => 'hb-01-token',
        ]);
        $this->orderB = Order::create([
            'order_number' => 'ORD-SECRET-B',
            'restaurant_id' => $this->tenantB->id,
            'branch_id' => $this->branchB->id,
            'table_id' => $tableB->id,
            'status' => 'pending',
            'payment_status' => 'paid',
            'subtotal' => 999000,
            'total_amount' => 999000,
        ]);
        $catB = MenuCategory::create([
            'restaurant_id' => $this->tenantB->id,
            'name' => 'Kategori Rahasia',
            'sort_order' => 1,
        ]);
        $this->itemB = MenuItem::create([
            'restaurant_id' => $this->tenantB->id,
            'menu_category_id' => $catB->id,
            'name' => 'Menu Rahasia B',
            'price' => 500000,
            'is_available' => true,
        ]);
    }

    public function test_attacker_cannot_read_victim_order_by_id(): void
    {
        $this->app['auth']->forgetGuards();
        $attackerToken = $this->attackerUserB->createToken('hacker')->plainTextToken;

        // Create victim order
        $tableA = Table::create([
            'restaurant_id' => $this->tenantA->id,
            'branch_id' => $this->branchA->id,
            'name' => 'A-01',
            'qr_token' => 'a-01-token',
        ]);
        $victimOrder = Order::create([
            'order_number' => 'ORD-VICTIM-01',
            'restaurant_id' => $this->tenantA->id,
            'branch_id' => $this->branchA->id,
            'table_id' => $tableA->id,
            'status' => 'pending',
            'payment_status' => 'paid',
            'subtotal' => 250000,
            'total_amount' => 250000,
        ]);

        // Attacker attempts to read victim's order directly
        $response = $this->withHeader('Authorization', "Bearer {$attackerToken}")
            ->getJson("/api/orders/{$victimOrder->id}");

        $response->assertStatus(404);
    }

    public function test_attacker_cannot_tamper_victim_order_status(): void
    {
        $this->app['auth']->forgetGuards();
        $attackerToken = $this->attackerUserB->createToken('hacker')->plainTextToken;

        $tableA = Table::create([
            'restaurant_id' => $this->tenantA->id,
            'branch_id' => $this->branchA->id,
            'name' => 'A-02',
            'qr_token' => 'a-02-token',
        ]);
        $victimOrder = Order::create([
            'order_number' => 'ORD-VICTIM-02',
            'restaurant_id' => $this->tenantA->id,
            'branch_id' => $this->branchA->id,
            'table_id' => $tableA->id,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'subtotal' => 100000,
            'total_amount' => 100000,
        ]);

        // Attacker attempts to cancel victim's order
        $response = $this->withHeader('Authorization', "Bearer {$attackerToken}")
            ->patchJson("/api/orders/{$victimOrder->id}/status", ['status' => 'cancelled']);

        $response->assertStatus(404);

        // Verify status in DB remains untouched
        $this->assertDatabaseHas('orders', [
            'id' => $victimOrder->id,
            'status' => 'pending',
        ]);
    }

    public function test_attacker_cannot_inject_tenant_id_in_branch_creation(): void
    {
        $this->app['auth']->forgetGuards();
        $attackerToken = $this->attackerUserB->createToken('hacker')->plainTextToken;

        // Attacker attempts to create branch injecting victim's tenant_id
        $response = $this->withHeader('Authorization', "Bearer {$attackerToken}")
            ->postJson('/api/branches', [
                'name' => 'Cabang Injeksi Palsu',
                'address' => 'Jl. Cyber',
                'tenant_id' => $this->tenantA->id,
                'restaurant_id' => $this->tenantA->id,
            ]);

        $response->assertStatus(201);

        // Must be assigned to Attacker Tenant B, NOT victim Tenant A
        $this->assertDatabaseHas('branches', [
            'name' => 'Cabang Injeksi Palsu',
            'restaurant_id' => $this->tenantB->id,
        ]);

        $this->assertDatabaseMissing('branches', [
            'name' => 'Cabang Injeksi Palsu',
            'restaurant_id' => $this->tenantA->id,
        ]);
    }

    public function test_attacker_cannot_list_victim_menu_items(): void
    {
        $this->app['auth']->forgetGuards();
        $attackerToken = $this->attackerUserB->createToken('hacker')->plainTextToken;

        $catA = MenuCategory::create([
            'restaurant_id' => $this->tenantA->id,
            'name' => 'Kategori Korban',
            'sort_order' => 1,
        ]);
        $itemA = MenuItem::create([
            'restaurant_id' => $this->tenantA->id,
            'menu_category_id' => $catA->id,
            'name' => 'Menu Rahasia Korban',
            'price' => 75000,
            'is_available' => true,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$attackerToken}")
            ->getJson('/api/menu/categories');

        $response->assertStatus(200);

        // Attacker should only see their own category, never victim's
        $categoryNames = collect($response->json('data'))->pluck('name')->all();
        $this->assertNotContains('Kategori Korban', $categoryNames);
    }
}
