<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\OrderController;

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
// These endpoints allow guests to browse the shop and sign up.

// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Catalog (Read-Only)
// Guests must be able to view products and reviews to make a buying decision.
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/reviews/{productId}', [ReviewController::class, 'index']);


// ========================================================================
// 2. PROTECTED ROUTES (Requires Bearer Token)
// ========================================================================
// All routes inside this group require a valid Sanctum token in the header.
// Header format: "Authorization: Bearer <your-token-here>"

Route::middleware('auth:sanctum')->group(function () {
    
    // --- User Profile & Auth ---
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Simple closure to get the currently logged-in user's data
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

    // ====================================================================
    // 3. ADMIN ROUTES
    // ====================================================================
    // Note: Currently, these are protected by 'auth', but the specific logic 
    // to check for 'Admin' role is handled inside the Controllers.
    // Ideally, you would create a separate middleware alias (e.g., 'isAdmin').

    // User Management
    Route::get('/users', [UserController::class, 'index']);       // List all users
    Route::put('/users/{id}', [UserController::class, 'update']); // Suspend/Ban users
    Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);

    // Product Inventory Management
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Order Management (Fulfillment)
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']); // e.g. "Shipped"
    
    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
});