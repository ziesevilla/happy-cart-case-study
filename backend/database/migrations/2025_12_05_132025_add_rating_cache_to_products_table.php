<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Stores 4.50, 3.25, etc. Index makes sorting by "Top Rated" instant.
            $table->decimal('cached_avg_rating', 3, 2)->default(0)->index(); 
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('cached_avg_rating');
        });
    }
};
