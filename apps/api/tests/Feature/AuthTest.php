<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_restaurant(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Ahmad Dahlan',
            'email' => 'ahmad@restoenak.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'Resto Enak Nusantara',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'token',
                    'user' => ['id', 'name', 'email'],
                    'restaurant' => ['id', 'name', 'slug', 'subscription_status'],
                    'branch' => ['id', 'name', 'slug'],
                    'membership' => ['user_id', 'role', 'restaurant_id'],
                ],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'ahmad@restoenak.com']);
        $this->assertDatabaseHas('restaurants', ['name' => 'Resto Enak Nusantara']);
        $this->assertDatabaseHas('branches', ['name' => 'Cabang Utama']);
        $this->assertDatabaseHas('restaurant_memberships', [
            'role' => 'owner',
            'is_active' => true,
        ]);
    }

    public function test_registration_validation_rules(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
            'restaurant_name' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'restaurant_name']);
    }

    public function test_user_can_login_and_receive_token(): void
    {
        // First register
        $this->postJson('/api/auth/register', [
            'name' => 'Ahmad Dahlan',
            'email' => 'ahmad@restoenak.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'Resto Enak',
        ]);

        // Login
        $response = $this->postJson('/api/auth/login', [
            'email' => 'ahmad@restoenak.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'token',
                    'user' => ['id', 'name', 'email'],
                    'memberships',
                ],
            ]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@resto.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Email atau password salah.']);
    }

    public function test_me_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_access_me_and_logout(): void
    {
        $regResponse = $this->postJson('/api/auth/register', [
            'name' => 'Ahmad Dahlan',
            'email' => 'ahmad@restoenak.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'Resto Enak',
        ]);

        $token = $regResponse->json('data.token');

        // Test Me
        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.user.email', 'ahmad@restoenak.com');

        // Test Logout
        $logoutResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200)
            ->assertJson(['message' => 'Logout berhasil.']);

        // Verify token is revoked
        $meAfterLogout = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/me');

        $meAfterLogout->assertStatus(401);
    }
}
