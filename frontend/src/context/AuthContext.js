import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; // Import our configured Axios instance

// Initialize the Context
const AuthContext = createContext();

/**
 * AuthProvider Component
 * * Manages the global authentication state (User object & Token).
 * * Provides login, register, and logout functions to the rest of the app.
 */
export const AuthProvider = ({ children }) => {
    // 'user': Holds the user data (id, name, email, role) or null.
    const [user, setUser] = useState(null);
    
    // 'loading': Prevents the app from rendering until we verify if the user is logged in.
    // Without this, the Login page might "flicker" briefly even if the user is already authenticated.
    const [loading, setLoading] = useState(true); 

    /**
     * 1. Persistence Check (Auto-Login)
     * * Runs once when the application starts.
     * * Checks if a token exists in LocalStorage and validates it with the backend.
     */
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('AUTH_TOKEN');
            
            if (token) {
                try {
                    // Endpoint: /api/user (Requires Sanctum Token)
                    const response = await api.get('/user'); 
                    setUser(response.data);
                } catch (error) {
                    // If the token is expired or invalid (401 Unauthorized), clean up.
                    localStorage.removeItem('AUTH_TOKEN');
                    setUser(null);
                }
            }
            // Logic is done, allow the app to render.
            setLoading(false); 
        };

        checkUserLoggedIn();
    }, []);

    /**
     * 2. Login Action
     * * Sends credentials to Laravel, saves the token, and updates state.
     * * @param {string} email 
     * @param {string} password 
     * @returns {Promise<object>} Success status
     */
    const login = async (email, password) => {
        try {
            // POST /api/login
            const response = await api.post('/login', { email, password });

            // 1. Save Token to Browser Storage (Persist across refreshes)
            localStorage.setItem('AUTH_TOKEN', response.data.token);
            
            // 2. Update React State (Update UI immediately)
            setUser(response.data.user);
            
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Invalid email or password' 
            };
        }
    };

    /**
     * 3. Register Action
     * * Handles new user signup.
     * * @param {object} formData - Contains name, email, password, etc.
     */
    const register = async (formData) => { 
        try {
            // Mapping: React form usually uses 'confirmPassword', but Laravel expects 'password_confirmation'
            const response = await api.post('/register', { 
                ...formData, // Spread operator passes name, email, dob, etc.
                password_confirmation: formData.confirmPassword 
            });
            
            // Auto-login after registration
            localStorage.setItem('AUTH_TOKEN', response.data.token);
            setUser(response.data.user);
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    /**
     * 4. Logout Action
     * * Destroys the token on both server and client.
     */
    const logout = async () => {
        try {
            // Tell Laravel to invalidate the token in the database
            await api.post('/logout'); 
        } catch (e) {
            console.error("Logout error", e);
        }
        
        // Always clean up client side, even if server errors out
        localStorage.removeItem('AUTH_TOKEN');
        setUser(null);
    };

    // Expose data and methods to the app
    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook to access AuthContext easily
export const useAuth = () => useContext(AuthContext);