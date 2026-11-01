<?php

namespace App\Modules\Tenant\Traits;

use App\Modules\Tenant\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            $user = request()->user() ?? auth('sanctum')->user() ?? auth()->user();
            if ($user && empty($model->restaurant_id)) {
                if (method_exists($user, 'currentMembership')) {
                    $membership = $user->currentMembership();
                    if ($membership) {
                        $model->restaurant_id = $membership->restaurant_id;
                    }
                }
            }
        });
    }

    public function scopeForTenant(Builder $query, int $restaurantId): Builder
    {
        return $query->where($this->getTable().'.restaurant_id', $restaurantId);
    }
}
