<?php

namespace App\Modules\Order\Models;

use App\Modules\Branch\Models\Branch;
use App\Modules\Table\Models\Table;
use App\Modules\Tenant\Models\Restaurant;
use App\Modules\Tenant\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'order_number',
        'restaurant_id',
        'branch_id',
        'table_id',
        'status',
        'payment_status',
        'order_type',
        'subtotal',
        'discount',
        'total_amount',
        'notes',
        'customer_name',
    ];

    protected $casts = [
        'subtotal' => 'integer',
        'discount' => 'integer',
        'total_amount' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
