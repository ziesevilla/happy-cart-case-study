<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Product extends Model
{
    use HasFactory;

    // 1. Fields that can be saved/edited by the Admin
    protected $fillable = [
        'name',
        'price',
        'category',
        'sub_category',
        'image',
        'description',
        'stock'
    ];

    // 2. Extra fields to include in the JSON response automatically
    protected $appends = ['formatted_price', 'dateAdded'];

    // --- ACCESSORS (Virtual Fields) ---

    // Creates 'formatted_price': "₱85.00"
    public function getFormattedPriceAttribute()
    {
        return '₱' . number_format($this->price, 0);
    }

    // Creates 'dateAdded': "12/1/2025" (Maps from created_at)
    public function getDateAddedAttribute()
    {
        // Check if created_at exists before formatting
        return $this->created_at 
            ? Carbon::parse($this->created_at)->format('n/j/Y') // Format: 12/1/2025
            : null;
    }

    // Note: 'id' is automatically included in the JSON response by Laravel,
    // so we don't need to add it to $appends or $fillable.

    // --- RELATIONSHIPS ---
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}