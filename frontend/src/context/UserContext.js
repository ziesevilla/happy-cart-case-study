import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; // Import the bridge
import { useAuth } from './AuthContext'; // Import Auth to track login state

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Get the current user to know WHEN to fetch
    const { user: currentUser } = useAuth(); 

    // Fetch users from Database
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            
            // 💡 FIX: Laravel Pagination puts the array inside '.data'
            // Check if response.data is an array (old way) or object (new way)
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers(response.data.data); // Extract array from paginator
            }
            
        } catch (error) {
            console.error("Error fetching users:", error);
            if (error.response?.status === 401) {
                setUsers([]);
            }
        }
        setLoading(false);
    };

    // Effect: Fetch when user logs in or token exists
    useEffect(() => {
        const token = localStorage.getItem('AUTH_TOKEN');
        
        // Only fetch if we have a token AND we are logged in
        if (token && currentUser) {
            fetchUsers();
        } else {
            setUsers([]); // Clear list if logged out
            setLoading(false);
        }
    }, [currentUser]); // 👈 Re-run when currentUser changes

    // Update Status (Suspend/Activate)
    const updateUserStatus = async (id, newStatus) => {
        // Optimistic UI Update
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));

        // API Call to save it
        try {
            await api.put(`/users/${id}`, { status: newStatus });
        } catch (error) {
            console.error("Failed to update status");
        }
    };

    return (
        <UserContext.Provider value={{ users, updateUserStatus, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => useContext(UserContext);