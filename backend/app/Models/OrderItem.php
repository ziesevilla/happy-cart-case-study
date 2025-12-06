<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class OrderItem
 * * Represents a specific line item within an order (e.g., "2x Red T-Shirt").
 * * Stores a historical snapshot of the product details at the time of purchase.
 */
class OrderItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * * * SNAPSHOTTING STRATEGY:
     * * We store 'product_name' and 'price' explicitly here. 
     * * If the shop administrator changes the product price or name next week,
     * * this historic order record remains accurate to what the user actually paid.
     */
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name', // Snapshot: The name of the product at the moment of sale
        'price',        // Snapshot: The price the user paid (before any future price hikes)
        'quantity',
        'image'         // Helper: Allows showing order history without querying the Products table
    ];

    /**
     * The order this item belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * The original product reference.
     * * Note: This may return null if the product is permanently deleted from the store.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}