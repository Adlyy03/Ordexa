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

class OrderStatusUpdatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Order $order,
        public string $previousStatus
    ) {
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
        return 'order.status_updated';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'previous_status' => $this->previousStatus,
            'new_status' => $this->order->status,
            'table_number' => $this->order->table?->name,
            'updated_at' => $this->order->updated_at->toISOString(),
        ];
    }
}
