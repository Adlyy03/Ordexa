<?php

use App\Modules\Menu\Controllers\MediaController;
use App\Modules\Menu\Controllers\MenuCategoryController;
use App\Modules\Menu\Controllers\MenuItemController;
use Illuminate\Support\Facades\Route;

// Protected Menu routes
Route::prefix('menu')->group(function () {
    Route::apiResource('categories', MenuCategoryController::class);
    Route::apiResource('items', MenuItemController::class);
    Route::post('items/{item}/branch-availability', [MenuItemController::class, 'toggleBranchAvailability']);

    // Media upload
    Route::get('presign-upload', [MediaController::class, 'presign']);
    Route::post('upload', [MediaController::class, 'upload']);
});
