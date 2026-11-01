<?php

namespace App\Modules\Order\Services;

use App\Modules\Branch\Models\Branch;
use App\Modules\Menu\Models\MenuItem;
use App\Modules\Order\Events\OrderCreatedEvent;
use App\Modules\Order\Events\OrderStatusUpdatedEvent;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Table\Models\Table;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class OrderService
{
    protected const VALID_TRANSITIONS = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['preparing', 'cancelled'],
        'preparing' => ['ready', 'cancelled'],
        'ready' => ['completed'],
        'completed' => [],
        'cancelled' => [],
    ];

    /**
     * Create an order from customer QR scan
     */
    public function createFromQR(Table $table, array $data): Order
    {
        return $this->processOrderCreation(
            restaurantId: $table->restaurant_id,
            branchId: $table->branch_id,
            tableId: $table->id,
            orderType: 'qr_order',
            customerName: $data['customer_name'] ?? 'Guest',
            notes: $data['notes'] ?? null,
            items: $data['items']
        );
    }

    /**
     * Create an order from Cashier POS
     */
    public function createFromPOS(Branch $branch, Table $table, array $data): Order
    {
        return $this->processOrderCreation(
            restaurantId: $branch->restaurant_id,
            branchId: $branch->id,
            tableId: $table->id,
            orderType: 'pos_order',
            customerName: $data['customer_name'] ?? 'POS Customer',
            notes: $data['notes'] ?? null,
            items: $data['items']
        );
    }

    /**
     * Core atomic order creation with server-side price calculation
     */
    protected function processOrderCreation(
        int $restaurantId,
        int $branchId,
        int $tableId,
        string $orderType,
        string $customerName,
        ?string $notes,
        array $items
    ): Order {
        if (empty($items)) {
            throw new InvalidArgumentException('Order must contain at least one item');
        }

        return DB::transaction(function () use (
            $restaurantId,
            $branchId,
            $tableId,
            $orderType,
            $customerName,
            $notes,
            $items
        ) {
            // Fetch verified menu items from DB to prevent price tampering
            $menuItemIds = collect($items)->pluck('menu_item_id')->unique();
            $menuItems = MenuItem::withoutGlobalScopes()
                ->whereIn('id', $menuItemIds)
                ->where('restaurant_id', $restaurantId)
                ->where('is_available', true)
                ->get()
                ->keyBy('id');

            if ($menuItems->count() !== $menuItemIds->count()) {
                throw new InvalidArgumentException('One or more selected menu items are unavailable or invalid');
            }

            $orderNumber = $this->generateOrderNumber();
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($items as $item) {
                $menuItem = $menuItems->get($item['menu_item_id']);
                $quantity = max(1, (int) $item['quantity']);
                $itemSubtotal = $menuItem->price * $quantity;
                $subtotal += $itemSubtotal;

                $orderItemsData[] = [
                    'menu_item_id' => $menuItem->id,
                    'name' => $menuItem->name,
                    'price' => $menuItem->price,
                    'variant' => $item['variant'] ?? null,
                    'quantity' => $quantity,
                    'notes' => $item['notes'] ?? null,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $discount = 0;
            $totalAmount = max(0, $subtotal - $discount);

            $order = Order::withoutGlobalScopes()->create([
                'order_number' => $orderNumber,
                'restaurant_id' => $restaurantId,
                'branch_id' => $branchId,
                'table_id' => $tableId,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'order_type' => $orderType,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total_amount' => $totalAmount,
                'notes' => $notes,
                'customer_name' => $customerName,
            ]);

            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);
            }

            $order->setRelation('table', Table::withoutGlobalScopes()->find($tableId));
            $order->setRelation('items', OrderItem::where('order_id', $order->id)->get());

            // Realtime notification to KDS and POS stations
            try {
                OrderCreatedEvent::dispatch($order);
            } catch (\Throwable $e) {
                // If broadcasting driver encounters issues during offline/testing, don't abort transaction
                report($e);
            }

            return $order;
        });
    }

    /**
     * Transition order status safely
     */
    public function updateStatus(Order $order, string $newStatus): Order
    {
        $currentStatus = $order->status;
        $allowed = self::VALID_TRANSITIONS[$currentStatus] ?? [];

        if (! in_array($newStatus, $allowed, true)) {
            throw new InvalidArgumentException(
                "Invalid state transition from '{$currentStatus}' to '{$newStatus}'"
            );
        }

        $order->update(['status' => $newStatus]);

        try {
            OrderStatusUpdatedEvent::dispatch($order, $currentStatus);
        } catch (\Throwable $e) {
            report($e);
        }

        return $order->fresh(['table', 'items']);
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Order $order, string $paymentStatus): Order
    {
        $validStatuses = ['unpaid', 'pending', 'paid', 'failed', 'expired'];
        if (! in_array($paymentStatus, $validStatuses, true)) {
            throw new InvalidArgumentException("Invalid payment status '{$paymentStatus}'");
        }

        $order->update(['payment_status' => $paymentStatus]);

        // If paid, auto-confirm if still pending
        if ($paymentStatus === 'paid' && $order->status === 'pending') {
            $this->updateStatus($order, 'confirmed');
        }

        return $order->fresh();
    }

    protected function generateOrderNumber(): string
    {
        $prefix = 'ORD-'.date('Ymd');
        $random = strtoupper(Str::random(4));

        return "{$prefix}-{$random}";
    }
}
