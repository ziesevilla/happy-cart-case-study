import React, { createContext, useState, useContext, useEffect } from 'react';

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
    // --- GLOBAL ADDRESS STATE ---
    const [addresses, setAddresses] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_addresses');
            return saved ? JSON.parse(saved) : [
                // Default Mock Data (Only if storage is empty)
                { 
                    id: 1, 
                    label: 'Home', 
                    firstName: 'John', 
                    lastName: 'Doe', 
                    street: '123 Acacia Avenue, Green Village', 
                    city: 'Makati City', 
                    zip: '1200', 
                    phone: '0912 345 6789',
                    default: true 
                },
                { 
                    id: 2, 
                    label: 'Office', 
                    firstName: 'John', 
                    lastName: 'Doe', 
                    street: '45th Floor, Tech Tower, BGC', 
                    city: 'Taguig City', 
                    zip: '1634', 
                    phone: '0912 345 6789',
                    default: false 
                }
            ];
        } catch (error) {
            console.error("Error loading addresses from localStorage", error);
            return [];
        }
    });

    // Save to localStorage whenever addresses change
    useEffect(() => {
        try {
            localStorage.setItem('happyCart_addresses', JSON.stringify(addresses));
        } catch (error) {
            console.error("Error saving addresses to localStorage", error);
        }
    }, [addresses]);

    // --- ADDRESS ACTIONS ---
    const addAddress = (newAddress) => {
        const address = { 
            id: Date.now(), 
            ...newAddress, 
            default: addresses.length === 0 // First address is default
        };
        // If this is the first address, make it default, otherwise keep existing defaults
        setAddresses([...addresses, address]);
    };

    const updateAddress = (id, updatedData) => {
        setAddresses(addresses.map(addr => 
            addr.id === id ? { ...addr, ...updatedData } : addr
        ));
    };

    const deleteAddress = (id) => {
        setAddresses(addresses.filter(addr => addr.id !== id));
    };

    const setDefaultAddress = (id) => {
        setAddresses(addresses.map(addr => ({
            ...addr,
            default: addr.id === id
        })));
    };

    return (
        <AddressContext.Provider value={{ 
            addresses,      
            addAddress,     
            updateAddress,
            deleteAddress,
            setDefaultAddress
        }}>
            {children}
        </AddressContext.Provider>
    );
};

export const useAddress = () => useContext(AddressContext);