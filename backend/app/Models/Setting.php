<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value'];

    /**
     * The attributes that should be cast.
     * This automatically converts the JSON string in the DB 
     * to a PHP array when accessed.
     */
    protected $casts = [
        'value' => 'array',
    ];
}