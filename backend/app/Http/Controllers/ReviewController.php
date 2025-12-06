<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; 

/**
 * Class ReviewController
 * * Manages user reviews and automatically updates product rating statistics.
 */
class ReviewController extends Controller
{
    /**
     * Retrieve reviews for a specific product.
     *
     * @param  int  $productId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function index($productId)
    {
        // 1. Selective Eager Loading
        // Instead of loading the entire User model (password, phone, address, etc.),
        // we strictly load 'id', 'name', and 'email'. 
        // This improves privacy (sending less data to frontend) and performance.
        return Review::with('user:id,name,email') 
                     ->where('product_id', $productId)
                     ->orderBy('created_at', 'desc')
                     ->get();
    }

    /**
     * Store a new review and update the product's average rating.
     *
     * @param  Request  $request
     * @return Review
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'required|string|max:500',
        ]);

        $user = Auth::user();

        // 1. Database Transaction
        // We are modifying two tables (Reviews AND Products). 
        // We wrap this in a transaction to ensure data consistency.
        return DB::transaction(function () use ($request, $user) {
            
            // 2. Duplicate Check
            // using exists() is efficient—it stops scanning the DB as soon as it finds one match.
            $exists = Review::where('user_id', $user->id)
                            ->where('product_id', $request->product_id)
                            ->exists();

            if ($exists) {
                // abort() inside a transaction triggers an automatic Rollback.
                abort(403, 'You have already reviewed this product.');
            }

            // 3. Create the Review
            $review = Review::create([
                'user_id'     => $user->id,
                'product_id'  => $request->product_id,
                'rating'      => $request->rating,
                'comment'     => $request->comment,
                'likes_count' => 0
            ]);

            // 4. Update Product Cache (Denormalization)
            // Instead of calculating the average every time someone views the product page,
            // we calculate it ONCE here and save the result to the products table.
            $product = Product::find($request->product_id);
            
            // Calculate new average efficiently using SQL aggregate
            $newAvg = $product->reviews()->avg('rating');
            
            // Update the 'cached' column on the product
            $product->update([
                'cached_avg_rating' => $newAvg
            ]);

            // Return the review with the user data attached
            return $review->load('user:id,name');
        });
    }
}