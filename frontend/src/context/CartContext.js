import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Initialize cart from localStorage
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('happyCart_items');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error loading cart from localStorage", error);
            return [];
        }
    });

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('happyCart_items', JSON.stringify(cart));
        } catch (error) {
            console.error("Error saving cart to localStorage", error);
        }
    }, [cart]);

    // Add item
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item => 
                    item.id === product.id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    // NEW: Decrease Quantity (only remove if qty becomes 0)
    const decreaseQuantity = (productId) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productId);
            if (existingItem?.quantity === 1) {
                // If quantity is 1, remove it
                return prevCart.filter(item => item.id !== productId);
            }
            // Otherwise just decrease
            return prevCart.map(item => 
                item.id === productId 
                ? { ...item, quantity: item.quantity - 1 } 
                : item
            );
        });
    };

    // Remove single item completely (Trash button)
    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    // Remove multiple items (for checkout)
    const removeItems = (productIds) => {
        setCart(prevCart => prevCart.filter(item => !productIds.includes(item.id)));
    };

    // Clear all
    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            decreaseQuantity, // Exported here
            removeFromCart, 
            removeItems,
            clearCart, 
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);