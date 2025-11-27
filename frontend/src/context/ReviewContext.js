import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Needed to track WHO is liking

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
    const { user } = useAuth();

    // Load reviews from local storage or use default mock data
    const [reviews, setReviews] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_reviews');
            return saved ? JSON.parse(saved) : [
                // Mock Reviews with Like Data
                { id: 1, productId: 1, productName: "Floral Summer Dress", user: 'Jane Doe', rating: 5, comment: 'Absolutely love this dress! Fits perfectly.', date: '10/15/2023', likes: 12, likedBy: [] },
                { id: 2, productId: 1, productName: "Floral Summer Dress", user: 'Sarah L.', rating: 4, comment: 'Great material but runs a bit small.', date: '10/18/2023', likes: 3, likedBy: [] },
                { id: 3, productId: 2, productName: "Oversized Beige Blazer", user: 'Mike T.', rating: 5, comment: 'Best purchase I made this year.', date: '11/02/2023', likes: 45, likedBy: [] },
                { id: 4, productId: 3, productName: "High-Waist Mom Jeans", user: 'Bella W.', rating: 5, comment: 'Super fast shipping to Cebu! The packaging was cute.', date: '11/05/2023', likes: 28, likedBy: [] },
                { id: 5, productId: 10, productName: "Essential Cotton Tee", user: 'Marco G.', rating: 5, comment: 'Finally found a tee that does not shrink. 10/10.', date: '11/10/2023', likes: 8, likedBy: [] },
                { id: 6, productId: 5, productName: "White Leather Sneakers", user: 'Sarah J.', rating: 5, comment: 'Walking on clouds. Wore them for a 12h shift.', date: '11/12/2023', likes: 56, likedBy: [] },
                { id: 7, productId: 9, productName: "Leather Crossbody Bag", user: 'Ashley K.', rating: 5, comment: 'Insane quality. Looks just like the designer version.', date: '11/15/2023', likes: 33, likedBy: [] }
            ];
        } catch (error) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('happyCart_reviews', JSON.stringify(reviews));
    }, [reviews]);

    const addReview = (review) => {
        // Initialize new reviews with 0 likes
        const newReview = { ...review, likes: 0, likedBy: [] };
        setReviews(prev => [newReview, ...prev]);
    };

    // NEW: Toggle Like Function (Fixed for undefined legacy data)
    const toggleLike = (reviewId) => {
        if (!user) return false; // Must be logged in to like

        setReviews(prev => prev.map(review => {
            if (review.id === reviewId) {
                // SAFEGUARDS: Default to [] or 0 if property is missing in old data
                const currentLikedBy = review.likedBy || [];
                const currentLikes = review.likes || 0;

                const isLiked = currentLikedBy.includes(user.email);

                if (isLiked) {
                    // Unlike: Remove user and decrement
                    return {
                        ...review,
                        likes: Math.max(0, currentLikes - 1), // Prevent negative likes
                        likedBy: currentLikedBy.filter(email => email !== user.email)
                    };
                } else {
                    // Like: Add user and increment
                    return {
                        ...review,
                        likes: currentLikes + 1,
                        likedBy: [...currentLikedBy, user.email]
                    };
                }
            }
            return review;
        }));
        return true;
    };

    const getProductReviews = (productId) => {
        return reviews.filter(r => r.productId === productId);
    };

    const getAverageRating = (productId) => {
        const productReviews = getProductReviews(productId);
        if (productReviews.length === 0) return 0;
        const sum = productReviews.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / productReviews.length).toFixed(1);
    };

    const hasReviewed = (orderId, productId) => {
        return reviews.some(r => r.orderId === orderId && r.productId === productId);
    };

    return (
        <ReviewContext.Provider value={{ reviews, addReview, getProductReviews, getAverageRating, hasReviewed, toggleLike }}>
            {children}
        </ReviewContext.Provider>
    );
};

export const useReviews = () => useContext(ReviewContext);