import React, { createContext, useState, useContext, useEffect } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_orders_v2');
            return saved ? JSON.parse(saved) : [
                // INITIAL MOCK DATA (Rich data for both Admin and Customer views)
                { 
                    id: 'ORD-001', 
                    customerName: 'John Doe',
                    email: 'user@example.com', // Links to the customer account
                    date: 'Oct 12, 2023', 
                    total: 1299.00, 
                    status: 'Delivered',
                    itemsCount: 2,
                    shippingAddress: { name: 'John Doe', street: '123 Acacia Ave', city: 'Makati', zip: '1200' },
                    details: [ 
                        { id: 1, name: 'Floral Summer Dress', price: 899.00, qty: 1, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=100' }, 
                        { id: 7, name: 'Gold Layered Necklace', price: 400.00, qty: 1, image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=100' } 
                    ]
                },
                { 
                    id: 'ORD-002', 
                    customerName: 'John Doe',
                    email: 'user@example.com',
                    date: 'Nov 05, 2023', 
                    total: 599.50, 
                    status: 'Shipped', 
                    itemsCount: 1,
                    shippingAddress: { name: 'John Doe', street: '123 Acacia Ave', city: 'Makati', zip: '1200' },
                    details: [ { id: 5, name: 'White Leather Sneakers', price: 599.50, qty: 1, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=100' } ]
                },
                { 
                    id: 'ORD-003', 
                    customerName: 'Jane Smith',
                    email: 'jane@example.com',
                    date: 'Nov 20, 2023', 
                    total: 2100.00, 
                    status: 'Processing', 
                    itemsCount: 3,
                    shippingAddress: { name: 'Jane Smith', street: '456 Mango St', city: 'Cebu', zip: '6000' },
                    details: [ { id: 3, name: 'High-Waist Mom Jeans', price: 700.00, qty: 2, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=100' } ]
                },
                {
                    id: 'ORD-004',
                    customerName: 'Rachel Zane',
                    email: 'rachel@example.com',
                    date: 'Nov 22, 2023',
                    total: 4999.00,
                    status: 'Placed',
                    itemsCount: 1,
                    shippingAddress: { name: 'Rachel Zane', street: '789 Pearson Hardman', city: 'Taguig', zip: '1630' },
                    details: [ { id: 8, name: 'Classic Trench Coat', price: 4999.00, qty: 1, image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=100' } ]
                }
            ];
        } catch (error) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('happyCart_orders_v2', JSON.stringify(orders));
    }, [orders]);

    // --- ACTIONS ---
    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    const addOrder = (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
    };

    return (
        <OrderContext.Provider value={{ orders, updateOrderStatus, addOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => useContext(OrderContext);