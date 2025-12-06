<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Review
 * * Represents customer feedback on a product.
 * * Automatically loads user details to ensure author names are always available.
 */
class Review extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['user_id', 'product_id', 'rating', 'comment', 'likes_count'];

    /**
     * The relationships that should always be loaded.
     * * GLOBAL EAGER LOADING:
     * * Every time you fetch a Review (e.g., Review::all()), Laravel will 
     * * automatically run a SQL join to fetch the associated User.
     * * This prevents the N+1 problem if you forget to write ->with('user').
     *
     * @var array<int, string>
     */
    protected $with = ['user'];
    
    /**
     * The accessors to append to the model's array form.
     * * Ensures the frontend always receives the formatted date.
     *
     * @var array<int, string>
     */
    protected $appends = ['date_formatted'];

    // ================= ACCESSORS =================

    /**
     * Get the review creation date in "Jan 01, 2023" format.
     * Usage: $review->date_formatted
     *
     * @return string
     */
    public function getDateFormattedAttribute()
    {
        return $this->created_at->format('M d, Y');
    }

    // ================= RELATIONSHIPS =================

    /**
     * A review belongs to a specific user (the author).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * A review belongs to a specific product.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}