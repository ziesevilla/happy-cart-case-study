import React, { createContext, useState, useContext, useEffect } from 'react';

// Initialize Context
const TransactionContext = createContext();

/**
 * TransactionProvider Component
 * * Manages the financial history of the store (Payments & Refunds).
 * * currently uses Mock Data to simulate a payment gateway like Stripe or PayPal.
 */
export const TransactionProvider = ({ children }) => {
    
    // =================================================================
    // 1. STATE: FINANCIAL RECORDS
    // =================================================================
    const [transactions, setTransactions] = useState(() => {
        try {
            // CACHE BUSTING STRATEGY:
            // We use '_v3' in the key name. If you change the data structure in code,
            // simply increment this number (e.g., to '_v4'). This forces the browser
            // to ignore the old, incompatible data in LocalStorage and load the new defaults.
            const saved = localStorage.getItem('happyCart_transactions_v3');
            
            return saved ? JSON.parse(saved) : [
                // --- MOCK DATA (Simulates a Database response) ---
                
                // Scenario: Successful Standard Order
                { id: 'TRX-99281', orderId: 'ORD-001', date: 'Oct 12, 2023', amount: 260.00, method: 'Credit Card', status: 'Paid' },
                
                // Scenario: Alternative Payment Method
                { id: 'TRX-88213', orderId: 'ORD-002', date: 'Nov 05, 2023', amount: 215.00, method: 'GCash', status: 'Paid' },
                
                // Scenario: Recent Successful Order
                { id: 'TRX-66432', orderId: 'ORD-003', date: 'Nov 20, 2023', amount: 315.00, method: 'Credit Card', status: 'Paid' },
                
                // Scenario: Payment Failed (e.g., Insufficient Funds)
                { id: 'TRX-77321', orderId: 'ORD-004', date: 'Nov 22, 2023', amount: 300.00, method: 'Credit Card', status: 'Failed' },
                
                // Scenario: Retry Success (User tried again with PayPal)
                { id: 'TRX-77322', orderId: 'ORD-004', date: 'Nov 22, 2023', amount: 300.00, method: 'PayPal', status: 'Paid' },
                
                // Scenario: Refund Issued (Admin Action)
                { id: 'TRX-33765', orderId: 'ORD-005', date: 'Nov 25, 2023', amount: 330.00, method: 'Credit Card', status: 'Refunded' },
            ];
        } catch (error) { 
            return []; 
        }
    });

    // =================================================================
    // 2. PERSISTENCE
    // =================================================================
    useEffect(() => {
        localStorage.setItem('happyCart_transactions_v3', JSON.stringify(transactions));
    }, [transactions]);

    // =================================================================
    // 3. ACTIONS
    // =================================================================

    /**
     * Update the status of a transaction (e.g., Marking a 'Paid' transaction as 'Refunded').
     * * @param {string} id - The Transaction ID (TRX-...)
     * * @param {string} newStatus - 'Paid', 'Failed', 'Refunded'
     */
    const updateTransactionStatus = (id, newStatus) => {
        setTransactions(prev => prev.map(trx => 
            trx.id === id ? { ...trx, status: newStatus } : trx
        ));
    };

    return (
        <TransactionContext.Provider value={{ transactions, updateTransactionStatus }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => useContext(TransactionContext);