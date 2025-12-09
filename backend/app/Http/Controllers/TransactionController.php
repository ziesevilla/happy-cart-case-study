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
        // 1. Fetch transactions
        // 2. We MUST include 'created_at' in the order selection because
        //    the Order model has an appended attribute 'date_formatted' that uses it.
        return Transaction::with('order:id,order_number,created_at,status') // <--- ADD created_at HERE
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