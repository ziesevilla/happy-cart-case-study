import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; 
import { useAuth } from './AuthContext'; 


// Initialize Context
const UserContext = createContext();

/**
 * UserProvider Component (Admin Only)
 * * Manages the list of ALL registered users for the Admin Dashboard.
 * * Handles fetching, pagination extraction, account suspension, and password resets.
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
            const usersWithSecurity = (Array.isArray(response.data) ? response.data : response.data.data).map(u => ({ ...u, passwordValid: true }));

            setUsers(usersWithSecurity);
            
            // 💡 LARAVEL PAGINATION HANDLING
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
            if (users.length === 0) setUsers([]);
        }
        setLoading(false);
    };

    /**
     * Synchronization Effect
     * * Only attempts to fetch data if a user is actually logged in.
     */
    useEffect(() => {
        // Initial load logic
        if (currentUser) fetchUsers();
        else setLoading(false);
    }, [currentUser]);

    /**
     * Update User Status (e.g., Suspend/Ban a user).
     * * Uses Optimistic UI to make the Admin panel feel snappy.
     */
    const updateUserStatus = async (id, newStatus) => {
        // 1. Optimistic Update
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));

        // 2. API Call
        try {
            await api.put(`/users/${id}`, { status: newStatus });
        } catch (error) {
            console.error("Failed to update status");
            fetchUsers(); // Revert on failure
        }
    };

    /**
     * Reset User Password (REAL DATABASE VERSION)
     * * Calls the Laravel API to invalidate the password in MySQL.
     */
    const resetUserPassword = async (id) => {
        console.log(`[Security System] Requesting DB invalidation for User ID: ${id}...`);
        
        try {
            // 1. CALL THE API (The Bridge)
            // This sends the signal to Laravel -> MySQL
            const response = await api.post(`/users/${id}/reset-password`);
            
            // 2. UPDATE REACT STATE (Visual Update)
            // We update the local list so the UI changes immediately without refreshing
            setUsers(prevUsers => prevUsers.map(user => {
                if (user.id === id) {
                    return { 
                        ...user, 
                        // Update the status to match what we did in the database
                        status: 'Recovery',
                        // We can manually flag this for your "Badge" logic
                        passwordValid: false 
                    };
                }
                return user;
            }));

            return true;

        } catch (error) {
            console.error("Database update failed:", error);
            // Throw the error so AdminUsers.js can show the "Failed" notification
            throw error; 
        }
    };

    // --- 💡 VERIFICATION TOOL ---
    // Call this to test if the "Invalidation" worked
    const checkUserPasswordStatus = (userId) => {
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) return "User not found";
        
        if (targetUser.passwordValid === false) {
            return "❌ ACCESS DENIED: Password has been invalidated.";
        }
        return "✅ ACCESS GRANTED: Password is still valid.";
    };

    return (
        // 💡 ADDED: resetUserPassword to the provider value
        <UserContext.Provider value={{ users, updateUserStatus, loading, resetUserPassword, checkUserPasswordStatus }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => useContext(UserContext);