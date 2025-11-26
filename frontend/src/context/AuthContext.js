import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Check localStorage in case user refreshed the page
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // --- GLOBAL ADDRESS STATE ---
    const [addresses, setAddresses] = useState([
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
    ]);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    // --- ADDRESS ACTIONS ---
    const addAddress = (newAddress) => {
        const address = { 
            id: Date.now(), 
            ...newAddress, 
            default: addresses.length === 0 
        };
        setAddresses([...addresses, address]);
    };

    const deleteAddress = (id) => {
        setAddresses(addresses.filter(addr => addr.id !== id));
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout,
            addresses,      // Expose addresses
            addAddress,     // Expose add function
            deleteAddress   // Expose delete function
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);