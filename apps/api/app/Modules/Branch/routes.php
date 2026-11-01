<?php

use App\Modules\Branch\Controllers\BranchController;
use Illuminate\Support\Facades\Route;

Route::apiResource('branches', BranchController::class);
