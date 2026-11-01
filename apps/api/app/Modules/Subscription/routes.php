<?php

use App\Modules\Subscription\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::prefix('subscriptions')->group(function () {
    Route::get('/packages', [SubscriptionController::class, 'packages']);
    Route::get('/current', [SubscriptionController::class, 'current']);
    Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
});
