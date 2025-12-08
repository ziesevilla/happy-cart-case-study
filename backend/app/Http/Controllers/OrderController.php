<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

/**
 * Class OrderController
 * * Manages the lifecycle of orders: Listing, Checkout, Cancellation, and Status Updates.
 * Handles stock management and concurrency safety.
 */
class OrderController extends Controller
{
    /**
     * Retrieve a history of orders.
     * * Admins see all orders; Customers see only their own.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function index()
    {
        $user = Auth::user();

        // 1. Eager Load 'items'
        // optimization: This solves the "N+1 Problem". Without this, Laravel would run 
        // a separate query for every single order to get its items.
        $query = Order::with('items');

        // 2. Role-based Scoping
        if ($user->role !== 'Admin') {
            $query->where('user_id', $user->id);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Store a new order (Checkout).
     * * Uses transactions and locking to prevent stock inconsistencies.
     *
     * @param  Request  $request
     * @return Order
     * @throws Exception If a product is out of stock.
     */
    public function store(Request $request)
    {
        $request->validate([
            'items'            => 'required|array|min:1',
            'shipping_address' => 'required|array',
            'total'            => 'required|numeric'
        ]);

        return DB::transaction(function () use ($request) {
            $user = Auth::user();
            
            // 1. Create Order
            $order = Order::create([
                'order_number'     => 'ORD-' . strtoupper(Str::random(8)),
                'user_id'          => $user->id,
                'customer_name'    => $user->name,
                'email'            => $user->email,
                'total'            => $request->total,
                'status'           => 'Placed',
                'shipping_address' => $request->shipping_address
            ]);

            // 2. Process Items & Deduct Stock
            foreach ($request->items as $item) {
                $product = Product::where('id', $item['id'])->lockForUpdate()->first();

                if (!$product || $product->stock < $item['quantity']) {
                    throw new Exception("Product {$item['name']} is out of stock.");
                }

                $product->decrement('stock', $item['quantity']);

                OrderItem::create([
                    'order_id'     => $order->id,
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'price'        => $product->price,
                    'quantity'     => $item['quantity'],
                    'image'        => $product->image
                ]);
            }

            // 3. CREATE TRANSACTION RECORD (New Logic)
            Transaction::create([
                'order_id'           => $order->id,
                'user_id'            => $user->id,
                'transaction_number' => 'TRX-' . strtoupper(Str::random(10)),
                'amount'             => $request->total,
                // If payment method is not sent from frontend, default to 'Credit Card'
                'payment_method'     => $request->payment_method ?? 'Credit Card', 
                'status'             => 'Paid'
            ]);

            return $order;
        });
    }
    
    /**
     * Cancel an order and restore stock.
     * * Only allows cancellation if the order hasn't shipped yet.
     *
     * @param  int  $id
     * @return mixed
     */
    public function cancel($id)
    {
        $user = Auth::user();
        
        // Find order belonging to this user
        // findOrFail throws 404 if not found or if user doesn't own it
        $order = Order::where('id', $id)
                      ->where('user_id', $user->id)
                      ->firstOrFail();
        
        // 1. Check if cancellable
        // We usually don't want to cancel orders that are already 'Shipped'
        if (in_array($order->status, ['Placed', 'Processing'])) {
            
            $order->update(['status' => 'Cancelled']);
            
            // 2. Restore Stock
            // Since the order is cancelled, we must add the items back to the inventory.
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)
                       ->increment('stock', $item->quantity);
            }
            
            return $order;
        }
        
        return response()->json(['message' => 'Cannot cancel this order.'], 400);
    }

    /**
     * Update the status of an order (Admin Only).
     *
     * @param  Request  $request
     * @param  int      $id
     * @return Order
     */
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