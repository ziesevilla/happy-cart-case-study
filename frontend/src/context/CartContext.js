import React, { createContext, useState, useContext } from 'react';

// Create the context
const CartContext = createContext();

// Create a provider component
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

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
        // Optional: Show a temporary alert (In real app, use a Toast notification)
        alert(`${product.name} added to cart!`);
    };

    // Remove item from cart
    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
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