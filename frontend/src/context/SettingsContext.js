import React, { createContext, useState, useContext, useEffect } from 'react';

// Initialize Context
const SettingsContext = createContext();

/**
 * SettingsProvider Component
 * * Acts as the centralized "Control Panel" for the application.
 * * Manages Categories, Global Toggles (Maintenance Mode), and Financial Configs.
 * * uses LocalStorage to persist Admin preferences across browser sessions.
 */
export const SettingsProvider = ({ children }) => {
    
    // =================================================================
    // 1. STATE: CATEGORIES
    // =================================================================
    // We use Lazy Initialization (passing a function to useState) so we don't 
    // parse JSON from LocalStorage on every single render.
    const [categories, setCategories] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_categories');
            return saved ? JSON.parse(saved) : ['Clothing', 'Shoes', 'Accessories'];
        } catch (error) { 
            return ['Clothing', 'Shoes', 'Accessories']; 
        }
    });

    // =================================================================
    // 2. STATE: SITE CONFIG (Feature Flags)
    // =================================================================
    // These booleans control major features of the app.
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

    // =================================================================
    // 3. STATE: STORE INFORMATION (Financials)
    // =================================================================
    // Centralized constants for calculations in the Cart/Checkout.
    const DEFAULT_STORE_INFO = {
        name: 'HappyCart',
        email: 'support@happycart.com',
        currency: 'PHP',
        shippingFee: 150,
        freeShippingThreshold: 5000,
        taxRate: 12 // Percentage
    };

    const [storeInfo, setStoreInfo] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_storeInfo');
            return saved ? JSON.parse(saved) : DEFAULT_STORE_INFO;
        } catch (error) {
            return DEFAULT_STORE_INFO;
        }
    });

    // =================================================================
    // 4. PERSISTENCE EFFECTS
    // =================================================================
    // Whenever any state changes, save it immediately to LocalStorage.
    
    useEffect(() => {
        localStorage.setItem('happyCart_categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('happyCart_config', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('happyCart_storeInfo', JSON.stringify(storeInfo));
    }, [storeInfo]);

    // =================================================================
    // 5. ACTIONS
    // =================================================================

    /**
     * Add a new category (Prevent duplicates).
     */
    const addCategory = (newCat) => {
        if (!categories.includes(newCat)) {
            setCategories([...categories, newCat]);
            return true;
        }
        return false; 
    };

    /**
     * Delete a category.
     */
    const deleteCategory = (catToDelete) => {
        setCategories(categories.filter(cat => cat !== catToDelete));
    };

    /**
     * Toggle a boolean setting dynamically.
     * * Usage: toggleSetting('maintenanceMode')
     * * This prevents us from writing a separate function for every single switch.
     */
    const toggleSetting = (settingKey) => {
        setSettings(prev => ({
            ...prev,
            // Dynamic Key Access: Flip the value of the specific key passed in.
            [settingKey]: !prev[settingKey]
        }));
    };

    /**
     * Update Store Financials.
     * * Uses the Spread Operator to merge new data with existing data.
     * * Example: updateStoreInfo({ shippingFee: 200 }) -> Only updates shipping fee.
     */
    const updateStoreInfo = (newInfo) => {
        setStoreInfo(prev => ({
            ...prev,
            ...newInfo
        }));
    };

    /**
     * Factory Reset.
     * * Wipes LocalStorage and reverts state to hardcoded defaults.
     */
    const resetSettings = () => {
        setCategories(['Clothing', 'Shoes', 'Accessories']);
        setSettings({ maintenanceMode: false, allowRegistration: true, enableReviews: true });
        setStoreInfo(DEFAULT_STORE_INFO);
        
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

            storeInfo,       
            updateStoreInfo,

            resetSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);