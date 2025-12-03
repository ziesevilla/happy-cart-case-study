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
// GET /api/orders
    public function index()
    {
        $user = Auth::user();

        // 💡 FIX: Check Role
        if ($user->role === 'Admin') {
            // If Admin, show EVERYTHING (Sorted by newest)
            return Order::with('items')
                        ->orderBy('created_at', 'desc')
                        ->get();
        }

        // If Customer, show ONLY their orders
        return Order::where('user_id', $user->id)
                    ->with('items')
                    ->orderBy('created_at', 'desc')
                    ->get();
    }

    // POST /api/orders (Checkout)
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'shipping_address' => 'required|array',
            'total' => 'required|numeric'
        ]);

        // Use a Transaction: Either everything succeeds, or nothing happens.
        // This prevents "half-created" orders if stock runs out midway.
        return DB::transaction(function () use ($request) {
            $user = Auth::user();
            
            // 1. Create the Order Header
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'user_id' => $user->id,
                'customer_name' => $user->name,
                'email' => $user->email,
                'total' => $request->total,
                'status' => 'Placed',
                'shipping_address' => $request->shipping_address
            ]);

            // 2. Process Items & Deduct Stock
            foreach ($request->items as $item) {
                $product = Product::find($item['id']);

                if (!$product || $product->stock < $item['quantity']) {
                    throw new \Exception("Product {$item['name']} is out of stock.");
                }

                // Deduct Stock
                $product->decrement('stock', $item['quantity']);

                // Save Order Item
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
        $order = Order::where('user_id', Auth::id())->findOrFail($id);
        
        if ($order->status === 'Placed' || $order->status === 'Processing') {
            $order->update(['status' => 'Cancelled']);
            
            // Optional: Restore stock here if you want
            foreach ($order->items as $item) {
                Product::find($item->product_id)->increment('stock', $item->quantity);
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

        // 💡 Find order regardless of user_id (because Admins can edit anyone's order)
        $order = Order::findOrFail($id);
        
        $order->update(['status' => $request->status]);

        return $order;
    }
}