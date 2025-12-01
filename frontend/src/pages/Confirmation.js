import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Check, ShoppingBag, ArrowRight, FileText } from 'lucide-react';
import './styles/Confirmation.css';

const Confirmation = () => {
    const location = useLocation();
    // Get Order ID passed from Checkout, or generate a fallback
    const orderId = location.state?.orderId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Note: In a real app, you'd fetch the actual order details here using the ID
    const total = location.state?.total || 0;

    return (
        <div className="confirmation-page">
            <Container className="d-flex justify-content-center">
                <div className="confirmation-card animate-fade-up">
                    
                    {/* Success Icon */}
                    <div className="success-icon-container">
                        <Check size={48} strokeWidth={3} />
                    </div>

                    <h1 className="display-5 fw-bold mb-3 text-dark">Thank You!</h1>
                    <p className="lead text-muted mb-4">
                        Your order has been placed successfully.<br/>
                        We've sent a confirmation email to your inbox.
                    </p>

                    {/* Order Details Box */}
                    <div className="order-details-box">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="text-uppercase small fw-bold text-muted">Order Reference</span>
                            <span className="fw-bold text-primary">{orderId}</span>
                        </div>
                        <div className="order-details-row">
                            <span>Status</span>
                            <span className="badge bg-success-subtle text-success rounded-pill px-3">Processing</span>
                        </div>
                        <div className="order-details-row">
                            <span>Date</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="order-details-row">
                            <span>Payment Method</span>
                            <span>Credit Card</span>
                        </div>
                        
                        {total > 0 && (
                            <div className="order-details-row total">
                                <span>Total Amount</span>
                                <span>₱{total.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="d-grid gap-3">
                        <Button 
                            as={Link} 
                            to="/account" 
                            variant="outline-dark" 
                            className="rounded-pill py-3 fw-bold"
                        >
                            <FileText size={18} className="me-2"/> Track Order
                        </Button>
                        
                        <Button 
                            as={Link} 
                            to="/products?collection=New" /* 💡 CHANGED LINK HERE */
                            variant="primary" 
                            className="rounded-pill py-3 fw-bold shadow-sm"
                        >
                            Continue Shopping <ArrowRight size={18} className="ms-2"/>
                        </Button>
                    </div>

                    <div className="mt-4 small text-muted">
                        Need help? <Link to="/contact" className="text-primary text-decoration-none fw-bold">Contact Support</Link>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Confirmation;