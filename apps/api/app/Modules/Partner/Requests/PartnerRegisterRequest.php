<?php

namespace App\Modules\Partner\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PartnerRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_name' => ['nullable', 'string', 'max:100'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_account_name' => ['nullable', 'string', 'max:150'],
            'terms_accepted' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'terms_accepted.required' => 'Anda wajib menyetujui syarat dan ketentuan Program Mitra.',
            'terms_accepted.accepted' => 'Anda wajib menyetujui syarat dan ketentuan Program Mitra.',
        ];
    }
}
