<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Review;
use App\Models\Setting;
use App\Models\Address;

class SystemController extends Controller
{
    public function factoryReset(Request $request)
    {
        // 1. Security Check: Only Admins can do this
        if ($request->user()->role !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // 2. Start Transaction (Safety Net)
        DB::beginTransaction();

        try {
            // --- DELETE ALL DATA ---
            
            // Delete transactional data first to avoid Foreign Key constraint errors
            Order::query()->delete(); 
            Review::query()->delete();
            Address::query()->delete();

            // Delete Users (EXCEPT the current Admin who is clicking the button)
            $currentAdminId = Auth::id();
            User::where('id', '!=', $currentAdminId)->delete();

            // Delete Inventory
            Product::truncate(); 

            // --- RESTORE DEFAULTS (Seeding) ---

            // 1. Default Products
            $defaults = [
                [
                    'name' => 'Classic White Tee',
                    'price' => 500,
                    'category' => 'Clothing',
                    'sub_category' => 'Tops',
                    'description' => 'A comfortable classic.',
                    'image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=60',
                    'stock' => 50,
                    'rating' => 5
                ],
                [
                    'name' => 'Denim Jacket',
                    'price' => 1200,
                    'category' => 'Clothing',
                    'sub_category' => 'Jackets',
                    'description' => 'Stylish denim for any season.',
                    'image' => 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=60',
                    'stock' => 20,
                    'rating' => 4
                ],
                [
                    'name' => 'Running Shoes',
                    'price' => 3500,
                    'category' => 'Shoes',
                    'sub_category' => 'Sneakers',
                    'description' => 'Lightweight and durable.',
                    'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=60',
                    'stock' => 15,
                    'rating' => 5
                ]
            ];
            
            foreach ($defaults as $prod) {
                Product::create($prod);
            }

            // 2. Reset Settings
            Setting::truncate();
            
            // Create "Store Info"
            Setting::create([
                'key' => 'store_info',
                'value' => [
                    'name' => 'HappyCart',
                    'currency' => 'PHP',
                    'shippingFee' => 150,
                    'email' => 'support@happycart.com',
                    'freeShippingThreshold' => 5000,
                    'taxRate' => 12
                ]
            ]);

            // Create "Toggles" (All ON by default)
            Setting::create([
                'key' => 'system_toggles',
                'value' => ['maintenanceMode' => false, 'allowRegistration' => true, 'enableReviews' => true]
            ]);

            // Create "Categories"
            Setting::create([
                'key' => 'categories',
                'value' => ['Clothing', 'Shoes', 'Accessories']
            ]);

            // --- COMMIT CHANGES ---
            DB::commit();

            return response()->json(['message' => 'Factory Reset Complete.']);

        } catch (\Exception $e) {
            DB::rollBack(); // Something went wrong, undo deletions
            return response()->json(['message' => 'Reset failed: ' . $e->getMessage()], 500);
        }
    }
}