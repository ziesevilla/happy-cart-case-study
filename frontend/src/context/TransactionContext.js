import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; 

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. FETCH TRANSACTIONS FROM DB
    const fetchTransactions = async () => {
        try {
            const response = await api.get('/transactions');
            
            // Format data to match what the UI expects
            const formatted = response.data.map(t => ({
                id: t.transaction_number, // Display ID (TRX-...)
                dbId: t.id,               // Internal DB ID (1, 2, 3...)
                orderId: t.order?.order_number || 'N/A',
                date: t.created_at,       // API sends formatted date string
                amount: parseFloat(t.amount),
                method: t.payment_method,
                status: t.status
            }));
            
            setTransactions(formatted);
        } catch (error) {
            console.error("Failed to load transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // 2. PROCESS REFUND
    const updateTransactionStatus = async (trxId, newStatus) => {
        try {
            // Find the numeric DB ID based on the string ID (TRX-...)
            const transaction = transactions.find(t => t.id === trxId);
            if (!transaction) return;

            if (newStatus === 'Refunded') {
                await api.put(`/transactions/${transaction.dbId}/refund`);
            }

            // Optimistic Update (Update UI immediately)
            setTransactions(prev => prev.map(trx => 
                trx.id === trxId ? { ...trx, status: newStatus } : trx
            ));
            return true;
        } catch (error) {
            console.error("Refund failed:", error);
            return false;
        }
    };

    return (
        <TransactionContext.Provider value={{ 
            transactions, 
            loading, 
            updateTransactionStatus, 
            refreshTransactions: fetchTransactions 
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => useContext(TransactionContext);