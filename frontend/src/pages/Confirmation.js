import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Check, ArrowRight, FileText } from 'lucide-react';
import './styles/Confirmation.css';

/**
 * Confirmation Component
 * Updated to display the actual payment method used 
 * and removed the pink background.
 */
const Confirmation = () => {
    const location = useLocation();
    
    // --- DATA RETRIEVAL ---
    const orderId = location.state?.orderId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const total = location.state?.total || 0;
    
    // 1. Get Payment Method from state (default to 'Credit Card' if missing)
    const paymentMethodRaw = location.state?.paymentMethod || 'credit_card';

    // Helper to format the payment string (e.g., "credit_card" -> "Credit Card")
    const formatPaymentMethod = (method) => {
        if (!method) return 'Credit Card';
        if (method === 'cod') return 'Cash on Delivery (COD)';
        if (method === 'gcash') return 'GCash';
        return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        // 2. FIXED: Added inline style to override pink background
        <div className="confirmation-page" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '3rem' }}>
            <Container className="d-flex justify-content-center pt-5">
                <div className="confirmation-card animate-fade-up bg-white p-5 rounded-4 shadow-sm" style={{ maxWidth: '600px', width: '100%' }}>
                    
                    {/* Success Icon */}
                    <div className="success-icon-container text-center mb-4">
                        <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle" style={{ width: '80px', height: '80px' }}>
                            <Check size={40} strokeWidth={3} />
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="display-5 fw-bold mb-3 text-dark">Thank You!</h1>
                        <p className="lead text-muted mb-4">
                            Your order has been placed successfully.<br/>
                            We've sent a confirmation email to your inbox.
                        </p>
                    </div>

                    {/* Order Details Summary Box */}
                    <div className="order-details-box bg-light p-4 rounded-3 mb-4 border border-secondary border-opacity-10">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="text-uppercase small fw-bold text-muted">Order Reference</span>
                            <span className="fw-bold text-primary">{orderId}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Status</span>
                            <span className="badge bg-success-subtle text-success rounded-pill px-3">Processing</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Date</span>
                            <span className="fw-medium">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Payment Method</span>
                            {/* 3. Display formatted payment method */}
                            <span className="fw-bold text-dark">{formatPaymentMethod(paymentMethodRaw)}</span>
                        </div>
                        
                        {total > 0 && (
                            <>
                                <hr className="my-3 border-secondary border-opacity-10"/>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-dark">Total Amount</span>
                                    <span className="h4 mb-0 text-primary fw-bold">₱{total.toLocaleString()}</span>
                                </div>
                            </>
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
                            to="/products?collection=New" 
                            variant="primary" 
                            className="rounded-pill py-3 fw-bold shadow-sm"
                        >
                            Continue Shopping <ArrowRight size={18} className="ms-2"/>
                        </Button>
                    </div>

                    <div className="mt-4 small text-muted text-center">
                        Need help? <Link to="/contact" className="text-primary text-decoration-none fw-bold">Contact Support</Link>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Confirmation;