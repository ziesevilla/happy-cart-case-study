import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Orders
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to load orders", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setOrders([]);
        }
    }, [user]);

    // 2. Create Order
    const addOrder = async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            setOrders(prev => [response.data, ...prev]);
            return { success: true, order: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Checkout Failed" };
        }
    };

    // 3. Update Status (The Fix is Here)
    const updateOrderStatus = async (orderId, newStatus) => {
        // Optimistic Update (Change UI immediately)
        setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));

        try {
            if (newStatus === 'Cancelled') {
                // Special route for cancelling (handles stock restoration)
                await api.put(`/orders/${orderId}/cancel`);
            } else {
                // 💡 THIS WAS MISSING: Handle Shipped/Delivered/etc.
                await api.put(`/orders/${orderId}/status`, { status: newStatus });
            }
        } catch (error) {
            console.error("Failed to update status", error);
            // Optional: Revert UI if failed
            fetchOrders(); // Reload real data to sync
        }
    };

    return (
        <OrderContext.Provider value={{ orders, updateOrderStatus, addOrder, loading }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => useContext(OrderContext);