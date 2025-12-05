<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Optimizing User Login & Search
        Schema::table('users', function (Blueprint $table) {
            // We already indexed 'email' (unique), but let's index 'role'
            // so admins can filter "Show all Customers" instantly.
            $table->index('role'); 
        });

        // 2. Optimizing Product Filtering
        Schema::table('products', function (Blueprint $table) {
            $table->index('category'); // Fast category pages
            $table->index('sub_category'); // Fast sub-category filtering
            $table->index('price'); // Fast "Sort by Price"
        });

        // 3. Optimizing Order History
        Schema::table('orders', function (Blueprint $table) {
            // 'user_id' is likely already indexed by 'foreignId', but explicit doesn't hurt
            $table->index('status'); // Admin filters "Show Pending Orders" instantly
            $table->index('order_number'); // Fast order lookup
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) { $table->dropIndex(['role']); });
        Schema::table('products', function (Blueprint $table) { $table->dropIndex(['category', 'sub_category', 'price']); });
        Schema::table('orders', function (Blueprint $table) { $table->dropIndex(['status', 'order_number']); });
    }
};