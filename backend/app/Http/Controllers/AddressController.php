<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;
use Illuminate\Support\Facades\DB; // 💡 Import DB Facade

class AddressController extends Controller
{
    // GET /api/addresses
    public function index(Request $request)
    {
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

        // ⚡ OPTIMIZATION: Use a Transaction for safety
        return DB::transaction(function () use ($request, $fields) {
            
            // Only unset the OLD default if the NEW one claims to be default
            if ($request->is_default) {
                $request->user()->addresses()
                    ->where('is_default', true) // ⚡ Optimization: Only touch the one row that needs changing
                    ->update(['is_default' => false]);
            }

            // Save new address
            return $request->user()->addresses()->create($fields);
        });
    }

    // DELETE /api/addresses/{id}
    public function destroy(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();
        return response()->json(['message' => 'Deleted']);
    }
}