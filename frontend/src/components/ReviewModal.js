import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewContext';

const ReviewModal = ({ show, onHide, product, orderId, showNotification }) => {
    const { user } = useAuth();
    const { addReview } = useReviews();
    
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const newReview = {
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            orderId: orderId,
            user: user.name || 'Anonymous',
            rating: rating,
            comment: comment,
            date: new Date().toLocaleDateString()
        };

        addReview(newReview);
        
        // Reset and Close
        setComment('');
        setRating(5);
        onHide(); 
        
        // Trigger Toast Notification
        if (showNotification) {
            showNotification("Review submitted successfully!", "success");
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold">Write a Review</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex align-items-center gap-3 mb-4">
                    <img src={product.image} alt={product.name} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}} />
                    <div>
                        <h6 className="mb-0 fw-bold">{product.name}</h6>
                        <small className="text-muted">Order #{orderId}</small>
                    </div>
                </div>

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4 text-center">
                        <Form.Label className="d-block small text-muted fw-bold">RATING</Form.Label>
                        <div className="d-flex justify-content-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star}
                                    size={32}
                                    fill={(hoveredStar || rating) >= star ? "#f59e0b" : "none"}
                                    color={(hoveredStar || rating) >= star ? "#f59e0b" : "#cbd5e1"}
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted fw-bold">YOUR REVIEW</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={4} 
                            className="rounded-4 border-0 bg-light p-3"
                            placeholder="What did you like or dislike? How was the fit?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <div className="d-grid">
                        <Button variant="primary" type="submit" className="rounded-pill fw-bold py-2">
                            Submit Review
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ReviewModal;