<?php

use App\Modules\Tenant\Controllers\AnalyticsController;
use App\Modules\Tenant\Controllers\RestaurantController;
use Illuminate\Support\Facades\Route;

Route::prefix('restaurant')->group(function () {
    Route::get('/current', [RestaurantController::class, 'current']);
    Route::put('/current', [RestaurantController::class, 'update']);
});

Route::prefix('analytics')->group(function () {
    Route::get('/overview', [AnalyticsController::class, 'restaurantOverview']);
});

Route::prefix('super-admin')->group(function () {
    Route::get('/overview', [AnalyticsController::class, 'superAdminOverview']);
});
