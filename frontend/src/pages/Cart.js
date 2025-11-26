import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Table, InputGroup, Form, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Truck, Tag } from 'lucide-react';
import './Cart.css';

const Cart = () => {
    const { cart, addToCart, removeFromCart, getCartTotal } = useCart();
    const [promoCode, setPromoCode] = useState('');

    // Shipping Threshold Logic
    const FREE_SHIPPING_THRESHOLD = 5000;
    const currentTotal = getCartTotal();
    const progress = Math.min((currentTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remaining = FREE_SHIPPING_THRESHOLD - currentTotal;
    
    // Calculate Shipping Cost
    const shippingCost = remaining <= 0 ? 0 : 150;
    
    // Calculate Final Total
    const finalTotal = currentTotal + shippingCost;

    if (cart.length === 0) {
        return (
            <div className="cart-page d-flex align-items-center justify-content-center">
                <Container className="cart-empty animate-fade-in">
                    <div className="mb-4 text-muted opacity-25">
                        <ShoppingBag size={80} />
                    </div>
                    <h2 className="fw-bold mb-3">Your bag is empty</h2>
                    <p className="text-muted mb-4">Looks like you haven't found anything yet.</p>
                    <Button as={Link} to="/products" variant="primary" className="rounded-pill px-5 py-3 fw-bold shadow-sm">
                        Start Shopping
                    </Button>
                </Container>
            </div>
        );
    }

    return (
        <div className="cart-page py-5 animate-fade-in">
            <Container>
                <div className="d-flex align-items-center justify-content-between mb-5">
                    <h2 className="fw-bold mb-0">Shopping Bag ({cart.length})</h2>
                    <Link to="/products" className="text-decoration-none fw-bold text-muted d-flex align-items-center">
                        <ArrowLeft size={18} className="me-2" /> Continue Shopping
                    </Link>
                </div>

                <Row className="g-5">
                    {/* LEFT: CART ITEMS */}
                    <Col lg={8}>
                        {/* FREE SHIPPING BAR */}
                        <div className="free-shipping-container">
                            <div className="d-flex align-items-center mb-2">
                                <Truck size={20} className="text-primary me-2" />
                                <span className="fw-bold">
                                    {remaining > 0 
                                        ? <>Add <span className="text-primary">₱{remaining.toLocaleString()}</span> more for Free Shipping!</>
                                        : <span className="text-success">You've unlocked Free Shipping!</span>
                                    }
                                </span>
                            </div>
                            <div className="shipping-progress-bg">
                                <div className="shipping-progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        <div className="cart-table">
                            <Table responsive className="mb-0">
                                <thead>
                                    <tr>
                                        <th style={{width: '40%'}}>Product</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item) => (
                                        <tr key={item.id}>
                                            <td data-label="Product">
                                                <div className="d-flex align-items-center gap-3">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="cart-item-img" />
                                                    ) : (
                                                        <div className="cart-item-img bg-light d-flex align-items-center justify-content-center text-muted">
                                                            <ShoppingBag size={24} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h6 className="fw-bold mb-1 text-dark">{item.name}</h6>
                                                        <small className="text-muted">{item.category}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Price" className="fw-bold text-muted">₱{item.price.toLocaleString()}</td>
                                            <td data-label="Quantity">
                                                <div className="qty-group">
                                                    <button 
                                                        className="qty-btn" 
                                                        onClick={() => removeFromCart(item.id)}
                                                        disabled={item.quantity <= 1}
                                                        style={item.quantity <= 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="qty-input">{item.quantity}</span>
                                                    <button className="qty-btn" onClick={() => addToCart(item)}><Plus size={14} /></button>
                                                </div>
                                            </td>
                                            <td data-label="Total" className="fw-bold text-primary">₱{(item.price * item.quantity).toLocaleString()}</td>
                                            <td data-label="">
                                                <button className="btn btn-link text-danger p-0" onClick={() => removeFromCart(item.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Col>

                    {/* RIGHT: SUMMARY */}
                    <Col lg={4}>
                        <Card className="summary-card p-4">
                            <h5 className="fw-bold mb-4">Order Summary</h5>
                            
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span className="fw-bold">₱{currentTotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping Estimate</span>
                                <span className={remaining <= 0 ? "text-success fw-bold" : ""}>
                                    {remaining <= 0 ? "Free" : "₱150"}
                                </span>
                            </div>
                            
                            {/* Promo Code Input */}
                            <InputGroup className="my-4">
                                <InputGroup.Text className="bg-white border-end-0 ps-3">
                                    <Tag size={16} className="text-muted"/>
                                </InputGroup.Text>
                                <Form.Control 
                                    placeholder="Discount Code" 
                                    className="border-start-0 ps-2 shadow-none"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                />
                                <Button variant="dark" size="sm" className="px-3">Apply</Button>
                            </InputGroup>

                            <div className="summary-total">
                                <span>Total</span>
                                {/* FIXED: Uses finalTotal (Subtotal + Shipping) instead of just Subtotal */}
                                <span>₱{finalTotal.toLocaleString()}</span>
                            </div>

                            <Button 
                                as={Link} 
                                to="/checkout" 
                                variant="primary" 
                                className="w-100 rounded-pill py-3 fw-bold mt-4 shadow-sm"
                            >
                                PROCEED TO CHECKOUT
                            </Button>

                            <div className="text-center mt-3">
                                <small className="text-muted">Secure Checkout powered by HappyCart</small>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Cart;