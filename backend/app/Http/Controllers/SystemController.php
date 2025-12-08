<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Product;
use App\Models\Setting;

class SystemController extends Controller
{
    public function factoryReset(Request $request)
    {
        // 1. Security Check (Case Insensitive)
        if (strcasecmp($request->user()->role, 'admin') !== 0) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        ini_set('max_execution_time', 300); // 5 minutes
        ini_set('memory_limit', '512M');

        DB::beginTransaction();

        try {
            // 1. DISABLE FOREIGN KEY CHECKS
            Schema::disableForeignKeyConstraints();

            // --- DELETE DATA (Using delete() instead of truncate()) ---

            // Delete Child Tables First
            DB::table('order_items')->delete();
            DB::table('reviews')->delete();
            DB::table('addresses')->delete();
            
            // Delete Parent Tables
            DB::table('orders')->delete();
            
            // Delete Users (Keep Admin)
            $currentAdminId = Auth::id();
            User::where('id', '!=', $currentAdminId)->delete();

            // Wipe Products
            DB::table('products')->delete(); 

            // Wipe Settings
            DB::table('settings')->delete();

            // --- RESET ID COUNTERS (Optional) ---
            // This attempts to reset the auto-increment to 1
            $tables = ['products', 'orders', 'users', 'reviews', 'addresses', 'order_items'];
            foreach ($tables as $table) {
                try {
                    DB::statement("ALTER TABLE $table AUTO_INCREMENT = 1");
                } catch (\Exception $e) {
                    // Ignore
                }
            }

            // --- RESTORE DEFAULTS ---

            // 1. Seed Products
            $defaults = [
                [
                    'name' => 'Classic White Tee',
                    'price' => 500,
                    'category' => 'Clothing',
                    'sub_category' => 'Tops',
                    'description' => 'A comfortable classic.',
                    'image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=60',
                    'stock' => 50,
                    'cached_avg_rating' => 5, // <--- FIXED COLUMN NAME
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'name' => 'Denim Jacket',
                    'price' => 1200,
                    'category' => 'Clothing',
                    'sub_category' => 'Jackets',
                    'description' => 'Stylish denim for any season.',
                    'image' => 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=60',
                    'stock' => 20,
                    'cached_avg_rating' => 4, // <--- FIXED COLUMN NAME
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'name' => 'Running Shoes',
                    'price' => 3500,
                    'category' => 'Shoes',
                    'sub_category' => 'Sneakers',
                    'description' => 'Lightweight and durable.',
                    'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=60',
                    'stock' => 15,
                    'cached_avg_rating' => 5, // <--- FIXED COLUMN NAME
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            ];
            
            DB::table('products')->insert($defaults);

            // 2. Restore Settings
            
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

            Setting::create([
                'key' => 'system_toggles',
                'value' => ['maintenanceMode' => false, 'allowRegistration' => true, 'enableReviews' => true]
            ]);

            Setting::create([
                'key' => 'categories',
                'value' => ['Clothing', 'Shoes', 'Accessories']
            ]);

            // 3. RE-ENABLE CHECKS & COMMIT
            Schema::enableForeignKeyConstraints();
            DB::commit(); 

            return response()->json(['message' => 'Factory Reset Complete.']);

        } catch (\Exception $e) {
            DB::rollBack();
            Schema::enableForeignKeyConstraints();
            return response()->json(['message' => 'Reset failed: ' . $e->getMessage()], 500);
        }
    }
}