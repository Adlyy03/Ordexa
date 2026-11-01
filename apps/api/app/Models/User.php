<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(RestaurantMembership::class);
    }

    public function currentMembership(): ?RestaurantMembership
    {
        $restaurantId = request()->header('X-Restaurant-Id')
            ?? session('current_restaurant_id');

        if (! $restaurantId) {
            return $this->memberships()
                ->where('role', 'owner')
                ->where('is_active', true)
                ->first()
                ?? $this->memberships()->where('is_active', true)->first();
        }

        return $this->memberships()
            ->where('restaurant_id', $restaurantId)
            ->where('is_active', true)
            ->first();
    }

    public function hasRole(string $role): bool
    {
        if ($role === 'super_admin') {
            return $this->email === config('app.super_admin_email', 'superadmin@ordexa.id');
        }

        return $this->currentMembership()?->role === $role;
    }
}
