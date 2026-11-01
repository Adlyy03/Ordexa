<?php

namespace App\Modules\Partner\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePartnerSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'commission_type' => ['sometimes', 'in:percentage,fixed'],
            'commission_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'fixed_amount' => ['sometimes', 'integer', 'min:0'],
            'is_recurring' => ['sometimes', 'boolean'],
            'commission_duration_months' => ['sometimes', 'integer', 'min:0'],
            'minimum_withdrawal' => ['sometimes', 'integer', 'min:1000'],
            'attribution_days' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
