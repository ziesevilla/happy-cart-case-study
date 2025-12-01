import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext'; 
import { useOrders } from './OrderContext'; 

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
    const { user } = useAuth(); 
    const { orders } = useOrders(); 

    const [reviews, setReviews] = useState(() => {
        try {
            const saved = localStorage.getItem('happyCart_reviews_v2');
            return saved ? JSON.parse(saved) : [
                { 
                    id: 1, productId: 1, productName: "Vintage Wash Denim Jacket", 
                    user: 'Jane Doe', userEmail: 'jane@example.com', 
                    rating: 5, comment: 'Absolutely love this jacket! Fits perfectly.', date: '2023-10-15', 
                    likes: 12, likedBy: [] 
                },
                { 
                    id: 2, productId: 4, productName: "Urban Canvas High-Tops", 
                    user: 'John Doe', userEmail: 'user@example.com',
                    rating: 4, comment: 'Great material but runs a bit small.', date: '2023-10-18', 
                    likes: 3, likedBy: [] 
                }
            ];
        } catch (error) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('happyCart_reviews_v2', JSON.stringify(reviews));
    }, [reviews]);

    const canUserReview = (productId) => {
        if (!user) return { allowed: false, reason: "Login to review." };
        const alreadyReviewed = reviews.some(r => r.productId === productId && r.userEmail === user.email);
        if (alreadyReviewed) return { allowed: false, reason: "You have already reviewed this product." };
        const hasPurchased = orders.some(order => 
            order.email === user.email && 
            order.status === 'Delivered' &&
            order.details.some(item => item.id === productId)
        );
        if (!hasPurchased) return { allowed: false, reason: "You can only review products you have purchased and received." };
        return { allowed: true };
    };

    const addReview = (productId, productData, rating, comment) => {
        const check = canUserReview(productId);
        if (!check.allowed) {
            alert(check.reason);
            return false;
        }
        const newReview = {
            id: Date.now(),
            productId: productId,
            productName: productData.name, 
            user: user.name || user.email.split('@')[0], 
            userEmail: user.email, 
            rating: parseInt(rating),
            comment: comment,
            date: new Date().toISOString().split('T')[0], 
            likes: 0,
            likedBy: []
        };
        setReviews(prev => [newReview, ...prev]);
        return true;
    };

    const toggleLike = (reviewId) => {
        if (!user) {
            alert("Please login to like reviews!");
            return;
        }
        setReviews(prev => prev.map(review => {
            if (review.id === reviewId) {
                const currentLikedBy = review.likedBy || [];
                const isLiked = currentLikedBy.includes(user.email);
                if (isLiked) {
                    return {
                        ...review,
                        likes: Math.max(0, (review.likes || 0) - 1),
                        likedBy: currentLikedBy.filter(email => email !== user.email)
                    };
                } else {
                    return {
                        ...review,
                        likes: (review.likes || 0) + 1,
                        likedBy: [...currentLikedBy, user.email]
                    };
                }
            }
            return review;
        }));
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

    // 💡 THIS WAS MISSING IN EXPORT
    const hasReviewed = (productId) => {
        if (!user) return false;
        return reviews.some(r => r.productId === productId && r.userEmail === user.email);
    };

    return (
        <ReviewContext.Provider value={{ 
            reviews, 
            addReview, 
            canUserReview, 
            getProductReviews, 
            getAverageRating, 
            toggleLike,
            hasReviewed // 💡 NOW INCLUDED
        }}>
            {children}
        </ReviewContext.Provider>
    );
};

export const useReviews = () => useContext(ReviewContext);