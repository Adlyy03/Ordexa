<?php

namespace App\Modules\Partner\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'integer', 'min:10000'],
            'payout_provider' => ['required', 'string', 'max:100'],
            'payout_account_number' => ['required', 'string', 'max:50'],
            'payout_account_name' => ['required', 'string', 'max:150'],
            'payout_method' => ['nullable', 'string', 'in:bank_transfer,e_wallet'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'Jumlah penarikan wajib diisi.',
            'amount.integer' => 'Jumlah penarikan harus berupa angka.',
            'amount.min' => 'Jumlah penarikan minimal Rp 10.000.',
            'payout_provider.required' => 'Nama bank atau penyedia e-wallet wajib diisi.',
            'payout_account_number.required' => 'Nomor rekening wajib diisi.',
            'payout_account_name.required' => 'Nama pemilik rekening wajib diisi.',
        ];
    }
}
