<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // --- 1. SEED USERS ---
        DB::table('users')->insert([
            [
                'name' => 'John Doe',
                'email' => 'user@example.com',
                'password' => Hash::make('password'),
                'role' => 'Customer',
                'status' => 'Active',
                // 💡 Added new profile fields
                'phone' => '0912 345 6789',
                'dob' => '1995-08-15',
                'gender' => 'Male',
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('admin123'),
                'role' => 'Admin',
                'status' => 'Active',
                'phone' => '0918 123 4567',
                'dob' => '1990-01-01',
                'gender' => 'Other',
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Michael Scott',
                'email' => 'michael@dundermifflin.com',
                'password' => Hash::make('password'),
                'role' => 'Customer',
                'status' => 'Active',
                'phone' => '0999 999 9999',
                'dob' => '1965-03-15',
                'gender' => 'Male',
                'created_at' => Carbon::now(),
            ]
        ]);

        // --- 2. SEED PRODUCTS ---
        $products = [
            [
                'name' => "Vintage Wash Denim Jacket",
                'price' => 85.00,
                'category' => "Clothing",
                'sub_category' => "Outerwear",
                'image' => "https://via.placeholder.com/300?text=Denim+Jacket",
                'description' => "A timeless classic featuring a distressed vintage wash.",
                'stock' => 25
            ],
            [
                'name' => "Essential Crewneck T-Shirt",
                'price' => 25.00,
                'category' => "Clothing",
                'sub_category' => "Tops",
                'image' => "https://via.placeholder.com/300?text=White+Tee",
                'description' => "Premium heavyweight cotton t-shirt.",
                'stock' => 100
            ],
            [
                'name' => "Slim-Fit Chino Pants",
                'price' => 55.00,
                'category' => "Clothing",
                'sub_category' => "Bottoms",
                'image' => "https://via.placeholder.com/300?text=Chinos",
                'description' => "Versatile trousers made with stretch-cotton twill.",
                'stock' => 40
            ],
            [
                'name' => "Urban Canvas High-Tops",
                'price' => 65.00,
                'category' => "Shoes",
                'sub_category' => "Sneakers",
                'image' => "https://via.placeholder.com/300?text=High+Tops",
                'description' => "Street-style classic sneakers.",
                'stock' => 15
            ]
        ];

        foreach ($products as $product) {
            DB::table('products')->insert(array_merge($product, [
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]));
        }

        // --- 3. SEED SETTINGS (Optional default config) ---
        DB::table('settings')->insert([
            'key' => 'store_info',
            'value' => json_encode([
                'name' => 'HappyCart',
                'currency' => 'PHP',
                'shippingFee' => 150
            ]),
            'created_at' => Carbon::now()
        ]);
    }
}