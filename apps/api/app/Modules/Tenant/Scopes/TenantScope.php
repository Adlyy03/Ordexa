<?php

namespace App\Modules\Tenant\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $user = $this->resolveUser();

        // Console / CLI commands bypass (seeders, tinker, migrations) when no user is authenticated
        if (! $user && app()->runningInConsole()) {
            return;
        }

        // Super admin bypass
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('super_admin')) {
            return;
        }

        $restaurantId = $this->resolveRestaurantId($user);

        if ($restaurantId) {
            $builder->where($model->getTable().'.restaurant_id', $restaurantId);
        } else {
            $builder->whereRaw('1 = 0');
        }
    }

    private function resolveUser()
    {
        return request()->user() ?? auth('sanctum')->user() ?? auth()->user();
    }

    private function resolveRestaurantId($user): ?int
    {
        if (! $user) {
            return null;
        }

        if (method_exists($user, 'currentMembership')) {
            $membership = $user->currentMembership();

            return $membership?->restaurant_id;
        }

        return null;
    }
}
