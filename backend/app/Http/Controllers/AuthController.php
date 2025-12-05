<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // 1. REGISTER
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|unique:users,email',
            'password' => 'required|string|confirmed',
            'phone' => 'nullable|string',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string'
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => Hash::make($fields['password']),
            'phone' => $fields['phone'] ?? null,
            'dob' => $fields['dob'] ?? null,
            'gender' => $fields['gender'] ?? null,
            'role' => 'Customer',
            'status' => 'Active'
        ]);

        $token = $user->createToken('myapptoken')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    // 2. LOGIN (Optimized)
    public function login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);

        // ⚡ OPTIMIZATION: Select only what we need for auth logic & initial session state
        // We skip heavy fields like bio, notes, or logs if they exist.
        $user = User::select('id', 'name', 'email', 'password', 'role', 'status', 'profile_image')
                    ->where('email', $fields['email'])
                    ->first();

        // Check User Existence & Password
        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
        
        // Check Status (Optional Security Enhancement)
        if ($user->status === 'Suspended') {
            return response()->json(['message' => 'Your account has been suspended.'], 403);
        }

        $token = $user->createToken('myapptoken')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    // 3. LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}