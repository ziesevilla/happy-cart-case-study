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
 * * Updated to handle Payment Method retrieval from Transactions.
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

        // 1. Eager Load 'items' AND 'transaction'
        // 🆕 UPDATED: We load 'transaction' because that is where payment_method lives.
        $query = Order::with(['items', 'transaction']);

        // 2. Role-based Scoping
        if ($user->role !== 'Admin') {
            $query->where('user_id', $user->id);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        // 3. Map Payment Method to Order Object
        // 🆕 ADDED: This extracts 'payment_method' from the transaction and puts it 
        // directly on the order object so the frontend (order.payment_method) can read it.
        $orders->transform(function ($order) {
            $order->payment_method = $order->transaction ? $order->transaction->payment_method : 'Credit Card';
            return $order;
        });

        return $orders;
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
            'total'            => 'required|numeric',
            // 🆕 ADDED: Validate payment method if present
            'payment_method'   => 'nullable|string' 
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

            // 3. CREATE TRANSACTION RECORD
            Transaction::create([
                'order_id'           => $order->id,
                'user_id'            => $user->id,
                'transaction_number' => 'TRX-' . strtoupper(Str::random(10)),
                'amount'             => $request->total,
                // 🆕 UPDATED: Explicitly use input helper for clarity
                'payment_method'     => $request->input('payment_method', 'Credit Card'), 
                'status'             => 'Paid'
            ]);

            // 🆕 Return the order with the payment method attached (for immediate frontend use)
            $order->payment_method = $request->input('payment_method', 'Credit Card');

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
        $order = Order::where('id', $id)
                      ->where('user_id', $user->id)
                      ->firstOrFail();
        
        // 1. Check if cancellable
        if (in_array($order->status, ['Placed', 'Processing'])) {
            
            $order->update(['status' => 'Cancelled']);
            
            // 2. Restore Stock
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