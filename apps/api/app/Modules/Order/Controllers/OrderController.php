<?php

namespace App\Modules\Order\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Branch\Models\Branch;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Services\OrderService;
use App\Modules\Table\Models\Table;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    /**
     * Customer QR Ordering public checkout
     */
    public function storePublic(Request $request, string $restaurantSlug, string $branchSlug, string $tableCode): JsonResponse
    {
        $restaurant = Restaurant::where('slug', $restaurantSlug)->first();
        if (! $restaurant) {
            return response()->json(['message' => 'Restaurant not found'], 404);
        }

        $branch = Branch::withoutGlobalScopes()
            ->where('restaurant_id', $restaurant->id)
            ->where('slug', $branchSlug)
            ->first();
        if (! $branch) {
            return response()->json(['message' => 'Branch not found'], 404);
        }

        $table = Table::withoutGlobalScopes()
            ->where('branch_id', $branch->id)
            ->where(function ($q) use ($tableCode) {
                $q->where('name', $tableCode)
                    ->orWhere('qr_token', $tableCode);
            })
            ->first();
        if (! $table) {
            return response()->json(['message' => 'Table not found'], 404);
        }

        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1|max:50',
            'items.*.variant' => 'nullable|string|max:50',
            'items.*.notes' => 'nullable|string|max:200',
        ]);

        try {
            $order = $this->orderService->createFromQR($table, $validated);

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'total_amount' => $order->total_amount,
                    'subtotal' => $order->subtotal,
                    'table_number' => $table->name,
                    'items' => $order->items,
                    'created_at' => $order->created_at->toISOString(),
                ],
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * List orders for KDS / POS (scoped to user's branch or restaurant)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['table', 'items']);

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->query('branch_id'));
        }

        if ($request->has('status')) {
            $statuses = explode(',', $request->query('status'));
            $query->whereIn('status', $statuses);
        }

        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->query('payment_status'));
        }

        if ($request->has('order_type')) {
            $query->where('order_type', $request->query('order_type'));
        }

        $orders = $query->latest()->paginate($request->query('per_page', 25));

        return response()->json($orders);
    }

    /**
     * Get specific order details
     */
    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['table', 'items', 'branch']));
    }

    /**
     * Update order operational status (Kitchen / Cashier)
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:confirmed,preparing,ready,completed,cancelled',
        ]);

        try {
            $updated = $this->orderService->updateStatus($order, $validated['status']);

            return response()->json([
                'message' => "Status pesanan berhasil diubah menjadi {$validated['status']}",
                'order' => $updated,
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Create order from Cashier POS
     */
    public function storePOS(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|integer',
            'table_id' => 'required|integer',
            'customer_name' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1|max:50',
            'items.*.variant' => 'nullable|string|max:50',
            'items.*.notes' => 'nullable|string|max:200',
        ]);

        $branch = Branch::findOrFail($validated['branch_id']);
        $table = Table::where('branch_id', $branch->id)->findOrFail($validated['table_id']);

        try {
            $order = $this->orderService->createFromPOS($branch, $table, $validated);

            return response()->json([
                'message' => 'Pesanan POS berhasil dibuat',
                'order' => $order,
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
