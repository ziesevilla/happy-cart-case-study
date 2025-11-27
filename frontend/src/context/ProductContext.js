import React, { createContext, useState, useContext, useEffect } from 'react';
import { ALL_PRODUCTS as INITIAL_PRODUCTS } from '../data/products'; // Import your existing data as a starting point

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    // Initialize products from local storage or use default data
    const [products, setProducts] = useState(() => {
        try {
            const savedProducts = localStorage.getItem('happyCart_products');
            return savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS;
        } catch (error) {
            return INITIAL_PRODUCTS;
        }
    });

    useEffect(() => {
        localStorage.setItem('happyCart_products', JSON.stringify(products));
    }, [products]);

    // --- ACTIONS ---
    
    const addProduct = (newProduct) => {
        // Auto-increment ID based on highest existing ID
        const maxId = Math.max(...products.map(p => p.id), 0);
        const productWithId = { ...newProduct, id: maxId + 1 };
        setProducts([productWithId, ...products]); // Add to top
    };

    const updateProduct = (id, updatedData) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);