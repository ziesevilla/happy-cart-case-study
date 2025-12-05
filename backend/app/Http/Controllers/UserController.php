<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // GET /api/users?page=1&search=john
    public function index(Request $request)
    {
        // 1. ⚡ OPTIMIZATION: Select only necessary columns (saves memory/bandwidth)
        $query = User::select('id', 'name', 'email', 'role', 'status', 'phone', 'gender', 'dob', 'created_at');

        // 2. ⚡ OPTIMIZATION: Server-Side Search
        // If the frontend sends ?search=..., filter in the database, not in React
        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // 3. ⚡ OPTIMIZATION: Pagination
        // Instead of returning ALL users (which crashes large apps),
        // return them in chunks of 10 (sorted by newest).
        return $query->orderBy('created_at', 'desc')->paginate(10);
    }
    
    // PUT /api/users/{id} (For suspending/activating)
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update($request->only(['status', 'role']));
        return $user;
    }

    // PUT /user/profile (Self update)
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $data = $request->validate([
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string',
        ]);

        $user->update($data);

        return $user;
    }
}