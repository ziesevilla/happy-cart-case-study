<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product; // 💡 Import Product
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // 💡 Import DB for transactions

class ReviewController extends Controller
{
    // GET /api/reviews/{productId}
    public function index($productId)
    {
        // ⚡ OPTIMIZATION: Eager Loading
        // We explicitly request 'user' to prevent N+1 queries.
        // We also only select the columns we need (id, name) to save bandwidth.
        return Review::with('user:id,name,email') 
                     ->where('product_id', $productId)
                     ->orderBy('created_at', 'desc')
                     ->get();
    }

    // POST /api/reviews
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:500',
        ]);

        $user = Auth::user();

        // ⚡ TRANSACTION: Ensures the Review and the Product Rating update happen together
        return DB::transaction(function () use ($request, $user) {
            
            // 1. Check for duplicates (Optimized: use exists() instead of fetching the row)
            $exists = Review::where('user_id', $user->id)
                            ->where('product_id', $request->product_id)
                            ->exists();

            if ($exists) {
                // Throwing exception inside transaction rolls it back
                abort(403, 'You have already reviewed this product.');
            }

            // 2. Create Review
            $review = Review::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'likes_count' => 0
            ]);

            // 3. ⚡ OPTIMIZATION: Update Product Cache
            // We calculate the average NOW and save it to the product.
            // This means the "Shop" page never has to do math; it just reads the number.
            $product = Product::find($request->product_id);
            
            // Calculate new average efficiently
            $newAvg = $product->reviews()->avg('rating');
            
            // Save to product
            $product->update([
                'cached_avg_rating' => $newAvg
            ]);

            return $review->load('user');
        });
    }
}