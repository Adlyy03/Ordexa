<?php

namespace App\Modules\Tenant\Models;

use App\Models\RestaurantMembership;
use App\Modules\Branch\Models\Branch;
use App\Modules\Subscription\Models\Subscription;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Restaurant extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'logo_url',
        'description',
        'address',
        'phone',
        'email',
        'operational_hours',
        'subscription_status',
    ];

    protected $casts = [
        'operational_hours' => 'array',
    ];

    public function memberships(): HasMany
    {
        return $this->hasMany(RestaurantMembership::class);
    }

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->latestOfMany();
    }

    public function hasFeature(string $feature): bool
    {
        $subscription = $this->activeSubscription;
        if (! $subscription || ! $subscription->package) {
            return false;
        }

        $features = $subscription->package->features ?? [];

        return in_array($feature, $features, true);
    }
}
