<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * Class Order
 * * Represents a customer's completed purchase.
 * * Handles JSON serialization of addresses and calculated fields for the API.
 */
class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'email',
        'total',
        'status',
        'shipping_address' // Stored as a JSON string in the DB
    ];

    /**
     * The attributes that should be cast to native types.
     * * * 'shipping_address' => 'array':
     * * Laravel automatically converts the JSON string from the database 
     * * into a PHP Array when you access $order->shipping_address.
     * * It also converts the Array back to JSON when saving to the DB.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'shipping_address' => 'array',
    ];

    /**
     * The accessors to append to the model's array form.
     * * * When you return $order to the API, these custom fields 
     * * (date_formatted, items_count) will be included in the JSON response
     * * even though they are not actual columns in the database table.
     *
     * @var array<int, string>
     */
    protected $appends = ['date_formatted', 'items_count'];

    // ================= ACCESSORS =================

    /**
     * Get the creation date in a human-readable format.
     * Usage: $order->date_formatted
     *
     * @return string
     */
    public function getDateFormattedAttribute()
    {
        // format('M d, Y') results in "Oct 12, 2023"
        return $this->created_at->format('M d, Y');
    }

    /**
     * Calculate the total number of items in the order.
     * Usage: $order->items_count
     *
     * @return int
     */
    public function getItemsCountAttribute()
    {
        // Warning: This triggers a database query for 'items' if not already loaded.
        // Ensure you use Order::with('items') in your controller to avoid performance issues.
        return $this->items->sum('quantity');
    }

    // ================= RELATIONSHIPS =================

    /**
     * An order belongs to one user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * An order contains many individual line items.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * An order has one transaction associated with it.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function transaction()
    {
        // This assumes the 'transactions' table has an 'order_id' column
        return $this->hasOne(Transaction::class);
    }
}