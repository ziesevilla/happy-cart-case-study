import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * 1. Fetch Products
     * * Loads the initial catalog from the database.
     */
    const fetchProducts = async () => {
        setLoading(true);
        try {
            // GET http://localhost/api/products
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
        setLoading(false);
    };

    // Load data once when the app starts
    useEffect(() => {
        fetchProducts();
    }, []);

    /**
     * 2. Add Product (Admin)
     * * Handles both text-only creation and File Uploads.
     * * @param {FormData|object} productData 
     */
    const addProduct = async (productData) => {
        try {
            let response;
            
            // Check if we are uploading an image (FormData)
            if (productData instanceof FormData) {
                response = await api.post('/products', productData, {
                    // Critical: Tell the server a file is coming
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Standard JSON (Text only)
                response = await api.post('/products', productData);
            }
            
            // UI Update: Add new item to the top of the list
            setProducts(prev => [response.data, ...prev]);
            return { success: true };
        } catch (error) {
            console.error("Failed to add product:", error);
            return { success: false, message: error.response?.data?.message || "Failed to add" };
        }
    };

    /**
     * 3. Update Product (The Tricky Part)
     * * Uses "Method Spoofing" to handle file updates in PHP/Laravel.
     */
    const updateProduct = async (id, updatedData) => {
        try {
            let response;
            
            if (updatedData instanceof FormData) {
                // --- METHOD SPOOFING EXPLAINED ---
                // PHP has a known limitation where it cannot read files from a 'PUT' request.
                // WORKAROUND: We send a 'POST' request but add a hidden field '_method' = 'PUT'.
                // Laravel sees this field and treats the request exactly like a real PUT.
                updatedData.append('_method', 'PUT'); 
                
                response = await api.post(`/products/${id}`, updatedData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Standard JSON Update (No files involved)
                response = await api.put(`/products/${id}`, updatedData);
            }
            
            // UI Update: Find the item by ID and replace it with the new server response
            setProducts(prev => prev.map(p => p.id === id ? response.data : p));
            return { success: true };
        } catch (error) {
            console.error("Failed to update product:", error);
            return { success: false, message: "Failed to update" };
        }
    };

    /**
     * 4. Delete Product (Admin)
     */
    const deleteProduct = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            
            // UI Update: Remove the item from the local array
            setProducts(prev => prev.filter(p => p.id !== id));
            return { success: true };
        } catch (error) {
            console.error("Failed to delete product:", error);
            return { success: false, message: "Failed to delete" };
        }
    };

    /**
     * 5. Stock Adjustment (Visual Only)
     * * This runs after a successful checkout to update the numbers on the screen
     * * without needing to re-fetch the entire database.
     */
    const updateStockAfterPurchase = (purchasedItems) => {
        setProducts(prevProducts => {
            return prevProducts.map(product => {
                const boughtItem = purchasedItems.find(item => item.id === product.id);
                if (boughtItem) {
                    const newStock = Math.max(0, product.stock - boughtItem.quantity);
                    return { ...product, stock: newStock };
                }
                return product;
            });
        });
    };

    const resetData = () => {
        fetchProducts(); 
    };

    return (
        <ProductContext.Provider value={{ 
            products, 
            loading,
            addProduct, 
            updateProduct, 
            deleteProduct, 
            resetData,
            updateStockAfterPurchase 
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);