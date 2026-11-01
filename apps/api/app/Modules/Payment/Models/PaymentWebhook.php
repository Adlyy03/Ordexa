<?php

namespace App\Modules\Payment\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentWebhook extends Model
{
    protected $fillable = [
        'gateway',
        'event_type',
        'idempotency_key',
        'payload',
        'is_processed',
        'error_message',
    ];

    protected $casts = [
        'payload' => 'array',
        'is_processed' => 'boolean',
    ];
}
