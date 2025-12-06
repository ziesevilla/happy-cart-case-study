import React, { createContext, useState, useContext } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

// Initialize Context
const ReviewContext = createContext();

/**
 * ReviewProvider Component
 * * Manages the fetching and submission of product reviews.
 * * Handles the specific logic of "One review per user per product".
 */
export const ReviewProvider = ({ children }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);

    /**
     * 1. Fetch Reviews
     * * Usage: Called by the ProductDetails page when it mounts.
     * * Result: Populates the 'reviews' state for the *currently viewed* product.
     */
    const fetchProductReviews = async (productId) => {
        try {
            // GET /api/reviews/{productId}
            const response = await api.get(`/reviews/${productId}`);
            setReviews(response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to load reviews", error);
            return [];
        }
    };

    /**
     * 2. Add Review
     * * Handles the submission and provides immediate UI feedback.
     */
    const addReview = async (productId, rating, comment) => {
        // Guard Clause: Front-line security check
        if (!user) return { success: false, message: "Please login first." };

        try {
            // POST /api/reviews
            const response = await api.post('/reviews', {
                product_id: productId,
                rating,
                comment
            });
            
            // OPTIMISTIC UPDATE:
            // We append the new review to the top of the list immediately.
            // We don't wait to re-fetch the list from the server.
            setReviews(prev => [response.data, ...prev]);
            
            return { success: true };
        } catch (error) {
            // Error Handling:
            // If Backend sends 403 (Duplicate Review), we capture the message here.
            const msg = error.response?.data?.message || "Failed to submit review";
            return { success: false, message: msg };
        }
    };

    /**
     * 3. UI Helper: Can User Review?
     * * Used to disable the form or button if criteria aren't met.
     * * Note: The real security check happens in the Backend Controller (ReviewController).
     */
    const canUserReview = (productId) => {
        // 1. Must be logged in
        if (!user) return { allowed: false, reason: "Login to review." };
        
        // 2. Check current list for duplicate ID
        // (Assumes 'reviews' state is currently loaded for THIS product)
        const alreadyReviewed = reviews.some(r => r.user_id === user.id);
        
        if (alreadyReviewed) {
            return { allowed: false, reason: "You have already reviewed this product." };
        }

        return { allowed: true };
    };

    /**
     * 4. Calculate Average (Client Side)
     * * Note: The Backend 'Product' model has a 'cached_avg_rating' field which is better for lists.
     * * However, this function is useful for immediate updates after a user submits a new review.
     */
    const getAverageRating = () => {
        if (reviews.length === 0) return 0;
        
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    /**
     * 5. Like Feature (Placeholder)
     */
    const toggleLike = (reviewId) => {
        console.log("Like feature coming soon to API");
        // Future implementation: api.post(`/reviews/${reviewId}/like`)
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