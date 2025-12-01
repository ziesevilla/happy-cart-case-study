import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    // --- 1. STATE: CATEGORIES ---
    const [categories, setCategories] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_categories');
            return saved ? JSON.parse(saved) : ['Clothing', 'Shoes', 'Accessories'];
        } catch (error) { return ['Clothing', 'Shoes', 'Accessories']; }
    });

    // --- 2. STATE: SITE CONFIG (Toggles) ---
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_config');
            return saved ? JSON.parse(saved) : {
                maintenanceMode: false,
                allowRegistration: true,
                enableReviews: true
            };
        } catch (error) {
            return { maintenanceMode: false, allowRegistration: true, enableReviews: true };
        }
    });

    // --- 3. NEW STATE: STORE INFO (Identity & Financials) ---
    const DEFAULT_STORE_INFO = {
        name: 'HappyCart',
        email: 'support@happycart.com',
        currency: 'PHP',
        shippingFee: 150,
        freeShippingThreshold: 5000,
        taxRate: 12
    };

    const [storeInfo, setStoreInfo] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_storeInfo');
            return saved ? JSON.parse(saved) : DEFAULT_STORE_INFO;
        } catch (error) {
            return DEFAULT_STORE_INFO;
        }
    });

    // --- PERSISTENCE ---
    useEffect(() => {
        localStorage.setItem('happyCart_categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('happyCart_config', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('happyCart_storeInfo', JSON.stringify(storeInfo));
    }, [storeInfo]);

    // --- ACTIONS ---
    const addCategory = (newCat) => {
        if (!categories.includes(newCat)) {
            setCategories([...categories, newCat]);
            return true;
        }
        return false; 
    };

    const deleteCategory = (catToDelete) => {
        setCategories(categories.filter(cat => cat !== catToDelete));
    };

    const toggleSetting = (settingKey) => {
        setSettings(prev => ({
            ...prev,
            [settingKey]: !prev[settingKey]
        }));
    };

    // New Action: Update Store Info
    const updateStoreInfo = (newInfo) => {
        setStoreInfo(prev => ({
            ...prev,
            ...newInfo
        }));
    };

    // Restore ALL defaults
    const resetSettings = () => {
        setCategories(['Clothing', 'Shoes', 'Accessories']);
        setSettings({ maintenanceMode: false, allowRegistration: true, enableReviews: true });
        setStoreInfo(DEFAULT_STORE_INFO);
        
        // Clear specific keys
        localStorage.removeItem('happyCart_categories');
        localStorage.removeItem('happyCart_config');
        localStorage.removeItem('happyCart_storeInfo');
    };

    return (
        <SettingsContext.Provider value={{ 
            categories, 
            addCategory, 
            deleteCategory, 
            
            settings, 
            toggleSetting,

            storeInfo,      // 💡 Exported State
            updateStoreInfo, // 💡 Exported Action

            resetSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);