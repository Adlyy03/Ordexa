<?php

namespace App\Modules\Tenant\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Branch\Models\Branch;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Subscription\Models\Subscription;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Restaurant Owner Analytics & Business Metrics
     */
    public function restaurantOverview(Request $request): JsonResponse
    {
        // Automatically scoped to tenant via TenantScope
        $ordersQuery = Order::query();

        if ($request->has('branch_id')) {
            $ordersQuery->where('branch_id', $request->query('branch_id'));
        }

        $totalOrders = (clone $ordersQuery)->count();
        $paidOrdersQuery = (clone $ordersQuery)->where('payment_status', 'paid');
        $totalRevenue = (int) $paidOrdersQuery->sum('total_amount');
        $paidOrdersCount = $paidOrdersQuery->count();
        $averageOrderValue = $paidOrdersCount > 0 ? (int) round($totalRevenue / $paidOrdersCount) : 0;

        // Breakdown orders by status
        $statusCounts = (clone $ordersQuery)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        // Revenue by Branch
        $branches = Branch::select('id', 'name')->get();
        $revenueByBranch = $branches->map(function ($branch) {
            $rev = Order::withoutGlobalScopes()
                ->where('branch_id', $branch->id)
                ->where('payment_status', 'paid')
                ->sum('total_amount');
            $ordersCount = Order::withoutGlobalScopes()
                ->where('branch_id', $branch->id)
                ->count();

            return [
                'branch_id' => $branch->id,
                'branch_name' => $branch->name,
                'revenue' => (int) $rev,
                'orders_count' => $ordersCount,
            ];
        });

        // Top 5 selling items
        $topItems = OrderItem::select(
            'order_items.name',
            DB::raw('SUM(order_items.quantity) as total_qty'),
            DB::raw('SUM(order_items.subtotal) as total_sales')
        )
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->groupBy('order_items.name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        return response()->json([
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'paid_orders' => $paidOrdersCount,
                'average_order_value' => $averageOrderValue,
            ],
            'status_breakdown' => [
                'pending' => $statusCounts['pending'] ?? 0,
                'confirmed' => $statusCounts['confirmed'] ?? 0,
                'preparing' => $statusCounts['preparing'] ?? 0,
                'ready' => $statusCounts['ready'] ?? 0,
                'completed' => $statusCounts['completed'] ?? 0,
                'cancelled' => $statusCounts['cancelled'] ?? 0,
            ],
            'branch_breakdown' => $revenueByBranch,
            'top_items' => $topItems,
        ]);
    }

    /**
     * Platform Super Admin SaaS Overview
     */
    public function superAdminOverview(): JsonResponse
    {
        $totalRestaurants = Restaurant::count();
        $activeSubscriptions = Subscription::where('status', 'active')->count();

        // Calculate platform MRR
        $mrr = Subscription::where('status', 'active')
            ->join('packages', 'subscriptions.package_id', '=', 'packages.id')
            ->sum('packages.price_monthly');

        $totalGMV = (int) Order::withoutGlobalScopes()
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        $recentTenants = Restaurant::with(['subscriptions.package', 'branches'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($resto) => [
                'id' => $resto->id,
                'name' => $resto->name,
                'slug' => $resto->slug,
                'subscription_status' => $resto->subscription_status,
                'branches_count' => $resto->branches->count(),
                'active_package' => $resto->subscriptions->where('status', 'active')->first()?->package?->name ?? 'Free / None',
                'created_at' => $resto->created_at->toISOString(),
            ]);

        return response()->json([
            'metrics' => [
                'total_restaurants' => $totalRestaurants,
                'active_subscriptions' => $activeSubscriptions,
                'monthly_recurring_revenue' => (int) $mrr,
                'platform_gmv' => $totalGMV,
            ],
            'recent_tenants' => $recentTenants,
        ]);
    }
}
