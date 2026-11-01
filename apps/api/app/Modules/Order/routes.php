<?php

use App\Modules\Order\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::post('/pos', [OrderController::class, 'storePOS']);
    Route::get('/{order}', [OrderController::class, 'show']);
    Route::patch('/{order}/status', [OrderController::class, 'updateStatus']);
});
