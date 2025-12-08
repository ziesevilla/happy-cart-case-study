import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; // <--- IMPORT YOUR CONFIGURED AXIOS INSTANCE

// Initialize Context
const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    
    // =================================================================
    // 1. STATE INITIALIZATION
    // =================================================================
    const [loading, setLoading] = useState(true);

    // Default categories to prevent UI flicker before DB loads
    const [categories, setCategories] = useState(['Clothing', 'Shoes', 'Accessories']);

    const [settings, setSettings] = useState({
        maintenanceMode: false,
        allowRegistration: true,
        enableReviews: true
    });

    const [storeInfo, setStoreInfo] = useState({
        name: 'HappyCart',
        email: 'support@happycart.com',
        currency: 'PHP',
        shippingFee: 150,
        freeShippingThreshold: 5000,
        taxRate: 12
    });

    // =================================================================
    // 2. HELPER: SAVE TO BACKEND
    // =================================================================
    const saveToBackend = async (dataToUpdate) => {
        try {
            // WE USE 'api' HERE. It automatically handles the Base URL and the Token.
            await api.post('/settings', dataToUpdate);
            console.log("Settings saved:", dataToUpdate);
        } catch (error) {
            console.error("Failed to save settings to backend:", error);
            // Optional: Revert state if save fails (Advanced)
        }
    };

    // =================================================================
    // 3. FETCH DATA ON LOAD
    // =================================================================
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Use the configured API instance
                const response = await api.get('/settings');
                const dbData = response.data;

                // 1. Update Toggles
                setSettings({
                    maintenanceMode: dbData.maintenanceMode ?? false,
                    allowRegistration: dbData.allowRegistration ?? true,
                    enableReviews: dbData.enableReviews ?? true
                });

                // 2. Update Financials
                setStoreInfo(prev => ({
                    ...prev, 
                    ...dbData 
                }));

                // 3. Update Categories (WITH ROBUST CHECK)
                // If DB has categories, use them. If empty/null, keep the defaults.
                if (dbData.categories && Array.isArray(dbData.categories) && dbData.categories.length > 0) {
                    setCategories(dbData.categories);
                } else {
                    // Fallback to ensure Navbar is never empty
                    setCategories(['Clothing', 'Shoes', 'Accessories']);
                }

            } catch (error) {
                console.error("Could not load settings from server:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // =================================================================
    // 4. ACTIONS
    // =================================================================

    const addCategory = (newCat) => {
        if (!categories.includes(newCat)) {
            const updatedCats = [...categories, newCat];
            setCategories(updatedCats);
            // Send the WHOLE updated array to backend
            saveToBackend({ categories: updatedCats }); 
            return true;
        }
        return false; 
    };

    const deleteCategory = async (catToDelete) => {
        try {
            // 1. Attempt to delete on the server
            await api.post('/settings/categories/delete', { category: catToDelete });
            
            // 2. If successful, update local state
            const updatedCats = categories.filter(cat => cat !== catToDelete);
            setCategories(updatedCats);
            
            return { success: true, message: 'Category deleted successfully.' };

        } catch (error) {
            // 3. Handle the restriction error
            const msg = error.response?.data?.message || "Failed to delete category.";
            console.error("Delete failed:", msg);
            return { success: false, message: msg };
        }
    };

    const toggleSetting = (settingKey) => {
        setSettings(prev => {
            const newValue = !prev[settingKey];
            
            // 1. Optimistic Update (Update UI immediately)
            const newState = { ...prev, [settingKey]: newValue };
            
            // 2. Send Background Request
            saveToBackend({ [settingKey]: newValue });
            
            return newState;
        });
    };

    const updateStoreInfo = (newInfo) => {
        setStoreInfo(prev => {
            const updatedInfo = { ...prev, ...newInfo };
            saveToBackend(updatedInfo); 
            return updatedInfo;
        });
    };

    const resetSettings = () => {
        const defaults = {
            maintenanceMode: false,
            allowRegistration: true,
            enableReviews: true,
            name: 'HappyCart',
            email: 'support@happycart.com',
            currency: 'PHP',
            shippingFee: 150,
            freeShippingThreshold: 5000,
            taxRate: 12,
            categories: ['Clothing', 'Shoes', 'Accessories']
        };

        // Reset State
        setSettings({ maintenanceMode: false, allowRegistration: true, enableReviews: true });
        setStoreInfo({ ...defaults }); 
        setCategories(defaults.categories);

        // Reset Database
        saveToBackend(defaults);
    };

    /**
     * Perform Factory Reset.
     * Wipes data and reloads the page.
     */
    const factoryReset = async () => {
        try {
            await api.post('/system/factory-reset');
            
            // Success
            window.location.reload(); 
            return true;
        } catch (error) {
            // --- DEBUGGING ---
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;
            
            console.error("Factory Reset Error Details:", { status, message });
            alert(`Reset Failed!\nStatus: ${status}\nMessage: ${message}`);
            // -----------------
            
            return false;
        }
    };

    return (
        <SettingsContext.Provider value={{ 
            loading, 
            categories, 
            addCategory, 
            deleteCategory, 
            
            settings, 
            toggleSetting,

            storeInfo,        
            updateStoreInfo,

            resetSettings,

            factoryReset
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);