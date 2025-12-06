<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Address
 * * Represents a user's shipping or billing address.
 * * Handles formatting and default status logic.
 */
class Address extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * * Security: This protects your database. Even if a hacker sends a 'user_id'
     * * or 'id' in the request, Laravel will only save the fields listed here.
     *
     * @var array<int, string>
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
        'is_default'    // Stored as TINYINT (0/1) in DB
    ];

    /**
     * The attributes that should be cast to native types.
     * * 'boolean': Converts database 0/1 to PHP true/false automatically.
     * * This ensures the frontend receives a real boolean JSON value.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_default' => 'boolean',
    ];

    // ================= RELATIONSHIPS =================

    /**
     * Get the user that owns the address.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}