<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/products (Public) - Show all
    public function index()
    {
        // Return products sorted by newest first
        return Product::orderBy('created_at', 'desc')->get();
    }

    // GET /api/products/{id} (Public) - Show one details
    public function show($id)
    {
        return Product::findOrFail($id);
    }

    // POST /api/products (Admin Only) - Create
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

    // PUT /api/products/{id} (Admin Only) - Update
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

    // DELETE /api/products/{id} (Admin Only) - Delete
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}