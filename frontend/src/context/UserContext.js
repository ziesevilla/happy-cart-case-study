import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; 
import { useAuth } from './AuthContext'; 

// Initialize Context
const UserContext = createContext();

/**
 * UserProvider Component (Admin Only)
 * * Manages the list of ALL registered users for the Admin Dashboard.
 * * Handles fetching, pagination extraction, and account suspension logic.
 */
export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // dependency: We need the 'currentUser' from AuthContext to know 
    // if we are logged in (and if we are an Admin).
    const { user: currentUser } = useAuth(); 

    /**
     * Fetch all users from the database.
     */
    const fetchUsers = async () => {
        setLoading(true);
        try {
            // GET /api/users
            const response = await api.get('/users');
            
            // 💡 LARAVEL PAGINATION HANDLING
            // If the backend uses 'User::all()', it returns a simple Array.
            // If the backend uses 'User::paginate(10)', it returns an Object with a 'data' property.
            // This check ensures our frontend works with BOTH approaches.
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers(response.data.data); // Extract array from the 'data' key
            }
            
        } catch (error) {
            console.error("Error fetching users:", error);
            // Security: If the session expired (401), wipe the data immediately.
            if (error.response?.status === 401) {
                setUsers([]);
            }
        }
        setLoading(false);
    };

    /**
     * Synchronization Effect
     * * Only attempts to fetch data if a user is actually logged in.
     */
    useEffect(() => {
        const token = localStorage.getItem('AUTH_TOKEN');
        
        if (token && currentUser) {
            fetchUsers();
        } else {
            setUsers([]); // Clear sensitive data on logout
            setLoading(false);
        }
    }, [currentUser]); 

    /**
     * Update User Status (e.g., Suspend/Ban a user).
     * * Uses Optimistic UI to make the Admin panel feel snappy.
     */
    const updateUserStatus = async (id, newStatus) => {
        // 1. Optimistic Update
        // Update the screen immediately before waiting for the server
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));

        // 2. API Call
        try {
            await api.put(`/users/${id}`, { status: newStatus });
        } catch (error) {
            console.error("Failed to update status");
            // Optional: You could revert the change here if the API fails
            fetchUsers(); 
        }
    };

    return (
        <UserContext.Provider value={{ users, updateUserStatus, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => useContext(UserContext);