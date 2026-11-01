<?php

use App\Modules\Payment\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('webhooks')->group(function () {
    Route::post('/xendit', [WebhookController::class, 'xendit'])->name('webhooks.xendit');
    Route::post('/midtrans', [WebhookController::class, 'midtrans'])->name('webhooks.midtrans');
});
