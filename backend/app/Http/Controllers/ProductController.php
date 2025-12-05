<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/products?search=denim
    public function index(Request $request)
    {
        // 1. Start building the query with optimizations (N+1 fixes)
        $query = Product::withCount('reviews')
                        ->withAvg('reviews', 'rating');

        // 2. ⚡ OPTIMIZATION: Use Full-Text Search if 'search' param exists
        if ($search = $request->input('search')) {
            // This uses the specialized index we created.
            // It is much faster than 'LIKE %...%' and sorts by relevance automatically.
            $query->whereFullText(['name', 'description'], $search);
        } else {
            // If not searching, just show newest first
            $query->orderBy('created_at', 'desc');
        }

        return $query->get();
    }

    // GET /api/products/{id} (Public)
    public function show($id)
    {
        return Product::with(['reviews.user'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->findOrFail($id);
    }

    // POST /api/products (Admin Only)
    public function store(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'category' => 'required|string',
            'sub_category' => 'nullable|string',
            'description' => 'nullable|string',
            'stock' => 'required|integer',
            'image' => 'nullable|string',
        ]);

        return Product::create($fields);
    }

    // PUT /api/products/{id} (Admin Only)
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        $fields = $request->validate([
            'name' => 'string',
            'price' => 'numeric',
            'category' => 'string',
            'sub_category' => 'nullable|string',
            'description' => 'nullable|string',
            'stock' => 'integer',
            'image' => 'nullable|string',
        ]);

        $product->update($fields);
        
        return $product;
    }

    // DELETE /api/products/{id} (Admin Only)
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}