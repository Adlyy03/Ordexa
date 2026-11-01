<?php

namespace App\Modules\Partner\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustCommissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'partner_id' => ['required', 'exists:partners,id'],
            'amount' => ['required', 'integer'],
            'reason' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'partner_id.required' => 'Mitra wajib dipilih.',
            'amount.required' => 'Nominal penyesuaian wajib diisi.',
            'reason.required' => 'Alasan penyesuaian wajib diisi.',
        ];
    }
}
