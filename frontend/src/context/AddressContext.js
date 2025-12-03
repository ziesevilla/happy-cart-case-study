import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
    const [addresses, setAddresses] = useState([]);
    const { user } = useAuth(); // Get current user

    // 1. Fetch Addresses on Load
    useEffect(() => {
        if (user) {
            fetchAddresses();
        } else {
            setAddresses([]);
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/addresses');
            setAddresses(response.data);
        } catch (error) {
            console.error("Error loading addresses", error);
        }
    };

    // 2. Add Address
    const addAddress = async (userId, newAddressData) => {
        try {
            const response = await api.post('/addresses', newAddressData);
            setAddresses(prev => [...prev, response.data]);
            return true;
        } catch (error) {
            console.error("Failed to add address", error);
            return false;
        }
    };

    // 3. Delete Address
    const deleteAddress = async (id) => {
        try {
            await api.delete(`/addresses/${id}`);
            setAddresses(prev => prev.filter(addr => addr.id !== id));
        } catch (error) {
            console.error("Failed to delete address", error);
        }
    };

    // Helper: Get addresses for specific user (Frontend filter not needed if API filters by token, but kept for compatibility)
    const getUserAddresses = (userId) => {
        return addresses; // The API already filters by the logged-in user
    };

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

export const useAddress = () => useContext(AddressContext);