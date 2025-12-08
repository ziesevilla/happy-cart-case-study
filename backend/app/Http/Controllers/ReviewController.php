<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product; 
use App\Models\Setting; // <--- 1. IMPORT SETTING MODEL
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
        // Selective Eager Loading for performance and privacy
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
        // =========================================================
        // 1. CHECK SETTINGS (SECURITY GATE)
        // =========================================================
        $setting = Setting::where('key', 'system_toggles')->first();
        $toggles = $setting->value ?? [];

        // If 'enableReviews' is strictly FALSE, block the request.
        if (isset($toggles['enableReviews']) && $toggles['enableReviews'] === false) {
            return response()->json([
                'message' => 'Review submission is currently disabled by the administrator.'
            ], 403); // Return 403 Forbidden
        }

        // =========================================================
        // 2. VALIDATION
        // =========================================================
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'required|string|max:500',
        ]);

        $user = Auth::user();

        // 3. Database Transaction
        return DB::transaction(function () use ($request, $user) {
            
            // Duplicate Check
            $exists = Review::where('user_id', $user->id)
                            ->where('product_id', $request->product_id)
                            ->exists();

            if ($exists) {
                abort(403, 'You have already reviewed this product.');
            }

            // Create the Review
            $review = Review::create([
                'user_id'     => $user->id,
                'product_id'  => $request->product_id,
                'rating'      => $request->rating,
                'comment'     => $request->comment,
                'likes_count' => 0
            ]);

            // Update Product Cache (Denormalization)
            $product = Product::find($request->product_id);
            $newAvg = $product->reviews()->avg('rating');
            
            $product->update([
                'cached_avg_rating' => $newAvg
            ]);

            return $review->load('user:id,name');
        });
    }
}