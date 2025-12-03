import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; // 💡 Import the bridge to Laravel

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // 💡 New: Wait for API check before showing app

    // 1. Check if user is logged in when the app loads
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('AUTH_TOKEN');
            
            if (token) {
                try {
                    // Ask Laravel: "Who belongs to this token?"
                    const response = await api.get('/user'); 
                    setUser(response.data);
                } catch (error) {
                    // If token is invalid or expired, clear it
                    localStorage.removeItem('AUTH_TOKEN');
                    setUser(null);
                }
            }
            setLoading(false); // Finished checking
        };

        checkUserLoggedIn();
    }, []);

    // 2. Login Action (Async)
    const login = async (email, password) => {
        try {
            // Call Laravel API
            const response = await api.post('/login', { email, password });

            // Save Token
            localStorage.setItem('AUTH_TOKEN', response.data.token);
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

    // 3. Register Action (Async)
    const register = async (formData) => { // Accept single object
        try {
            const response = await api.post('/register', { 
                ...formData, // Spread all fields (name, email, phone, dob, gender...)
                password_confirmation: formData.confirmPassword // Map confirmation
            });
            
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

    // 4. Logout Action
    const logout = async () => {
        try {
            await api.post('/logout'); // Tell server to delete token
        } catch (e) {
            console.error("Logout error", e);
        }
        // Clear local state regardless of server response
        localStorage.removeItem('AUTH_TOKEN');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);