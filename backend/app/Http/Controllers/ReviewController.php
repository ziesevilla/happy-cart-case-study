<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    // GET /api/reviews/{productId}
    public function index($productId)
    {
        return Review::where('product_id', $productId)
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

        // 1. Check for duplicates
        $existing = Review::where('user_id', $user->id)
                          ->where('product_id', $request->product_id)
                          ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this product.'], 403);
        }

        // 2. Create Review
        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'likes_count' => 0
        ]);

        return $review->load('user');
    }
}