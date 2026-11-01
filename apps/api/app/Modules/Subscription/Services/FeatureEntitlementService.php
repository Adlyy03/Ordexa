<?php

namespace App\Modules\Subscription\Services;

use App\Modules\Tenant\Models\Restaurant;

class FeatureEntitlementService
{
    private const FEATURE_REQUIREMENTS = [
        // Starter
        'qr_ordering' => 'starter',
        'menu_management' => 'starter',
        'table_management' => 'starter',
        'order_management' => 'starter',
        'kitchen_display' => 'starter',
        'basic_reports' => 'starter',
        'multi_branch' => 'starter',

        // Professional
        'pos_cashier' => 'professional',
        'employee_management' => 'professional',
        'inventory' => 'professional',
        'promotions' => 'professional',
        'advanced_analytics' => 'professional',
        'branch_performance' => 'professional',
        'export_reports' => 'professional',

        // Enterprise
        'custom_branding' => 'enterprise',
        'supplier_management' => 'enterprise',
        'centralized_menu' => 'enterprise',
        'advanced_inventory' => 'enterprise',
        'cross_branch_stock' => 'enterprise',
        'api_integration' => 'enterprise',
        'audit_logs' => 'enterprise',
        'priority_support' => 'enterprise',
    ];

    private const PACKAGE_HIERARCHY = [
        'starter' => 1,
        'professional' => 2,
        'enterprise' => 3,
    ];

    public function can(Restaurant $restaurant, string $feature): bool
    {
        $subscription = $restaurant->activeSubscription;

        if (! $subscription || $subscription->status !== 'active') {
            // Grace period: allow basic operations only
            if ($subscription?->status === 'grace_period') {
                return in_array($feature, ['qr_ordering', 'menu_management', 'order_management'], true);
            }
            return false;
        }

        $package = $subscription->package;
        if (! $package) {
            return false;
        }

        // Direct features array check
        if (is_array($package->features) && in_array($feature, $package->features, true)) {
            return true;
        }

        // Tier hierarchy fallback
        $requiredTier = self::FEATURE_REQUIREMENTS[$feature] ?? null;
        if (! $requiredTier) {
            return false;
        }

        $packageTierLevel = self::PACKAGE_HIERARCHY[$package->slug] ?? 0;
        $requiredTierLevel = self::PACKAGE_HIERARCHY[$requiredTier] ?? 99;

        return $packageTierLevel >= $requiredTierLevel;
    }
}
