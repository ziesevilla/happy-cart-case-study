<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'product_id', 'rating', 'comment', 'likes_count'];

    // Always load the user info when grabbing a review
    protected $with = ['user'];
    
    // Add a formatted date automatically
    protected $appends = ['date_formatted'];

    public function getDateFormattedAttribute()
    {
        return $this->created_at->format('M d, Y');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}