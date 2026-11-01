<?php

use App\Modules\Table\Controllers\TableController;
use Illuminate\Support\Facades\Route;

Route::prefix('tables')->group(function () {
    Route::get('/', [TableController::class, 'index']);
    Route::post('/', [TableController::class, 'store']);
    Route::get('/{table}', [TableController::class, 'show']);
    Route::put('/{table}', [TableController::class, 'update']);
    Route::delete('/{table}', [TableController::class, 'destroy']);
    Route::post('/{table}/regenerate-qr', [TableController::class, 'regenerateQr']);
});
