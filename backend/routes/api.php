<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AddressController;

// --- PUBLIC ROUTES ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- PROTECTED ROUTES (Requires Login) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // 1. Authentication & Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/user', function (Request $request) {
        return $request->user(); // Get current user info
    });

    // 💡 NEW: Update Profile (Self)
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // 2. Admin User Management
    Route::get('/users', [UserController::class, 'index']); // List all users
    Route::put('/users/{id}', [UserController::class, 'update']); // Suspend/Activate user

    // 3. Address Book
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
});