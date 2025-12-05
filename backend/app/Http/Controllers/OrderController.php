<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    // GET /api/orders (History)
    public function index()
    {
        $user = Auth::user();

        // ⚡ OPTIMIZATION: Eager Load 'items'
        // This prevents running a separate SQL query for every order's items.
        
        $query = Order::with('items');

        // If Customer, filter by their ID
        if ($user->role !== 'Admin') {
            $query->where('user_id', $user->id);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    // POST /api/orders (Checkout)
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'shipping_address' => 'required|array',
            'total' => 'required|numeric'
        ]);

        // ⚡ TRANSACTION: Ensure DB integrity (All or Nothing)
        return DB::transaction(function () use ($request) {
            $user = Auth::user();
            
            // 1. Create Order
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'user_id' => $user->id,
                'customer_name' => $user->name,
                'email' => $user->email,
                'total' => $request->total,
                'status' => 'Placed',
                'shipping_address' => $request->shipping_address
            ]);

            // 2. Process Items (Bulk Insertion would be faster, but we need stock checks)
            foreach ($request->items as $item) {
                // ⚡ OPTIMIZATION: Use 'lockForUpdate' to prevent race conditions 
                // if two people buy the last item at the exact same second.
                $product = Product::where('id', $item['id'])->lockForUpdate()->first();

                if (!$product || $product->stock < $item['quantity']) {
                    throw new \Exception("Product {$item['name']} is out of stock.");
                }

                $product->decrement('stock', $item['quantity']);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $item['quantity'],
                    'image' => $product->image
                ]);
            }

            return $order;
        });
    }
    
    // PUT /api/orders/{id}/cancel
    public function cancel($id)
    {
        $user = Auth::user();
        
        // ⚡ OPTIMIZATION: FindOrFail handles the 404 check efficiently
        $order = Order::where('id', $id)
                      ->where('user_id', $user->id)
                      ->firstOrFail();
        
        if (in_array($order->status, ['Placed', 'Processing'])) {
            $order->update(['status' => 'Cancelled']);
            
            // Restore Stock
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)
                       ->increment('stock', $item->quantity);
            }
            
            return $order;
        }
        
        return response()->json(['message' => 'Cannot cancel this order.'], 400);
    }

    // PUT /api/orders/{id}/status (Admin Only)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:Pending,Processing,Shipped,Delivered,Cancelled,Return Requested'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return $order;
    }
}