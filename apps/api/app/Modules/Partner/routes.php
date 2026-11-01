<?php

use App\Modules\Partner\Controllers\AdminCommissionController;
use App\Modules\Partner\Controllers\AdminPartnerController;
use App\Modules\Partner\Controllers\AdminPartnerSettingController;
use App\Modules\Partner\Controllers\AdminWithdrawalController;
use App\Modules\Partner\Controllers\PartnerController;
use Illuminate\Support\Facades\Route;

// Public referral code check
Route::get('/partner/public/validate-code/{code}', [PartnerController::class, 'validateCode']);

// Partner portal routes (authenticated)
Route::middleware(['auth:sanctum'])->prefix('partner')->group(function () {
    Route::post('/register', [PartnerController::class, 'register']);
    Route::get('/me', [PartnerController::class, 'me']);
    Route::get('/dashboard', [PartnerController::class, 'dashboard']);
    Route::get('/referrals', [PartnerController::class, 'referrals']);
    Route::get('/commissions', [PartnerController::class, 'commissions']);
    Route::get('/withdrawals', [PartnerController::class, 'withdrawals']);
    Route::post('/withdrawals', [PartnerController::class, 'requestWithdrawal']);
});

// Admin management routes (authenticated super-admin)
Route::middleware(['auth:sanctum'])->prefix('super-admin')->group(function () {
    // Partner Management
    Route::get('/partners', [AdminPartnerController::class, 'index']);
    Route::get('/partners/{partner}', [AdminPartnerController::class, 'show']);
    Route::post('/partners/{partner}/approve', [AdminPartnerController::class, 'approve']);
    Route::post('/partners/{partner}/reject', [AdminPartnerController::class, 'reject']);
    Route::post('/partners/{partner}/suspend', [AdminPartnerController::class, 'suspend']);
    Route::post('/partners/{partner}/reactivate', [AdminPartnerController::class, 'reactivate']);

    // Commission Management
    Route::get('/partner-commissions', [AdminCommissionController::class, 'index']);
    Route::post('/partner-commissions/adjust', [AdminCommissionController::class, 'adjust']);
    Route::post('/partner-commissions/{commission}/reverse', [AdminCommissionController::class, 'reverse']);

    // Withdrawal Management
    Route::get('/partner-withdrawals', [AdminWithdrawalController::class, 'index']);
    Route::post('/partner-withdrawals/{withdrawal}/approve', [AdminWithdrawalController::class, 'approve']);
    Route::post('/partner-withdrawals/{withdrawal}/reject', [AdminWithdrawalController::class, 'reject']);
    Route::post('/partner-withdrawals/{withdrawal}/pay', [AdminWithdrawalController::class, 'markAsPaid']);

    // Partner Settings
    Route::get('/partner-settings', [AdminPartnerSettingController::class, 'show']);
    Route::put('/partner-settings', [AdminPartnerSettingController::class, 'update']);
});
