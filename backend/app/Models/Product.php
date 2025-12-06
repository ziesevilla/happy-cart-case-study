<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * Class Product
 * * Represents an item in the store catalog.
 * * Uses Accessors to format price and date for the API response.
 */
class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * * Security: Allows Product::create($request->all()) safely by ignoring
     * * any other fields passed in the request.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'price',
        'category',
        'sub_category',
        'image',
        'description',
        'stock'
    ];

    /**
     * The accessors to append to the model's array form.
     * * These 'virtual' fields do not exist in the database, but will be 
     * * included in the JSON response sent to the frontend.
     *
     * @var array<int, string>
     */
    protected $appends = ['formatted_price', 'dateAdded'];

    // ================= ACCESSORS (Virtual Fields) =================

    /**
     * Get the price formatted with the currency symbol.
     * * Usage: $product->formatted_price
     * * Result: "₱85"
     *
     * @return string
     */
    public function getFormattedPriceAttribute()
    {
        // number_format(value, decimals) ensures we don't display "85.0000"
        return '₱' . number_format($this->price, 0);
    }

    /**
     * Get the creation date in "Month/Day/Year" format.
     * * Usage: $product->dateAdded
     * * Result: "12/1/2025"
     *
     * @return string|null
     */
    public function getDateAddedAttribute()
    {
        // Robustness: Always check if the date exists before parsing
        return $this->created_at 
            ? Carbon::parse($this->created_at)->format('n/j/Y') 
            : null;
    }

    // ================= RELATIONSHIPS =================

    /**
     * A product has many user reviews.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}