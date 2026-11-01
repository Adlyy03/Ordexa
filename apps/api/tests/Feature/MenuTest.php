<?php

namespace Tests\Feature;

use App\Modules\Menu\Models\MenuCategory;
use App\Modules\Menu\Models\MenuItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuTest extends TestCase
{
    use RefreshDatabase;

    private string $tokenA;
    private int $restaurantIdA;

    private string $tokenB;
    private int $restaurantIdB;

    protected function setUp(): void
    {
        parent::setUp();

        $resA = $this->postJson('/api/auth/register', [
            'name' => 'Owner A',
            'email' => 'ownerA@resto.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'Resto A',
        ]);
        $this->tokenA = $resA->json('data.token');
        $this->restaurantIdA = $resA->json('data.restaurant.id');

        $this->app['auth']->forgetGuards();

        $resB = $this->postJson('/api/auth/register', [
            'name' => 'Owner B',
            'email' => 'ownerB@resto.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'Resto B',
        ]);
        $this->tokenB = $resB->json('data.token');
        $this->restaurantIdB = $resB->json('data.restaurant.id');

        $this->app['auth']->forgetGuards();
    }

    private function asTenant(string $token)
    {
        $this->app['auth']->forgetGuards();
        return $this->withHeader('Authorization', 'Bearer ' . $token);
    }

    public function test_can_create_menu_category_and_items(): void
    {
        // 1. Create Category
        $resCat = $this->asTenant($this->tokenA)
            ->postJson('/api/menu/categories', [
                'name' => 'Makanan Utama',
                'sort_order' => 1,
            ]);

        $resCat->assertStatus(201)
            ->assertJsonPath('data.name', 'Makanan Utama');
        $catId = $resCat->json('data.id');

        // 2. Create Menu Item with variants
        $resItem = $this->asTenant($this->tokenA)
            ->postJson('/api/menu/items', [
                'menu_category_id' => $catId,
                'name' => 'Rendang Sapi Spesial',
                'description' => 'Daging sapi pilihan dengan rempah Minang otentik',
                'price' => 35000,
                'variants' => [
                    ['name' => 'Porsi Normal', 'price_adjustment' => 0],
                    ['name' => 'Porsi Jumbo', 'price_adjustment' => 15000],
                ],
            ]);

        $resItem->assertStatus(201)
            ->assertJsonPath('data.name', 'Rendang Sapi Spesial')
            ->assertJsonPath('data.price', 35000);

        // 3. List Menu items
        $list = $this->asTenant($this->tokenA)
            ->getJson('/api/menu/items')
            ->assertStatus(200);

        $this->assertCount(1, $list->json('data'));
    }

    public function test_tenant_cannot_see_other_tenant_menu(): void
    {
        // Tenant A creates category and item
        $resCatA = $this->asTenant($this->tokenA)
            ->postJson('/api/menu/categories', ['name' => 'Menu Alpha']);
        $catAId = $resCatA->json('data.id');

        $this->asTenant($this->tokenA)
            ->postJson('/api/menu/items', [
                'menu_category_id' => $catAId,
                'name' => 'Nasi Goreng Alpha',
                'price' => 25000,
            ])->assertStatus(201);

        // Tenant B lists categories and items -> Must be empty
        $listCatB = $this->asTenant($this->tokenB)
            ->getJson('/api/menu/categories')
            ->assertStatus(200);
        $this->assertCount(0, $listCatB->json('data'));

        $listItemsB = $this->asTenant($this->tokenB)
            ->getJson('/api/menu/items')
            ->assertStatus(200);
        $this->assertCount(0, $listItemsB->json('data'));
    }

    public function test_can_toggle_branch_menu_availability(): void
    {
        // 1. Create Category & Item under Tenant A
        $cat = $this->asTenant($this->tokenA)
            ->postJson('/api/menu/categories', ['name' => 'Minuman'])
            ->json('data');

        $item = $this->asTenant($this->tokenA)
            ->postJson('/api/menu/items', [
                'menu_category_id' => $cat['id'],
                'name' => 'Es Teh Manis',
                'price' => 5000,
            ])->json('data');

        // 2. Create Branch 2 under Tenant A
        $branch2 = $this->asTenant($this->tokenA)
            ->postJson('/api/branches', ['name' => 'Cabang 2'])
            ->json('data');

        // 3. Disable item at Branch 2
        $this->asTenant($this->tokenA)
            ->postJson("/api/menu/items/{$item['id']}/branch-availability", [
                'branch_id' => $branch2['id'],
                'is_available' => false,
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.is_available', false);
    }

    public function test_can_request_presigned_upload_url(): void
    {
        $response = $this->asTenant($this->tokenA)
            ->getJson('/api/menu/presign-upload?folder=menu-items&extension=png');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'upload_url',
                    'file_key',
                    'public_url',
                ],
            ]);
    }
}
