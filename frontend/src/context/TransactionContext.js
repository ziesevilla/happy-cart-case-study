import React, { createContext, useState, useContext, useEffect } from 'react';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_transactions');
            return saved ? JSON.parse(saved) : [
                // INITIAL MOCK DATA
                { id: 'TRX-99281', orderId: 'ORD-001', date: '2023-10-12', amount: 1299.00, method: 'Credit Card', status: 'Paid' },
                { id: 'TRX-88213', orderId: 'ORD-002', date: '2023-11-05', amount: 599.50, method: 'GCash', status: 'Paid' },
                { id: 'TRX-77321', orderId: 'ORD-004', date: '2023-11-22', amount: 4999.00, method: 'Credit Card', status: 'Failed' },
                { id: 'TRX-66432', orderId: 'ORD-005', date: '2023-11-23', amount: 15499.00, method: 'Credit Card', status: 'Paid' },
                { id: 'TRX-55543', orderId: 'ORD-006', date: '2023-11-24', amount: 3200.00, method: 'PayPal', status: 'Paid' },
                { id: 'TRX-44654', orderId: 'ORD-007', date: '2023-11-25', amount: 899.00, method: 'GCash', status: 'Paid' },
                { id: 'TRX-33765', orderId: 'ORD-008', date: '2023-11-26', amount: 25000.00, method: 'Credit Card', status: 'Refunded' },
                { id: 'TRX-22876', orderId: 'ORD-009', date: '2023-11-27', amount: 1200.00, method: 'COD', status: 'Paid' },
                { id: 'TRX-11987', orderId: 'ORD-010', date: '2023-11-28', amount: 450.00, method: 'GCash', status: 'Paid' },
            ];
        } catch (error) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('happyCart_transactions', JSON.stringify(transactions));
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