<?php

namespace App\Modules\Order\Events;

use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Table\Models\Table;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderCreatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order)
    {
        if (! $this->order->relationLoaded('table')) {
            $this->order->setRelation('table', Table::withoutGlobalScopes()->find($this->order->table_id));
        }
        if (! $this->order->relationLoaded('items')) {
            $this->order->setRelation('items', OrderItem::where('order_id', $this->order->id)->get());
        }
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("branch.{$this->order->branch_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.created';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'table_number' => $this->order->table?->name,
            'customer_name' => $this->order->customer_name,
            'status' => $this->order->status,
            'payment_status' => $this->order->payment_status,
            'order_type' => $this->order->order_type,
            'total_amount' => $this->order->total_amount,
            'items_count' => $this->order->items->count(),
            'created_at' => $this->order->created_at->toISOString(),
            'items' => $this->order->items->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'variant' => $item->variant,
                'quantity' => $item->quantity,
                'notes' => $item->notes,
                'price' => $item->price,
                'subtotal' => $item->subtotal,
            ]),
        ];
    }
}
