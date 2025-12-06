import React, { createContext, useState, useContext, useEffect } from 'react';

// Initialize the Context
const CartContext = createContext();

/**
 * CartProvider Component
 * * Manages the shopping cart state.
 * * PERSISTENCE: Automatically saves/loads from LocalStorage so data isn't lost on refresh.
 */
export const CartProvider = ({ children }) => {
    
    // 1. Initialize State (Lazy Loading)
    // We pass a function to useState instead of a direct value.
    // This ensures 'localStorage.getItem' only runs ONCE when the app starts,
    // rather than running on every single component re-render (which is slow).
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('happyCart_items');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error loading cart from localStorage", error);
            return [];
        }
    });

    // 2. Persist State (Auto-Save)
    // Every time the 'cart' state changes (add, remove, update), 
    // we save the new array back to LocalStorage.
    useEffect(() => {
        try {
            localStorage.setItem('happyCart_items', JSON.stringify(cart));
        } catch (error) {
            console.error("Error saving cart to localStorage", error);
        }
    }, [cart]);

    /**
     * Add a product to the cart.
     * * Logic: If item exists, increment quantity. If not, add as new item.
     * @param {object} product 
     */
    const addToCart = (product) => {
        setCart((prevCart) => {
            // Check if this product ID is already in the array
            const existingItem = prevCart.find(item => item.id === product.id);
            
            if (existingItem) {
                // Return a new array with the specific item's quantity updated
                return prevCart.map(item => 
                    item.id === product.id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            }
            // If new, append it with quantity: 1
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    /**
     * Decrease quantity of a specific item.
     * * Logic: If quantity is 1, remove the item entirely. Otherwise, subtract 1.
     * @param {number} productId 
     */
    const decreaseQuantity = (productId) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productId);
            
            // UX Pattern: If the user decreases the last item, delete it.
            if (existingItem?.quantity === 1) {
                return prevCart.filter(item => item.id !== productId);
            }
            
            // Otherwise, simply decrement
            return prevCart.map(item => 
                item.id === productId 
                ? { ...item, quantity: item.quantity - 1 } 
                : item
            );
        });
    };

    /**
     * Remove a single item completely (e.g., Garbage Bin icon).
     * @param {number} productId 
     */
    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    /**
     * Remove multiple items at once.
     * * Usage: Used after a successful checkout to clear ONLY the items that were bought,
     * * while leaving "Saved for Later" items (if you add that feature later).
     * @param {number[]} productIds - Array of IDs to remove
     */
    const removeItems = (productIds) => {
        setCart(prevCart => prevCart.filter(item => !productIds.includes(item.id)));
    };

    /**
     * Wipe the cart completely.
     */
    const clearCart = () => {
        setCart([]);
    };

    /**
     * Calculate Total Price.
     * * Usage: Displayed in the Checkout Summary.
     * @returns {number}
     */
    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    /**
     * Calculate Total Item Count.
     * * Usage: Displayed in the Badge on the Navbar (e.g., the red "3" on the cart icon).
     * @returns {number}
     */
    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            decreaseQuantity, 
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