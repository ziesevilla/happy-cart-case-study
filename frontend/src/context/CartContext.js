import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const CartContext = createContext();

// Create a provider component
export const CartProvider = ({ children }) => {
    // Initialize cart from localStorage if available, otherwise default to empty array
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('happyCart_items');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error loading cart from localStorage", error);
            return [];
        }
    });

    // Save to localStorage whenever the cart changes
    useEffect(() => {
        try {
            localStorage.setItem('happyCart_items', JSON.stringify(cart));
        } catch (error) {
            console.error("Error saving cart to localStorage", error);
        }
    }, [cart]);

    // Add item to cart
    const addToCart = (product) => {
        setCart((prevCart) => {
            // Check if item already exists
            const existingItem = prevCart.find(item => item.id === product.id);
            
            if (existingItem) {
                // If exists, just increase quantity
                return prevCart.map(item => 
                    item.id === product.id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            }
            // Otherwise add new item with quantity 1
            return [...prevCart, { ...product, quantity: 1 }];
        });
        // Note: You can remove this alert if you want a smoother experience
        // alert(`${product.name} added to cart!`);
    };

    // Remove item from cart
    const removeFromCart = (productId) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productId);
            if (existingItem.quantity === 1) {
                return prevCart.filter(item => item.id !== productId);
            }
            return prevCart.map(item => 
                item.id === productId 
                ? { ...item, quantity: item.quantity - 1 } 
                : item
            );
        });
    };

    // Clear cart (for checkout)
    const clearCart = () => {
        setCart([]);
    };

    // Calculate total price
    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Get total number of items (for badge)
    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            clearCart, 
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use the cart easily
export const useCart = () => useContext(CartContext);