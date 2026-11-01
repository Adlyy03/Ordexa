<?php

namespace Database\Seeders;

use App\Modules\Subscription\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'price_monthly' => 149000,
                'price_yearly' => 1490000,
                'features' => [
                    'qr_ordering',
                    'menu_management',
                    'table_management',
                    'order_management',
                    'kitchen_display',
                    'basic_reports',
                    'multi_branch',
                ],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'price_monthly' => 349000,
                'price_yearly' => 3490000,
                'features' => [
                    'qr_ordering',
                    'menu_management',
                    'table_management',
                    'order_management',
                    'kitchen_display',
                    'basic_reports',
                    'multi_branch',
                    'pos_cashier',
                    'employee_management',
                    'inventory',
                    'promotions',
                    'advanced_analytics',
                    'branch_performance',
                    'export_reports',
                ],
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'price_monthly' => 799000,
                'price_yearly' => 7990000,
                'features' => [
                    'qr_ordering',
                    'menu_management',
                    'table_management',
                    'order_management',
                    'kitchen_display',
                    'basic_reports',
                    'multi_branch',
                    'pos_cashier',
                    'employee_management',
                    'inventory',
                    'promotions',
                    'advanced_analytics',
                    'branch_performance',
                    'export_reports',
                    'custom_branding',
                    'supplier_management',
                    'centralized_menu',
                    'advanced_inventory',
                    'cross_branch_stock',
                    'api_integration',
                    'audit_logs',
                    'priority_support',
                ],
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($packages as $pkg) {
            Package::updateOrCreate(
                ['slug' => $pkg['slug']],
                $pkg
            );
        }
    }
}
