<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\TransactionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// ========================================================================
// 1. PUBLIC ROUTES (No Login Required)
// ========================================================================

// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Global Settings (Read-Only)
// Frontend needs this to know Currency, Store Name, and Shipping Fee
Route::get('/settings', [SettingController::class, 'index']);

// Catalog (Read-Only)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/reviews/{productId}', [ReviewController::class, 'index']);


// ========================================================================
// 2. PROTECTED ROUTES (Requires Bearer Token)
// ========================================================================

Route::middleware('auth:sanctum')->group(function () {
    
    // --- User Profile & Auth ---
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/user', function (Request $request) {
        return $request->user(); 
    });

    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // --- Address Book (User Specific) ---
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);

    // --- Shopping Cart & Orders ---
    Route::get('/orders', [OrderController::class, 'index']);      // View History
    Route::post('/orders', [OrderController::class, 'store']);     // Checkout Process
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']); // User Cancel

    // --- Reviews (User Posting) ---
    Route::post('/reviews', [ReviewController::class, 'store']);

    // ====================================================================
    // 3. ADMIN ROUTES
    // ====================================================================
    // Ideally, these should be wrapped in an 'isAdmin' middleware in the future.

    // System Settings (Update Store Info)
    Route::post('/settings', [SettingController::class, 'update']);
    
    // User Management
    Route::get('/users', [UserController::class, 'index']);       // List all users
    Route::put('/users/{id}', [UserController::class, 'update']); // Suspend/Ban users
    Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);

    // Product Inventory Management
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Category Management
    Route::post('/settings/categories/delete', [SettingController::class, 'deleteCategory']);

    // Order Management (Fulfillment)
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']); // e.g. "Shipped"

    // System Management
    Route::post('/system/factory-reset', [SystemController::class, 'factoryReset']);

    // Transaction History (Admin)
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::put('/transactions/{id}/refund', [TransactionController::class, 'refund']);

    
});