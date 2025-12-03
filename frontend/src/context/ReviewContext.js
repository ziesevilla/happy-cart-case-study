import React, { createContext, useState, useContext } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);

    // 1. FETCH REVIEWS (for a specific product)
    const fetchProductReviews = async (productId) => {
        try {
            const response = await api.get(`/reviews/${productId}`);
            setReviews(response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to load reviews", error);
            return [];
        }
    };

    // 2. ADD REVIEW
    const addReview = async (productId, rating, comment) => {
        if (!user) return { success: false, message: "Please login first." };

        try {
            const response = await api.post('/reviews', {
                product_id: productId,
                rating,
                comment
            });
            
            // Optimistic update: Add new review to list immediately
            setReviews(prev => [response.data, ...prev]);
            return { success: true };
        } catch (error) {
            // Handle specific errors from backend (e.g. "You already reviewed this")
            const msg = error.response?.data?.message || "Failed to submit review";
            return { success: false, message: msg };
        }
    };

    // 3. CHECK IF USER CAN REVIEW (Optional - Backend handles this, but good for UI)
    // Note: Since we don't fetch all orders here anymore, we rely on the Backend error message.
    // We can just check if they are logged in.
    const canUserReview = (productId) => {
        if (!user) return { allowed: false, reason: "Login to review." };
        
        // Check if already reviewed locally
        // (This assumes 'reviews' state is currently loaded for THIS product)
        const alreadyReviewed = reviews.some(r => r.user_id === user.id);
        
        if (alreadyReviewed) {
            return { allowed: false, reason: "You have already reviewed this product." };
        }

        return { allowed: true };
    };

    // 4. GET AVERAGE RATING
    const getAverageRating = (productId) => {
        // Logic: If 'reviews' state matches productId, calculate.
        // Otherwise return 0 (or fetch). 
        // For simplicity, we assume fetchProductReviews was called.
        if (reviews.length === 0) return 0;
        
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    // 5. LIKE REVIEW (Placeholder - need backend implementation)
    const toggleLike = (reviewId) => {
        console.log("Like feature coming soon to API");
    };

    return (
        <ReviewContext.Provider value={{ 
            reviews, 
            fetchProductReviews, 
            addReview, 
            canUserReview, 
            getAverageRating, 
            toggleLike
        }}>
            {children}
        </ReviewContext.Provider>
    );
};

export const useReviews = () => useContext(ReviewContext);