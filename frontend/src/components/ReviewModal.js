import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Star } from 'lucide-react';
import { useReviews } from '../context/ReviewContext';
// 💡 Import the AI Component
import SentimentAnalysis from './SentimentAnalysis';

/**
 * ReviewModal Component
 * * A popup form allowing users to rate and review a specific product.
 * * Interact with ReviewContext to save data to the backend.
 * * Now features AI Sentiment Analysis 🧠
 */
const ReviewModal = ({ show, onHide, product, showNotification }) => {
    // Access the 'addReview' action from our Context
    const { addReview } = useReviews();
    
    // Local State for the form inputs
    const [rating, setRating] = useState(5); // Default to 5 stars (Positive UX)
    const [comment, setComment] = useState('');

    /**
     * Handle Form Submission
     */
    const handleSubmit = (e) => {
        e.preventDefault(); // Stop page reload
        
        // Basic Validation: Ensure comment isn't just whitespace
        if (!comment.trim()) return;

        // 1. Call Context Action (Async)
        const success = addReview(product.id, product, rating, comment);
        
        // 2. Handle Success
        if (success) {
            showNotification("Review submitted successfully!", "success");
            
            // Reset Form State (So it's clean next time it opens)
            setComment('');
            setRating(5);
            
            // Close Modal
            onHide();
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            {/* Header */}
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold">Write a Review</Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 pb-4">
                {/* Product Summary: Reminds the user what they are reviewing */}
                <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
                    {/* Optional Chaining (?.) prevents crash if product data is slow to load */}
                    <img 
                        src={product?.image} 
                        alt={product?.name} 
                        style={{width: '50px', height: '50px', objectFit: 'cover'}} 
                        className="rounded-3"
                    />
                    <div>
                        <h6 className="mb-0 fw-bold small">{product?.name}</h6>
                        <small className="text-muted">Share your experience with this product</small>
                    </div>
                </div>

                <Form onSubmit={handleSubmit}>
                    {/* STAR RATING INPUT */}
                    <Form.Group className="mb-3 text-center">
                        <Form.Label className="d-block fw-bold small text-muted mb-2">YOUR RATING</Form.Label>
                        <div className="d-flex justify-content-center gap-2">
                            {/* Logic: Create 5 stars, fill them if their index <= current rating */}
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    size={32} 
                                    // Visual Feedback: Gold if active, Gray if inactive
                                    fill={star <= rating ? "#ffc107" : "none"} 
                                    color={star <= rating ? "#ffc107" : "#dee2e6"}
                                    style={{cursor: 'pointer'}}
                                    // Interaction: Click to set rating
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </Form.Group>

                    {/* TEXT COMMENT INPUT */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small text-muted">YOUR REVIEW</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={4} 
                            placeholder="What did you like or dislike? How was the fit?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="bg-light border-0 rounded-4 p-3"
                            required
                        />

                        {/* 💡 AI SENTIMENT ANALYSIS COMPONENT */}
                        {/* Passes the typed comment to the AI analyzer in real-time */}
                        <SentimentAnalysis text={comment} />

                    </Form.Group>

                    <div className="d-grid">
                        <Button variant="dark" type="submit" className="rounded-pill fw-bold py-2">
                            Submit Review
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ReviewModal;