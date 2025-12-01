import React, { createContext, useState, useContext, useEffect } from 'react';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState(() => {
        try {
            // 💡 Changed Key to v3 to force reset
            const saved = localStorage.getItem('happyCart_transactions_v3');
            return saved ? JSON.parse(saved) : [
                // --- MOCK DATA SYNCED WITH NEW ORDERS ---
                
                // Order 1: John Doe (Delivered)
                { id: 'TRX-99281', orderId: 'ORD-001', date: 'Oct 12, 2023', amount: 260.00, method: 'Credit Card', status: 'Paid' },
                
                // Order 2: Jane Smith (Shipped)
                { id: 'TRX-88213', orderId: 'ORD-002', date: 'Nov 05, 2023', amount: 215.00, method: 'GCash', status: 'Paid' },
                
                // Order 3: Michael Scott (Processing)
                { id: 'TRX-66432', orderId: 'ORD-003', date: 'Nov 20, 2023', amount: 315.00, method: 'Credit Card', status: 'Paid' },
                
                // Order 4: Rachel Zane (Placed - Failed Attempt)
                { id: 'TRX-77321', orderId: 'ORD-004', date: 'Nov 22, 2023', amount: 300.00, method: 'Credit Card', status: 'Failed' },
                
                // Order 4: Rachel Zane (Retry - Successful)
                { id: 'TRX-77322', orderId: 'ORD-004', date: 'Nov 22, 2023', amount: 300.00, method: 'PayPal', status: 'Paid' },
                
                // Order 5: Dwight Schrute (Cancelled/Refunded)
                { id: 'TRX-33765', orderId: 'ORD-005', date: 'Nov 25, 2023', amount: 330.00, method: 'Credit Card', status: 'Refunded' },
            ];
        } catch (error) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('happyCart_transactions_v3', JSON.stringify(transactions));
    }, [transactions]);

    // --- ACTIONS ---
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