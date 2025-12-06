<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Class User
 * * Represents the authenticated user (Customer or Admin).
 * * Uses Laravel Sanctum for API Token management.
 */
class User extends Authenticatable
{
    /**
     * Traits:
     * * HasApiTokens: Methods to generate/delete tokens ($user->createToken).
     * * Notifiable: Methods to send emails ($user->notify).
     */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',          // 'Admin' or 'Customer'
        'status',        // 'Active' or 'Suspended'
        'phone',
        'dob',
        'gender',
        'profile_image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     * * SECURITY CRITICAL: These fields are automatically removed from 
     * * any JSON response. This prevents leaking hashed passwords or 
     * * internal tokens to the frontend.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     * * Modern Laravel syntax (method instead of property).
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            // 'hashed': Automatically hashes the password when you set it, 
            // and ensures it's treated securely.
            'password' => 'hashed',
        ];
    }

    // ================= RELATIONSHIPS =================

    /**
     * A user can have multiple shipping addresses.
     */
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    /**
     * A user can place multiple orders.
     * (Added based on your OrderController logic)
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * A user can write multiple reviews.
     * (Added based on your ReviewController logic)
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}