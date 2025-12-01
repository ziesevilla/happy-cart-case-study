import React, { createContext, useState, useContext, useEffect } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState(() => {
        try {
            // 💡 Changed Key to v3 to force a reset of the data
            const saved = localStorage.getItem('happyCart_orders_v3');
            return saved ? JSON.parse(saved) : [
                // --- MOCK DATA SYNCED WITH FASHION INVENTORY ---
                { 
                    id: 'ORD-001', 
                    customerName: 'John Doe',
                    email: 'user@example.com',
                    date: 'Oct 12, 2023', 
                    total: 110.00, // Matched total
                    status: 'Delivered',
                    itemsCount: 2,
                    shippingAddress: { name: 'John Doe', street: '123 Acacia Ave', city: 'Makati', zip: '1200' },
                    details: [ 
                        // ID 1: Vintage Denim Jacket ($85)
                        { id: 1, name: 'Vintage Wash Denim Jacket', price: 85.00, qty: 1, image: '' }, 
                        // ID 2: Crewneck Tee ($25)
                        { id: 2, name: 'Essential Crewneck T-Shirt', price: 25.00, qty: 1, image: '' } 
                    ]
                },
                { 
                    id: 'ORD-002', 
                    customerName: 'Jane Smith',
                    email: 'jane@example.com',
                    date: 'Nov 05, 2023', 
                    total: 65.00, 
                    status: 'Shipped', 
                    itemsCount: 1,
                    shippingAddress: { name: 'Jane Smith', street: '456 Mango St', city: 'Cebu', zip: '6000' },
                    details: [ 
                        // ID 6: Urban Canvas High-Tops ($65)
                        { id: 6, name: 'Urban Canvas High-Tops', price: 65.00, qty: 1, image: '' } 
                    ]
                },
                { 
                    id: 'ORD-003', 
                    customerName: 'Michael Scott',
                    email: 'michael@dundermifflin.com',
                    date: 'Nov 20, 2023', 
                    total: 165.00, 
                    status: 'Processing', 
                    itemsCount: 3,
                    shippingAddress: { name: 'Michael Scott', street: '1725 Slough Ave', city: 'Scranton', zip: '18505' },
                    details: [ 
                        // ID 3: Chino Pants ($55 x 3 = $165)
                        { id: 3, name: 'Slim-Fit Chino Pants', price: 55.00, qty: 3, image: '' } 
                    ]
                },
                {
                    id: 'ORD-004',
                    customerName: 'Rachel Zane',
                    email: 'rachel@example.com',
                    date: 'Nov 22, 2023',
                    total: 150.00,
                    status: 'Placed',
                    itemsCount: 1,
                    shippingAddress: { name: 'Rachel Zane', street: '789 Pearson Hardman', city: 'Taguig', zip: '1630' },
                    details: [ 
                        // ID 11: Aviator Sunglasses ($150)
                        { id: 11, name: 'Polarized Aviator Sunglasses', price: 150.00, qty: 1, image: '' } 
                    ]
                },
                {
                    id: 'ORD-005',
                    customerName: 'Dwight Schrute',
                    email: 'dwight@dundermifflin.com',
                    date: 'Nov 25, 2023',
                    total: 180.00,
                    status: 'Cancelled',
                    itemsCount: 1,
                    shippingAddress: { name: 'Dwight Schrute', street: 'Schrute Farms', city: 'Honesdale', zip: '18431' },
                    details: [ 
                        // ID 12: Leather Watch ($180)
                        { id: 12, name: 'Minimalist Leather Watch', price: 180.00, qty: 1, image: '' } 
                    ]
                }
            ];
        } catch (error) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('happyCart_orders_v3', JSON.stringify(orders));
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