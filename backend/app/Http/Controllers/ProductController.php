<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // Added for file deletion handling

/**
 * Class ProductController
 * * Manages the product catalog, including search, file uploads, and review aggregates.
 */
class ProductController extends Controller
{
    /**
     * Retrieve a list of products with optional full-text search.
     * * Includes review counts and average ratings efficiently.
     *
     * @param  Request  $request
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function index(Request $request)
    {
        // 1. Initialize Query with Aggregates
        // 'withCount' and 'withAvg' add extra columns (reviews_count, reviews_avg_rating)
        // to the results without needing to load all actual review data.
        $query = Product::withCount('reviews')
                        ->withAvg('reviews', 'rating');

        // 2. Full-Text Search Optimization
        if ($search = $request->input('search')) {
            // Note: This requires a MySQL FullText index on 'name' and 'description'.
            // It automatically sorts results by "Relevance" (how well they match).
            $query->whereFullText(['name', 'description'], $search);
        } else {
            // Default sort: Newest arrivals first
            $query->orderBy('created_at', 'desc');
        }

        return $query->get();
    }

    /**
     * Display a specific product with its reviews.
     *
     * @param  mixed  $id
     * @return Product
     */
    public function show($id)
    {
        // Eager load the reviews AND the user who wrote the review
        // This prevents N+1 queries when displaying the review list on the frontend.
        return Product::with(['reviews.user'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->findOrFail($id);
    }

    /**
     * Create a new product and handle image upload.
     *
     * @param  Request  $request
     * @return Product
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'name'         => 'required|string',
            'price'        => 'required|numeric',
            'category'     => 'required|string',
            'sub_category' => 'nullable|string',
            'description'  => 'nullable|string',
            'stock'        => 'required|integer',
            // Ensure the file is actually an image and under 2MB
            'image'        => 'nullable|image|max:2048', 
        ]);

        // 1. Handle File Upload
        if ($request->hasFile('image')) {
            // Stores file in 'storage/app/public/products'
            // Returns the hashed filename path
            $path = $request->file('image')->store('products', 'public');
            
            // Generate a publicly accessible URL path
            $fields['image'] = '/storage/' . $path;
        }

        return Product::create($fields);
    }

    /**
     * Update an existing product.
     *
     * @param  Request  $request
     * @param  mixed    $id
     * @return Product
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        // Validation rules are looser here (not strictly 'required') 
        // to allow partial updates.
        $fields = $request->validate([
            'name'         => 'string',
            'price'        => 'numeric',
            'category'     => 'string',
            'sub_category' => 'nullable|string',
            'description'  => 'nullable|string',
            'stock'        => 'integer',
            'image'        => 'nullable', 
        ]);

        // 1. Handle New Image Upload
        if ($request->hasFile('image')) {
            
            // Optional: Cleanup old image to save server space
            // We strip '/storage/' to get the relative path for the Storage facade
            $oldPath = str_replace('/storage/', '', $product->image);
            if ($product->image && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            // Store new image
            $path = $request->file('image')->store('products', 'public');
            $fields['image'] = '/storage/' . $path;
        }

        $product->update($fields);
        
        return $product;
    }

    /**
     * Delete a product (Admin Only).
     *
     * @param  mixed  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        
        // Cleanup image before deleting record
        if ($product->image) {
             $oldPath = str_replace('/storage/', '', $product->image);
             if (Storage::disk('public')->exists($oldPath)) {
                 Storage::disk('public')->delete($oldPath);
             }
        }

        $product->delete();
        
        return response()->json(['message' => 'Product deleted']);
    }
}