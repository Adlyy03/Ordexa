<?php

use App\Modules\Tenant\Controllers\RestaurantController;
use Illuminate\Support\Facades\Route;

Route::prefix('restaurant')->group(function () {
    Route::get('/current', [RestaurantController::class, 'current']);
    Route::put('/current', [RestaurantController::class, 'update']);
});
