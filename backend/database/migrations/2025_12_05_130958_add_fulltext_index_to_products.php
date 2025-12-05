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
            // Add Full-Text Index for super-fast searching
            $table->fullText(['name', 'description']); 
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            // Remove the index if we roll back
            $table->dropFullText(['name', 'description']);
        });
    }
};
