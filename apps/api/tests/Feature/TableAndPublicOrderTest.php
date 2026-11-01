<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TableAndPublicOrderTest extends TestCase
{
    use RefreshDatabase;

    private string $token;
    private int $restaurantId;
    private string $restaurantSlug;
    private int $mainBranchId;
    private string $mainBranchSlug;

    protected function setUp(): void
    {
        parent::setUp();

        $res = $this->postJson('/api/auth/register', [
            'name' => 'Owner Resto',
            'email' => 'owner@sederhana.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'RM Sederhana',
        ]);

        $this->token = $res->json('data.token');
        $this->restaurantId = $res->json('data.restaurant.id');
        $this->restaurantSlug = $res->json('data.restaurant.slug');
        $this->mainBranchId = $res->json('data.branch.id');
        $this->mainBranchSlug = $res->json('data.branch.slug');

        $this->app['auth']->forgetGuards();
    }

    private function asTenant(string $token)
    {
        $this->app['auth']->forgetGuards();
        return $this->withHeader('Authorization', 'Bearer ' . $token);
    }

    public function test_can_create_table_with_auto_generated_qr_code(): void
    {
        $response = $this->asTenant($this->token)
            ->postJson('/api/tables', [
                'branch_id' => $this->mainBranchId,
                'name' => 'Meja VIP 01',
                'capacity' => 6,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Meja VIP 01')
            ->assertJsonPath('data.capacity', 6);

        $this->assertNotEmpty($response->json('data.qr_token'));
        $this->assertNotEmpty($response->json('data.qr_image_url'));
    }

    public function test_can_regenerate_table_qr_code(): void
    {
        $resCreate = $this->asTenant($this->token)
            ->postJson('/api/tables', [
                'branch_id' => $this->mainBranchId,
                'name' => 'Meja 5',
            ]);

        $tableId = $resCreate->json('data.id');
        $oldToken = $resCreate->json('data.qr_token');

        $resRegen = $this->asTenant($this->token)
            ->postJson("/api/tables/{$tableId}/regenerate-qr");

        $resRegen->assertStatus(200);
        $newToken = $resRegen->json('data.qr_token');

        $this->assertNotEquals($oldToken, $newToken);
    }

    public function test_customer_can_access_public_menu_via_qr_url(): void
    {
        // 1. Create Category & Items
        $cat = $this->asTenant($this->token)
            ->postJson('/api/menu/categories', ['name' => 'Makanan Padang'])
            ->json('data');

        $item1 = $this->asTenant($this->token)
            ->postJson('/api/menu/items', [
                'menu_category_id' => $cat['id'],
                'name' => 'Ayam Pop',
                'price' => 22000,
            ])->json('data');

        // 2. Create Table
        $table = $this->asTenant($this->token)
            ->postJson('/api/tables', [
                'branch_id' => $this->mainBranchId,
                'name' => 'Meja 12',
            ])->json('data');

        $qrToken = $table['qr_token'];

        // 3. Customer accesses public ordering API without login
        $this->app['auth']->forgetGuards();

        $response = $this->getJson("/api/public/r/{$this->restaurantSlug}/{$this->mainBranchSlug}/{$qrToken}");

        $response->assertStatus(200)
            ->assertJsonPath('data.restaurant.name', 'RM Sederhana')
            ->assertJsonPath('data.branch.name', 'Cabang Utama')
            ->assertJsonPath('data.table.name', 'Meja 12')
            ->assertJsonCount(1, 'data.categories')
            ->assertJsonCount(1, 'data.categories.0.items');

        $this->assertEquals('Ayam Pop', $response->json('data.categories.0.items.0.name'));
    }

    public function test_public_menu_returns_404_on_invalid_qr_token(): void
    {
        $response = $this->getJson("/api/public/r/{$this->restaurantSlug}/{$this->mainBranchSlug}/invalid-uuid-token");

        $response->assertStatus(404);
    }
}
