<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 
        'user_id', 
        'transaction_number', 
        'amount', 
        'payment_method', 
        'status'
    ];

    // Automatically format the date when sent to React
    protected $casts = [
        'created_at' => 'datetime:M d, Y h:i A',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}