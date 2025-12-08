<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Get all transactions (Admin only).
     */
    public function index()
    {
        // Fetch transactions, sorted by newest first, with Order ID info
        return Transaction::with('order:id,order_number')
                          ->orderBy('created_at', 'desc')
                          ->get();
    }

    /**
     * Process a Refund.
     */
    public function refund($id)
    {
        $transaction = Transaction::findOrFail($id);
        
        if ($transaction->status === 'Refunded') {
            return response()->json(['message' => 'Already refunded'], 400);
        }

        $transaction->update(['status' => 'Refunded']);

        return $transaction;
    }
}