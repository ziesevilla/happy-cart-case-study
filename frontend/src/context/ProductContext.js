import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; // 💡 Import the bridge

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Products from Database
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

    // Load data when the app starts
    useEffect(() => {
        fetchProducts();
    }, []);

    // 2. Add Product (Handles JSON or FormData)
    const addProduct = async (productData) => {
        try {
            let response;
            // Check if we are sending a File (FormData)
            if (productData instanceof FormData) {
                response = await api.post('/products', productData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Standard JSON (for text-only updates)
                response = await api.post('/products', productData);
            }
            
            setProducts(prev => [response.data, ...prev]);
            return { success: true };
        } catch (error) {
            console.error("Failed to add product:", error);
            return { success: false, message: error.response?.data?.message || "Failed to add" };
        }
    };

    // 3. Update Product (Handles File Uploads via Spoofing)
    const updateProduct = async (id, updatedData) => {
        try {
            let response;
            
            if (updatedData instanceof FormData) {
                // 💡 METHOD SPOOFING: Laravel requires POST for file updates
                updatedData.append('_method', 'PUT'); 
                response = await api.post(`/products/${id}`, updatedData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Standard JSON Update
                response = await api.put(`/products/${id}`, updatedData);
            }
            
            setProducts(prev => prev.map(p => p.id === id ? response.data : p));
            return { success: true };
        } catch (error) {
            console.error("Failed to update product:", error);
            return { success: false, message: "Failed to update" };
        }
    };

    // 4. Delete Product (Admin)
    const deleteProduct = async (id) => {
        try {
            // DELETE http://localhost/api/products/{id}
            await api.delete(`/products/${id}`);
            
            // Remove from local state
            setProducts(prev => prev.filter(p => p.id !== id));
            return { success: true };
        } catch (error) {
            console.error("Failed to delete product:", error);
            return { success: false, message: "Failed to delete" };
        }
    };

    // 5. Stock Management (For Checkout)
    // Note: In a real app, the backend handles this during checkout. 
    // We will simulate the UI update for now.
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

    // Reset Data (Not needed for DB version, but kept for compatibility)
    const resetData = () => {
        fetchProducts(); // Just re-fetch from DB
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