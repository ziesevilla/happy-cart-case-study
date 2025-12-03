<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;

class AddressController extends Controller
{
    // GET /api/addresses
    public function index(Request $request)
    {
        // Return only the addresses belonging to the logged-in user
        return $request->user()->addresses;
    }

    // POST /api/addresses
    public function store(Request $request)
    {
        $fields = $request->validate([
            'label' => 'required|string',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'street' => 'required|string',
            'city' => 'required|string',
            'zip' => 'required|string',
            'phone' => 'required|string',
            'is_default' => 'boolean'
        ]);

        // If setting as default, remove default from others
        if ($request->is_default) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        // Save new address
        return $request->user()->addresses()->create($fields);
    }

    // DELETE /api/addresses/{id}
    public function destroy(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();
        return response()->json(['message' => 'Deleted']);
    }
}