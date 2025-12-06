<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;
use Illuminate\Support\Facades\DB; 

/**
 * Class AddressController
 * * Manages the shipping/billing addresses associated with an authenticated user.
 */
class AddressController extends Controller
{
    /**
     * Display a listing of the user's addresses.
     *
     * @param  Request  $request
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function index(Request $request)
    {
        // Return all addresses belonging to the currently authenticated user
        return $request->user()->addresses;
    }

    /**
     * Store a newly created address in the database.
     * * Validates input and handles logic to ensure only one address
     * is marked as 'default' at a time.
     *
     * @param  Request  $request
     * @return \App\Models\Address
     */
    public function store(Request $request)
    {
        // 1. Validate the incoming request data
        $fields = $request->validate([
            'label'      => 'required|string',
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'street'     => 'required|string',
            'city'       => 'required|string',
            'zip'        => 'required|string',
            'phone'      => 'required|string',
            'is_default' => 'boolean'
        ]);

        // 2. Use a Database Transaction to ensure data integrity
        // If any part of this block fails, no changes are saved to the DB.
        return DB::transaction(function () use ($request, $fields) {
            
            // If the user wants this new address to be the default...
            if ($request->is_default) {
                // ...find any existing default addresses for this user and unset them.
                $request->user()->addresses()
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            // 3. Create and return the new address associated with the user
            return $request->user()->addresses()->create($fields);
        });
    }
    
    /**
     * Remove the specified address from storage.
     *
     * @param  Request  $request
     * @param  int      $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        // 1. Find the address by ID, strictly scoping it to the current user.
        // using failOrFail() throws a 404 if the ID belongs to a different user.
        $address = $request->user()->addresses()->findOrFail($id);
        
        // 2. Delete the record
        $address->delete();

        // 3. Return a JSON response confirming deletion
        return response()->json(['message' => 'Deleted']);
    }
}