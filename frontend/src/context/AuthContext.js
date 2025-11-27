import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Check localStorage
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) { return null; }
    });

    // --- GLOBAL ADDRESS STATE ---
    const [addresses, setAddresses] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_addresses');
            return saved ? JSON.parse(saved) : [];
        } catch (error) { return []; }
    });

    // --- GLOBAL ORDER STATE (NEW) ---
    const [orders, setOrders] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_orders');
            // Default Mock Orders if empty
            const MOCK_ORDERS = [
                { 
                    id: 'ORD-001', 
                    date: 'Oct 12, 2023', 
                    itemsCount: 2, 
                    total: 1299.00, 
                    status: 'Delivered',
                    details: [
                        { id: 101, name: 'Floral Summer Dress', price: 899.00, qty: 1, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=100' },
                        { id: 102, name: 'Gold Layered Necklace', price: 400.00, qty: 1, image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=100' }
                    ]
                }
            ];
            return saved ? JSON.parse(saved) : MOCK_ORDERS;
        } catch (error) { return []; }
    });

    // Persistence Effects
    useEffect(() => { localStorage.setItem('happyCart_addresses', JSON.stringify(addresses)); }, [addresses]);
    useEffect(() => { localStorage.setItem('happyCart_orders', JSON.stringify(orders)); }, [orders]);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    // --- ACTIONS ---
    const addAddress = (newAddress) => {
        const address = { id: Date.now(), ...newAddress, default: addresses.length === 0 };
        setAddresses([...addresses, address]);
    };

    const updateAddress = (id, updatedData) => {
        setAddresses(addresses.map(addr => addr.id === id ? { ...addr, ...updatedData } : addr));
    };

    const deleteAddress = (id) => {
        setAddresses(addresses.filter(addr => addr.id !== id));
    };

    const setDefaultAddress = (id) => {
        setAddresses(addresses.map(addr => ({ ...addr, default: addr.id === id })));
    };

    // --- ORDER ACTIONS (NEW) ---
    const addOrder = (order) => {
        // Add new order to the TOP of the list
        setOrders(prev => [order, ...prev]);
    };

    const updateOrder = (orderId, newStatus) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    return (
        <AuthContext.Provider value={{ 
            user, login, logout,
            addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
            orders, addOrder, updateOrder // Expose Order logic
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);