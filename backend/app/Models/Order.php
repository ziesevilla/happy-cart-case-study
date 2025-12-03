<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'email',
        'total',
        'status',
        'shipping_address'
    ];

    // Store address as JSON automatically
    protected $casts = [
        'shipping_address' => 'array',
    ];

    // Format date automatically (e.g., "Oct 12, 2023")
    protected $appends = ['date_formatted', 'items_count'];

    public function getDateFormattedAttribute()
    {
        return $this->created_at->format('M d, Y');
    }

    public function getItemsCountAttribute()
    {
        return $this->items->sum('quantity');
    }

    // --- RELATIONSHIPS ---
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}