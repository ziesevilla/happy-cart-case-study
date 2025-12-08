import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { Star, Lock } from 'lucide-react';
import { useReviews } from '../context/ReviewContext';
import { useSettings } from '../context/SettingsContext'; // <--- 1. IMPORT SETTINGS

/**
 * ReviewModal Component
 * * A popup form allowing users to rate and review a specific product.
 */
const ReviewModal = ({ show, onHide, product, showNotification }) => {
    // Access Contexts
    const { addReview } = useReviews();
    const { settings } = useSettings(); // <--- 2. GET SETTINGS
    
    // Local State
    const [rating, setRating] = useState(5); 
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault(); 
        if (!comment.trim()) return;

        // Extra check before submitting
        if (!settings.enableReviews) {
            showNotification("Reviews are currently disabled.", "error");
            return;
        }

        const success = addReview(product.id, product, rating, comment);
        
        if (success) {
            showNotification("Review submitted successfully!", "success");
            setComment('');
            setRating(5);
            onHide();
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold">Write a Review</Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 pb-4">
                
                {/* SAFEGUARD: If Admin disables reviews while modal is open */}
                {!settings.enableReviews ? (
                    <div className="text-center py-4">
                        <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                            <Lock size={32} className="text-muted" />
                        </div>
                        <h5>Reviews Disabled</h5>
                        <p className="text-muted small">
                            The administrator has temporarily disabled new reviews. 
                            Please try again later.
                        </p>
                        <Button variant="outline-dark" onClick={onHide} className="rounded-pill px-4">
                            Close
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Product Summary */}
                        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
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
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star 
                                            key={star} 
                                            size={32} 
                                            fill={star <= rating ? "#ffc107" : "none"} 
                                            color={star <= rating ? "#ffc107" : "#dee2e6"}
                                            style={{cursor: 'pointer'}}
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
                            </Form.Group>

                            <div className="d-grid">
                                <Button variant="dark" type="submit" className="rounded-pill fw-bold py-2">
                                    Submit Review
                                </Button>
                            </div>
                        </Form>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ReviewModal;