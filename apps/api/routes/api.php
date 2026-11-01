<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'app' => 'Ordexa API',
    'version' => '1.0.0',
    'timestamp' => now()->toIso8601String(),
]));

// Auth routes (public & sanctum)
require __DIR__.'/../app/Modules/Auth/routes.php';

// Customer Public QR Ordering (zero login)
Route::get('/public/r/{restaurant_slug}/{branch_slug}/{table_token}', [App\Modules\Order\Controllers\PublicOrderController::class, 'getMenu']);
Route::post('/public/r/{restaurant_slug}/{branch_slug}/{table_code}/order', [App\Modules\Order\Controllers\OrderController::class, 'storePublic']);

// Protected API routes
Route::middleware(['auth:sanctum'])->group(function () {
    if (file_exists(__DIR__.'/../app/Modules/Tenant/routes.php')) {
        require __DIR__.'/../app/Modules/Tenant/routes.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Branch/routes.php')) {
        require __DIR__.'/../app/Modules/Branch/routes.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Subscription/routes.php')) {
        require __DIR__.'/../app/Modules/Subscription/routes.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Menu/routes.php')) {
        require __DIR__.'/../app/Modules/Menu/routes.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Table/routes.php')) {
        require __DIR__.'/../app/Modules/Table/routes.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Order/routes.php')) {
        require __DIR__.'/../app/Modules/Order/routes.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/KDS/routes.php')) {
        require __DIR__.'/../app/Modules/KDS/routes.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/POS/routes.php')) {
        require __DIR__.'/../app/Modules/POS/routes.php';
    }
});

// Webhook routes
if (file_exists(__DIR__.'/webhooks.php')) {
    require __DIR__.'/webhooks.php';
}
