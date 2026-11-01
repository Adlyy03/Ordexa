<?php

namespace App\Modules\Table\Models;

use App\Modules\Branch\Models\Branch;
use App\Modules\Tenant\Models\Restaurant;
use App\Modules\Tenant\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Table extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'name',
        'qr_token',
        'qr_image_url',
        'capacity',
        'is_active',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'is_active' => 'boolean',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
