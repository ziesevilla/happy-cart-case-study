<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\ProductController; // 💡 1. Import ProductController

// --- PUBLIC ROUTES (No Login Required) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Shop Routes (Guests can view products)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// --- PROTECTED ROUTES (Requires Login) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // 1. Authentication & Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/user', function (Request $request) {
        return $request->user(); // Get current user info
    });

    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // 2. Admin User Management
    Route::get('/users', [UserController::class, 'index']); // List all users
    Route::put('/users/{id}', [UserController::class, 'update']); // Suspend/Activate user

    // 3. Address Book
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);

    // 4. Product Management (Admin Only)
    // 💡 These routes handle Creating, Updating, and Deleting products
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
});