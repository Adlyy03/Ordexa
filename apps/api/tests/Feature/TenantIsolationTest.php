<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private string $tokenA;
    private int $restaurantIdA;

    private string $tokenB;
    private int $restaurantIdB;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Setup Tenant A
        $resA = $this->postJson('/api/auth/register', [
            'name' => 'Owner Tenant A',
            'email' => 'tenantA@restaurant.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'Restaurant Alpha',
        ]);
        $this->tokenA = $resA->json('data.token');
        $this->restaurantIdA = $resA->json('data.restaurant.id');

        $this->app['auth']->forgetGuards();

        // 2. Setup Tenant B
        $resB = $this->postJson('/api/auth/register', [
            'name' => 'Owner Tenant B',
            'email' => 'tenantB@restaurant.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'Restaurant Beta',
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

    public function test_tenant_a_cannot_see_tenant_b_branches(): void
    {
        // Tenant A creates 2 additional branches
        $this->asTenant($this->tokenA)
            ->postJson('/api/branches', ['name' => 'Alpha Branch Senopati'])
            ->assertStatus(201);

        $this->asTenant($this->tokenA)
            ->postJson('/api/branches', ['name' => 'Alpha Branch Kemang'])
            ->assertStatus(201);

        // Tenant B creates 1 additional branch
        $resBranchB = $this->asTenant($this->tokenB)
            ->postJson('/api/branches', ['name' => 'Beta Branch PIK']);
        $resBranchB->assertStatus(201);
        $branchBId = $resBranchB->json('data.id');

        // Tenant A lists branches: Must see 3 branches (1 default + 2 added), 0 from Tenant B
        $listA = $this->asTenant($this->tokenA)
            ->getJson('/api/branches')
            ->assertStatus(200);

        $branchesA = $listA->json('data');
        $this->assertCount(3, $branchesA);
        foreach ($branchesA as $branch) {
            $this->assertEquals($this->restaurantIdA, $branch['restaurant_id']);
            $this->assertNotEquals('Beta Branch PIK', $branch['name']);
        }

        // Tenant B lists branches: Must see 2 branches (1 default + 1 added), 0 from Tenant A
        $listB = $this->asTenant($this->tokenB)
            ->getJson('/api/branches')
            ->assertStatus(200);

        $branchesB = $listB->json('data');
        $this->assertCount(2, $branchesB);
        foreach ($branchesB as $branch) {
            $this->assertEquals($this->restaurantIdB, $branch['restaurant_id']);
            $this->assertNotEquals('Alpha Branch Senopati', $branch['name']);
            $this->assertNotEquals('Alpha Branch Kemang', $branch['name']);
        }
    }

    public function test_tenant_a_cannot_access_tenant_b_branch_by_id(): void
    {
        // Create branch under Tenant B
        $resBranchB = $this->asTenant($this->tokenB)
            ->postJson('/api/branches', ['name' => 'Beta Secret Branch']);
        $branchBId = $resBranchB->json('data.id');

        // Tenant A tries to GET Tenant B's branch -> Must return 404
        $this->asTenant($this->tokenA)
            ->getJson('/api/branches/' . $branchBId)
            ->assertStatus(404);

        // Tenant A tries to UPDATE Tenant B's branch -> Must return 404
        $this->asTenant($this->tokenA)
            ->putJson('/api/branches/' . $branchBId, ['name' => 'Hacked Name'])
            ->assertStatus(404);

        // Tenant A tries to DELETE Tenant B's branch -> Must return 404
        $this->asTenant($this->tokenA)
            ->deleteJson('/api/branches/' . $branchBId)
            ->assertStatus(404);
    }

    public function test_unlimited_branches_allowed(): void
    {
        // Guardrail 3: Unlimited branches on all tiers
        for ($i = 1; $i <= 5; $i++) {
            $this->asTenant($this->tokenA)
                ->postJson('/api/branches', ['name' => "Branch Number {$i}"])
                ->assertStatus(201);
        }

        $list = $this->asTenant($this->tokenA)
            ->getJson('/api/branches')
            ->assertStatus(200);

        // 1 default + 5 added = 6 branches
        $this->assertCount(6, $list->json('data'));
    }
}
