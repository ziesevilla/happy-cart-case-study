<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * This allows you to use Address::create($data) safely.
     */
    protected $fillable = [
        'user_id',
        'label',        // e.g., "Home", "Office"
        'first_name',
        'last_name',
        'street',
        'city',
        'zip',
        'phone',
        'is_default'    // Boolean (0 or 1)
    ];

    /**
     * The attributes that should be cast to native types.
     * This ensures 'is_default' comes back as true/false, not 1/0.
     */
    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * Relationship: An address belongs to one User.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}