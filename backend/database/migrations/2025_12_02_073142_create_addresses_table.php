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
    Schema::create('addresses', function (Blueprint $table) {
        $table->id();
        // Link address to a user
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        $table->string('label'); // e.g. "Home"
        $table->string('first_name');
        $table->string('last_name');
        $table->string('street');
        $table->string('city');
        $table->string('zip');
        $table->string('phone');
        $table->boolean('is_default')->default(false);
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
