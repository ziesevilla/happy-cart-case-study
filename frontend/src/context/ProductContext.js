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

    // 2. Add Product (Admin)
    const addProduct = async (newProductData) => {
        try {
            // POST http://localhost/api/products
            const response = await api.post('/products', newProductData);
            
            // Add the new product from DB (which has the real ID) to our state
            setProducts(prev => [response.data, ...prev]);
            return { success: true };
        } catch (error) {
            console.error("Failed to add product:", error);
            return { success: false, message: error.response?.data?.message || "Failed to add product" };
        }
    };

    // 3. Update Product (Admin)
    const updateProduct = async (id, updatedData) => {
        try {
            // PUT http://localhost/api/products/{id}
            const response = await api.put(`/products/${id}`, updatedData);
            
            // Update local state
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