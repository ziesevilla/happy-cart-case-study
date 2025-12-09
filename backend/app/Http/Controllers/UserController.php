<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

/**
 * Class UserController
 * * Manages User Listing (Admin), Admin updates, and Self-Profile updates.
 */
class UserController extends Controller
{
    /**
     * Retrieve a paginated list of users with search functionality.
     * * Optimized for performance by selecting specific columns.
     *
     * @param  Request  $request
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function index(Request $request)
    {
        // 1. Column Selection & Eager Loading
        // We added ->with('addresses') so the address data is actually sent to React.
        $query = User::with('addresses') 
                    ->select('id', 'name', 'email', 'role', 'status', 'phone', 'gender', 'dob', 'created_at');

        // 2. Server-Side Search
        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // 3. Pagination
        return $query->orderBy('created_at', 'desc')->paginate(10);
    }
    
    /**
     * Update user status or role (Admin Only).
     *
     * @param  Request  $request
     * @param  mixed    $id
     * @return User
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // Security: We use ->only() to ensure an admin doesn't accidentally 
        // update the user's email or password through this specific endpoint.
        $user->update($request->only(['status', 'role']));
        
        return $user;
    }

    /**
     * Update the currently authenticated user's profile.
     * * Handles text data and profile image uploads.
     *
     * @param  Request  $request
     * @return User
     */
    public function updateProfile(Request $request)
    {
        // Get the user from the token/session
        $user = $request->user();
        
        // 1. Validation
        $request->validate([
            'name'          => 'required|string',
            'phone'         => 'nullable|string',
            'dob'           => 'nullable|date',
            'gender'        => 'nullable|string',
            'profile_image' => 'nullable|image|max:2048', // Max 2MB
        ]);

        // Whitelist the fields to be updated
        $data = $request->only(['name', 'phone', 'dob', 'gender']);

        // 2. Handle Image Upload
        if ($request->hasFile('profile_image')) {
            
            // Cleanup: Delete the old image if it exists to save disk space.
            // We use str_replace because the DB stores the full URL ('/storage/...')
            // but the Storage facade needs the relative path.
            if ($user->profile_image) {
                $oldPath = str_replace('/storage/', '', $user->profile_image);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // Upload: Store in 'storage/app/public/avatars'
            $path = $request->file('profile_image')->store('avatars', 'public');
            
            // Save the accessible URL to the database
            $data['profile_image'] = '/storage/' . $path;
        }

        $user->update($data);

        return $user;
    }

    /**
     * Invalidate the user's current password.
     */
    public function resetPassword($id)
    {
        // 1. Find User in MySQL
        $user = User::findOrFail($id);

        // 2. Invalidate Password
        // We set it to a random hash. The user cannot login until they 
        // use the "Forgot Password" link to set a new one.
        $user->password = Hash::make(Str::random(60));
        
        // 3. Update Status (Optional, to show visual feedback in Admin Panel)
        $user->status = 'Recovery';
        
        // 4. Save to Database
        $user->save();

        // 5. (Optional) Send Email Logic would go here...

        return response()->json([
            'message' => 'Password invalidated successfully', 
            'user' => $user
        ]);
    }
}