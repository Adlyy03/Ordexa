<?php

namespace Tests\Feature;

use App\Models\RestaurantMembership;
use App\Models\User;
use App\Modules\Branch\Models\Branch;
use App\Modules\Menu\Models\MenuCategory;
use App\Modules\Menu\Models\MenuItem;
use App\Modules\Order\Events\OrderCreatedEvent;
use App\Modules\Order\Events\OrderStatusUpdatedEvent;
use App\Modules\Order\Models\Order;
use App\Modules\Table\Models\Table;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class OrderLifecycleTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected Restaurant $restaurant;
    protected Branch $branch;
    protected Table $table;
    protected MenuItem $menuItem;

    protected function setUp(): void
    {
        parent::setUp();
        Event::fake([OrderCreatedEvent::class, OrderStatusUpdatedEvent::class]);

        $this->owner = User::factory()->create();
        $this->restaurant = Restaurant::create([
            'name' => 'Waroeng Padang Enak',
            'slug' => 'waroeng-padang-enak',
            'subscription_status' => 'active',
        ]);
        RestaurantMembership::create([
            'user_id' => $this->owner->id,
            'restaurant_id' => $this->restaurant->id,
            'role' => 'owner',
        ]);
        $this->branch = Branch::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Cabang Sudirman',
            'slug' => 'cabang-sudirman',
        ]);
        $this->table = Table::create([
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $this->branch->id,
            'name' => 'T-01',
            'qr_token' => 'qr-token-test-123',
        ]);
        $category = MenuCategory::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Makanan Utama',
            'sort_order' => 1,
        ]);
        $this->menuItem = MenuItem::create([
            'restaurant_id' => $this->restaurant->id,
            'menu_category_id' => $category->id,
            'name' => 'Rendang Sapi Spesial',
            'price' => 35000,
            'is_available' => true,
        ]);
    }

    public function test_customer_can_create_order_via_qr_endpoint(): void
    {
        $response = $this->postJson(
            "/api/public/r/{$this->restaurant->slug}/{$this->branch->slug}/{$this->table->name}/order",
            [
                'customer_name' => 'Budi Santoso',
                'notes' => 'Tolong kuah gulainya dipisah',
                'items' => [
                    [
                        'menu_item_id' => $this->menuItem->id,
                        'quantity' => 2,
                        'variant' => 'Pedas Sedang',
                        'notes' => 'Banyakin kuah',
                    ],
                ],
            ]
        );

        $response->assertStatus(201)
            ->assertJsonPath('order.customer_name', 'Budi Santoso')
            ->assertJsonPath('order.status', 'pending')
            ->assertJsonPath('order.payment_status', 'unpaid')
            ->assertJsonPath('order.total_amount', 70000) // 35,000 * 2
            ->assertJsonPath('order.subtotal', 70000);

        $this->assertDatabaseHas('orders', [
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $this->branch->id,
            'table_id' => $this->table->id,
            'total_amount' => 70000,
            'customer_name' => 'Budi Santoso',
        ]);

        $this->assertDatabaseHas('order_items', [
            'menu_item_id' => $this->menuItem->id,
            'quantity' => 2,
            'price' => 35000,
            'subtotal' => 70000,
        ]);

        Event::assertDispatched(OrderCreatedEvent::class);
    }

    public function test_order_status_lifecycle_transitions(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-20261101-TEST',
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $this->branch->id,
            'table_id' => $this->table->id,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'order_type' => 'qr_order',
            'subtotal' => 35000,
            'discount' => 0,
            'total_amount' => 35000,
        ]);

        $token = $this->owner->createToken('auth-token')->plainTextToken;

        // 1. Pending -> Confirmed
        $res = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/orders/{$order->id}/status", ['status' => 'confirmed']);
        $res->assertStatus(200)->assertJsonPath('order.status', 'confirmed');

        // 2. Confirmed -> Preparing
        $res = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/orders/{$order->id}/status", ['status' => 'preparing']);
        $res->assertStatus(200)->assertJsonPath('order.status', 'preparing');

        // 3. Preparing -> Ready
        $res = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/orders/{$order->id}/status", ['status' => 'ready']);
        $res->assertStatus(200)->assertJsonPath('order.status', 'ready');

        // 4. Ready -> Completed
        $res = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/orders/{$order->id}/status", ['status' => 'completed']);
        $res->assertStatus(200)->assertJsonPath('order.status', 'completed');

        Event::assertDispatched(OrderStatusUpdatedEvent::class);
    }

    public function test_invalid_status_transition_is_rejected(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-20261101-INVALID',
            'restaurant_id' => $this->restaurant->id,
            'branch_id' => $this->branch->id,
            'table_id' => $this->table->id,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'order_type' => 'qr_order',
            'subtotal' => 35000,
            'discount' => 0,
            'total_amount' => 35000,
        ]);

        $token = $this->owner->createToken('auth-token')->plainTextToken;

        // Invalid: pending directly to completed
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/orders/{$order->id}/status", ['status' => 'completed']);

        $response->assertStatus(422);
    }

    public function test_tenant_isolation_on_orders(): void
    {
        // Create another tenant
        $otherOwner = User::factory()->create();
        $otherRestaurant = Restaurant::create([
            'name' => 'Restoran Lain',
            'slug' => 'restoran-lain',
            'subscription_status' => 'active',
        ]);
        RestaurantMembership::create([
            'user_id' => $otherOwner->id,
            'restaurant_id' => $otherRestaurant->id,
            'role' => 'owner',
        ]);
        $otherBranch = Branch::create([
            'restaurant_id' => $otherRestaurant->id,
            'name' => 'Cabang Lain',
            'slug' => 'cabang-lain',
        ]);
        $otherTable = Table::create([
            'restaurant_id' => $otherRestaurant->id,
            'branch_id' => $otherBranch->id,
            'name' => 'L-01',
            'qr_token' => 'qr-other-123',
        ]);
        $otherOrder = Order::create([
            'order_number' => 'ORD-20261101-OTHER',
            'restaurant_id' => $otherRestaurant->id,
            'branch_id' => $otherBranch->id,
            'table_id' => $otherTable->id,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'order_type' => 'qr_order',
            'subtotal' => 50000,
            'discount' => 0,
            'total_amount' => 50000,
        ]);

        $this->app['auth']->forgetGuards();

        // User A logs in
        $tokenA = $this->owner->createToken('token-a')->plainTextToken;

        // Should NOT see other order in list
        $response = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->getJson('/api/orders');
        $response->assertStatus(200);
        $orderIds = collect($response->json('data'))->pluck('id')->all();
        $this->assertNotContains($otherOrder->id, $orderIds);

        // Should get 404 when directly accessing other tenant's order
        $response = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->getJson("/api/orders/{$otherOrder->id}");
        $response->assertStatus(404);
    }
}
