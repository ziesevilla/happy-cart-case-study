<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Class AuthController
 * * Handles user authentication via API tokens (Laravel Sanctum).
 * * Includes Registration, Login (with status checks), and Logout.
 */
class AuthController extends Controller
{
    /**
     * Register a new user and generate an access token.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // 1. Validate the registration data
        // Note: 'confirmed' checks for a matching 'password_confirmation' field in the request.
        $fields = $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|string|unique:users,email',
            'password' => 'required|string|confirmed',
            'phone'    => 'nullable|string',
            'dob'      => 'nullable|date',
            'gender'   => 'nullable|string'
        ]);

        // 2. Create the User
        $user = User::create([
            'name'     => $fields['name'],
            'email'    => $fields['email'],
            // Security: Always hash passwords before storing them
            'password' => Hash::make($fields['password']),
            // Use Null Coalescing (??) to handle optional fields safely
            'phone'    => $fields['phone'] ?? null,
            'dob'      => $fields['dob'] ?? null,
            'gender'   => $fields['gender'] ?? null,
            'role'     => 'Customer', // Default role
            'status'   => 'Active'    // Default status
        ]);

        // 3. Generate a Sanctum API Token
        $token = $user->createToken('myapptoken')->plainTextToken;

        // 4. Return User and Token with 201 (Created) status
        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    /**
     * Authenticate a user and revoke credentials if valid.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // 1. Validate inputs
        $fields = $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string'
        ]);

        // 2. Find the user by email
        // We select specific fields to avoid exposing sensitive data unintentionally
        $user = User::select('id', 'name', 'email', 'password', 'role', 'status', 'profile_image')
                    ->where('email', $fields['email'])
                    ->first();

        // 3. Check if user exists AND if the password matches the hash
        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
    
        // 4. Check Account Status
        // Prevent login if the user has been banned/suspended
        if ($user->status === 'Suspended') {
            return response()->json(['message' => 'Your account has been suspended.'], 403);
        }

        // 5. Generate a new Token for this session
        $token = $user->createToken('myapptoken')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Delete only the token currently being used for this request.
        // This allows the user to stay logged in on other devices if they wish.
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }
}