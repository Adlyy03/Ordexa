<?php

namespace App\Modules\Partner\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerWithdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'amount',
        'payout_method',
        'payout_account_name',
        'payout_account_number',
        'payout_provider',
        'status',
        'admin_note',
        'payment_reference',
        'processed_by',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'processed_at' => 'datetime',
    ];

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
