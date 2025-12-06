import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

// Initialize the Context
const OrderContext = createContext();

/**
 * OrderProvider Component
 * * Manages the history of orders and their real-time status updates.
 * * Connects to the authenticated user to fetch only their data.
 */
export const OrderProvider = ({ children }) => {
    // Access the current user to know WHEN to fetch data
    const { user } = useAuth();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * 1. Fetch Orders Logic
     * * GET /api/orders
     */
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

    /**
     * 2. Synchronization Effect
     * * Automatically loads data when the user logs in.
     * * Automatically clears data when the user logs out (Security).
     */
    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setOrders([]);
        }
    }, [user]);

    /**
     * 3. Create Order (Checkout)
     * * POST /api/orders
     * * @param {object} orderData - Contains items, total, shipping_address
     */
    const addOrder = async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            
            // Update UI: Add the new order to the top of the list immediately
            setOrders(prev => [response.data, ...prev]);
            
            return { success: true, order: response.data };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || "Checkout Failed" 
            };
        }
    };

    /**
     * 4. Update Status (Cancel or Admin Update)
     * * Handles "Optimistic Updates" for a snappy UI.
     * * Routes to different API endpoints based on the action.
     */
    const updateOrderStatus = async (orderId, newStatus) => {
        
        // --- OPTIMISTIC UPDATE START ---
        // We update the UI *before* the API responds. 
        // This makes the button click feel instant to the user.
        setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
        // -------------------------------

        try {
            // Logic Split:
            // "Cancelled" requires special business logic (restocking items),
            // so it has its own dedicated endpoint in the backend.
            if (newStatus === 'Cancelled') {
                await api.put(`/orders/${orderId}/cancel`);
            } else {
                // Other statuses (Shipped, Delivered) use the generic status endpoint.
                await api.put(`/orders/${orderId}/status`, { status: newStatus });
            }
        } catch (error) {
            console.error("Failed to update status", error);
            
            // ROLLBACK:
            // If the API fails (e.g., Internet cuts out), the UI is now lying to the user.
            // We fetch the real data again to "revert" the change.
            fetchOrders(); 
        }
    };

    return (
        <OrderContext.Provider value={{ orders, updateOrderStatus, addOrder, loading }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => useContext(OrderContext);