import React, { createContext, useState, useContext, useEffect } from 'react';

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
    // --- GLOBAL ADDRESS STATE ---
    const [addresses, setAddresses] = useState(() => {
        try {
            // 💡 Updated key to v3 to load new data
            const saved = localStorage.getItem('happyCart_addresses_v3');
            return saved ? JSON.parse(saved) : [
                // --- USER ID 1: John Doe ---
                { 
                    id: 1, 
                    userId: 1, 
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
                    userId: 1, 
                    label: 'Office', 
                    firstName: 'John', 
                    lastName: 'Doe', 
                    street: '45th Floor, Tech Tower, BGC', 
                    city: 'Taguig City', 
                    zip: '1634', 
                    phone: '0912 345 6789',
                    default: false 
                },

                // --- USER ID 2: Jane Smith ---
                {
                    id: 3,
                    userId: 2,
                    label: 'Home',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    street: '456 Mango Avenue',
                    city: 'Cebu City',
                    zip: '6000',
                    phone: '0917 888 9999',
                    default: true
                },

                // --- USER ID 3: Admin User ---
                {
                    id: 4,
                    userId: 3,
                    label: 'HQ',
                    firstName: 'Admin',
                    lastName: 'User',
                    street: 'Unit 101, Corporate Center, Ayala Alabang',
                    city: 'Muntinlupa City',
                    zip: '1780',
                    phone: '0918 123 4567',
                    default: true
                },

                // --- USER ID 4: Suspended User ---
                {
                    id: 5,
                    userId: 4,
                    label: 'Home',
                    firstName: 'Suspended',
                    lastName: 'User',
                    street: 'Block 9 Lot 4, Random Street',
                    city: 'Quezon City',
                    zip: '1100',
                    phone: '0922 555 1234',
                    default: true
                },

                // --- USER ID 5: Michael Scott ---
                {
                    id: 6,
                    userId: 5,
                    label: 'Condo',
                    firstName: 'Michael',
                    lastName: 'Scott',
                    street: '1725 Slough Avenue',
                    city: 'Scranton (Pasig Branch)', // Localized for fun context
                    zip: '1600',
                    phone: '0999 999 9999',
                    default: true
                },

                // --- USER ID 6: Dwight Schrute ---
                {
                    id: 7,
                    userId: 6,
                    label: 'Farm',
                    firstName: 'Dwight',
                    lastName: 'Schrute',
                    street: 'Schrute Farms, Beets Drive',
                    city: 'Honesdale (Laguna Branch)', 
                    zip: '4030',
                    phone: '0919 000 0001',
                    default: true
                }
            ];
        } catch (error) {
            console.error("Error loading addresses", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('happyCart_addresses_v3', JSON.stringify(addresses));
    }, [addresses]);

    const getUserAddresses = (userId) => {
        if (!userId) return []; 
        // 💡 Convert both to String to ensure types match
        return addresses.filter(addr => String(addr.userId) === String(userId));
    };

    // --- ACTIONS ---
    const addAddress = (userId, newAddress) => {
        const userAddresses = getUserAddresses(userId);
        const address = { 
            id: Date.now(), 
            userId, 
            ...newAddress, 
            // If user has no addresses yet, make this the default
            default: userAddresses.length === 0 
        };
        setAddresses(prev => [...prev, address]);
    };

    const updateAddress = (id, updatedData) => {
        setAddresses(prev => prev.map(addr => 
            addr.id === id ? { ...addr, ...updatedData } : addr
        ));
    };

    // 💡 DELETE LOGIC: Enforce "At least one address" rule
    const deleteAddress = (id) => {
        const addressToDelete = addresses.find(addr => addr.id === id);
        
        if (!addressToDelete) return; 

        const userAddresses = addresses.filter(addr => addr.userId === addressToDelete.userId);

        if (userAddresses.length <= 1) {
            alert("Action Denied: A user must have at least one address.");
            return;
        }

        let updatedAddresses = addresses.filter(addr => addr.id !== id);

        if (addressToDelete.default) {
            const remainingUserAddresses = updatedAddresses.filter(addr => addr.userId === addressToDelete.userId);
            
            if (remainingUserAddresses.length > 0) {
                const newDefaultId = remainingUserAddresses[0].id;
                updatedAddresses = updatedAddresses.map(addr => 
                    addr.id === newDefaultId ? { ...addr, default: true } : addr
                );
            }
        }

        setAddresses(updatedAddresses);
    };

    const setDefaultAddress = (userId, addressId) => {
        setAddresses(prev => prev.map(addr => {
            if (addr.userId === userId) {
                return { ...addr, default: addr.id === addressId };
            }
            return addr;
        }));
    };

    return (
        <AddressContext.Provider value={{ 
            addresses, 
            getUserAddresses, 
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