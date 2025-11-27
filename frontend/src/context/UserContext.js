import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_users');
            return saved ? JSON.parse(saved) : [
                { id: 1, name: 'John Doe', email: 'user@example.com', role: 'Customer', status: 'Active', joined: '2023-10-12' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Customer', status: 'Active', joined: '2023-11-05' },
                { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'Active', joined: '2023-01-01' },
                { id: 4, name: 'Suspended User', email: 'bad@example.com', role: 'Customer', status: 'Suspended', joined: '2023-09-15' },
                { id: 5, name: 'Michael Scott', email: 'michael@dundermifflin.com', role: 'Customer', status: 'Active', joined: '2023-11-20' },
                { id: 6, name: 'Dwight Schrute', email: 'dwight@dundermifflin.com', role: 'Customer', status: 'Active', joined: '2023-11-21' },
            ];
        } catch (error) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('happyCart_users', JSON.stringify(users));
    }, [users]);

    const updateUserStatus = (id, newStatus) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    };

    return (
        <UserContext.Provider value={{ users, updateUserStatus }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => useContext(UserContext);