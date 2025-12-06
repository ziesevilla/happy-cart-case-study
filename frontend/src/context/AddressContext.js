import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

// Initialize the Context
const AddressContext = createContext();

/**
 * AddressProvider Component
 * * Wraps the application (or specific parts of it) to provide global access 
 * * to the user's address book.
 * * Handles syncing state between the Backend API and Frontend UI.
 */
export const AddressProvider = ({ children }) => {
    // State to hold the list of addresses
    const [addresses, setAddresses] = useState([]);
    
    // Dependency: We need to know IF a user is logged in to fetch their data.
    const { user } = useAuth(); 

    /**
     * 1. Automatic Data Fetching
     * * This Effect runs whenever the 'user' object changes (Login or Logout).
     */
    useEffect(() => {
        if (user) {
            // If logged in, fetch data from API
            fetchAddresses();
        } else {
            // Security: If logged out, strictly clear the state
            // so the previous user's data doesn't linger.
            setAddresses([]);
        }
    }, [user]);

    /**
     * Fetch all addresses from the API.
     */
    const fetchAddresses = async () => {
        try {
            // GET /addresses (Backend uses Token to identify user)
            const response = await api.get('/addresses');
            setAddresses(response.data);
        } catch (error) {
            console.error("Error loading addresses", error);
        }
    };

    /**
     * Add a new address.
     * * @param {any} userId - (Optional) Not strictly needed as Backend uses Token.
     * @param {object} newAddressData - The form data (street, city, etc.)
     * @returns {Promise<boolean>} Success status
     */
    const addAddress = async (userId, newAddressData) => {
        try {
            const response = await api.post('/addresses', newAddressData);
            
            // State Update: Append the new address (with ID from DB) to the list
            setAddresses(prev => [...prev, response.data]);
            
            return true; // Return success for UI feedback (e.g., Close Modal)
        } catch (error) {
            console.error("Failed to add address", error);
            return false;
        }
    };

    /**
     * Delete an address by ID.
     * * @param {number} id - The ID of the address to delete.
     */
    const deleteAddress = async (id) => {
        try {
            await api.delete(`/addresses/${id}`);
            
            // State Update: Filter out the deleted item immediately
            // so the UI feels responsive without needing a page refresh.
            setAddresses(prev => prev.filter(addr => addr.id !== id));
        } catch (error) {
            console.error("Failed to delete address", error);
        }
    };

    /**
     * Helper: Get current list.
     * Note: The filtering happens on the Backend (via Token).
     * This function just returns the already-filtered state.
     */
    const getUserAddresses = (userId) => {
        return addresses; 
    };

    // Expose these values to any component wrapped by this Provider
    return (
        <AddressContext.Provider value={{ 
            addresses, 
            getUserAddresses, 
            addAddress, 
            deleteAddress 
        }}>
            {children}
        </AddressContext.Provider>
    );
};

/**
 * Custom Hook
 * * Usage: const { addresses, addAddress } = useAddress();
 */
export const useAddress = () => useContext(AddressContext);