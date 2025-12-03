<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // GET /api/users
    public function index()
    {
        // Fetch all users for the Admin Dashboard table
        return User::all();
    }
    
    // PUT /api/users/{id} (For suspending/activating)
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update($request->only(['status', 'role']));
        return $user;
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $data = $request->validate([
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string',
            // Note: Email updates usually require re-verification logic
        ]);

        $user->update($data);

        return $user;
    }
}