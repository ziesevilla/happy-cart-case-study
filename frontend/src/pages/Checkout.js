import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Modal } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Import Auth
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, CreditCard, ShoppingBag, Smartphone, Banknote, ChevronDown, ChevronUp, ArrowRight, MapPin, Lock } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
    const { cart, clearCart, getCartTotal } = useCart();
    const { addresses, addAddress } = useAuth(); // Get saved addresses and add function
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // --- STATE ---
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    
    // Form Fields
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', street: '', city: '', state: '', zip: '', phone: ''
    });
    // New state to track if fields should be locked
    const [isSavedAddress, setIsSavedAddress] = useState(false);

    const [cardNum, setCardNum] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    
    // Promo Code
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [promoError, setPromoError] = useState('');
    const [promoSuccess, setPromoSuccess] = useState('');

    // Mobile UI
    const [showSummary, setShowSummary] = useState(false);

    // Save Address Logic
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newAddressLabel, setNewAddressLabel] = useState('Home');

    // If cart is empty, redirect
    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    // --- ACTIONS ---
    const handleAddressSelect = (e) => {
        const value = e.target.value;
        
        if (value === 'new') {
            // Clear form for manual input and unlock fields
            setFormData({
                firstName: '', lastName: '', street: '', city: '', state: '', zip: '', phone: ''
            });
            setIsSavedAddress(false);
            return;
        }

        const selectedId = parseInt(value);
        const addr = addresses.find(a => a.id === selectedId);
        
        if (addr) {
            setFormData({
                firstName: addr.firstName,
                lastName: addr.lastName,
                street: addr.street,
                city: addr.city,
                state: 'Metro Manila', 
                zip: addr.zip,
                phone: addr.phone
            });
            setIsSavedAddress(true); // Lock fields
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    // --- HELPERS ---
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || "";
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(" ");
        } else {
            return value;
        }
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handlePromoApply = () => {
        if (promoCode.toUpperCase() === 'WELCOME10') {
            setDiscount(0.10); // 10% off
            setPromoError('');
            setPromoSuccess('10% Discount Applied!');
        } else {
            setDiscount(0);
            setPromoSuccess('');
            setPromoError('Invalid promo code');
        }
    };

    const subtotal = getCartTotal();
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;

    // --- CHECKOUT PROCESS ---
    const processOrder = () => {
        setLoading(true);
        
        // Generate a random Order ID for the demo
        const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

        setTimeout(() => {
            clearCart();
            // Navigate to Confirmation Page with state (Order ID and Total)
            navigate('/confirmation', { 
                state: { 
                    orderId: newOrderId,
                    total: total // Ensure 'total' variable is calculated before this function
                } 
            });
            setLoading(false);
        }, 2000);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Check if address is saved based on our lock state, OR verify manually if needed
        if (!isSavedAddress) {
            // Only ask to save if the user manually typed it
            // Check if this manually typed address already exists to avoid duplicates
            const isDuplicate = addresses.some(addr => 
                addr.street.toLowerCase() === formData.street.toLowerCase() &&
                addr.zip === formData.zip
            );

            if (!isDuplicate) {
                setShowSaveModal(true);
            } else {
                processOrder();
            }
        } else {
            // Using a saved address, just proceed
            processOrder();
        }
    };

    const handleSaveAndContinue = () => {
        addAddress({
            label: newAddressLabel,
            firstName: formData.firstName,
            lastName: formData.lastName,
            street: formData.street,
            city: formData.city,
            zip: formData.zip,
            phone: formData.phone
        });
        
        setShowSaveModal(false);
        processOrder();
    };

    const handleDontSave = () => {
        setShowSaveModal(false);
        processOrder();
    };

    return (
        <div className="checkout-page pb-5 animate-fade-in">
            {/* Breadcrumbs */}
            <div className="checkout-breadcrumbs pt-4">
                <Link to="/cart" className="text-decoration-none text-muted">Cart</Link>
                <span className="breadcrumb-divider">/</span>
                <span className="breadcrumb-item active">Checkout</span>
                <span className="breadcrumb-divider">/</span>
                <span className="text-muted">Confirmation</span>
            </div>

            {/* Mobile Summary Toggle */}
            <div className="mobile-summary-toggle d-lg-none" onClick={() => setShowSummary(!showSummary)}>
                <div className="d-flex align-items-center text-primary fw-bold">
                    <ShoppingBag size={18} className="me-2" /> 
                    {showSummary ? 'Hide' : 'Show'} Order Summary
                    {showSummary ? <ChevronUp size={16} className="ms-1"/> : <ChevronDown size={16} className="ms-1"/>}
                </div>
                <span className="fw-bold">₱{total.toLocaleString()}</span>
            </div>

            <Container className="mt-4">
                <form onSubmit={handleFormSubmit}>
                    <Row className="g-5">
                        {/* LEFT: FORM */}
                        <Col lg={7}>
                            {/* Shipping Section */}
                            <div className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="section-title mb-0">
                                        <span className="step-number">1</span>
                                        SHIPPING ADDRESS
                                    </div>
                                    {isSavedAddress && (
                                        <span className="badge bg-light text-muted border d-flex align-items-center">
                                            <Lock size={12} className="me-1"/> Locked
                                        </span>
                                    )}
                                </div>
                                
                                {/* SAVED ADDRESS SELECTOR */}
                                <div className="mb-4 p-3 bg-light rounded-3 border border-dashed border-secondary">
                                    <Form.Label className="small fw-bold text-muted d-flex align-items-center">
                                        <MapPin size={14} className="me-2"/> Quick Fill from Saved Address
                                    </Form.Label>
                                    <Form.Select className="checkout-input bg-white" onChange={handleAddressSelect}>
                                        <option value="new">Enter New Address</option>
                                        {addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.label}: {addr.street}, {addr.city}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>

                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Label className="checkout-label">First Name</Form.Label>
                                        <Form.Control 
                                            required type="text" 
                                            className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} 
                                            placeholder="John" 
                                            name="firstName" value={formData.firstName} onChange={handleInputChange}
                                            readOnly={isSavedAddress}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="checkout-label">Last Name</Form.Label>
                                        <Form.Control 
                                            required type="text" 
                                            className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} 
                                            placeholder="Doe" 
                                            name="lastName" value={formData.lastName} onChange={handleInputChange}
                                            readOnly={isSavedAddress}
                                        />
                                    </Col>
                                    <Col xs={12}>
                                        <Form.Label className="checkout-label">Street Address</Form.Label>
                                        <Form.Control 
                                            required type="text" 
                                            className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} 
                                            placeholder="123 Fashion St, Apt 4B" 
                                            name="street" value={formData.street} onChange={handleInputChange}
                                            readOnly={isSavedAddress}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="checkout-label">City</Form.Label>
                                        <Form.Control 
                                            required type="text" 
                                            className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} 
                                            placeholder="Makati City" 
                                            name="city" value={formData.city} onChange={handleInputChange}
                                            readOnly={isSavedAddress}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="checkout-label">State</Form.Label>
                                        <Form.Control 
                                            required type="text" 
                                            className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} 
                                            placeholder="NCR" 
                                            name="state" value={formData.state} onChange={handleInputChange}
                                            readOnly={isSavedAddress}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="checkout-label">Zip Code</Form.Label>
                                        <Form.Control 
                                            required type="text" 
                                            className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} 
                                            placeholder="1200" 
                                            name="zip" value={formData.zip} onChange={handleInputChange}
                                            readOnly={isSavedAddress}
                                        />
                                    </Col>
                                    <Col xs={12}>
                                        <Form.Label className="checkout-label">Phone Number</Form.Label>
                                        <Form.Control 
                                            required type="tel" 
                                            className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} 
                                            placeholder="0912 345 6789" 
                                            name="phone" value={formData.phone} onChange={handleInputChange}
                                            readOnly={isSavedAddress}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            {/* Payment Section */}
                            <div className="mb-5">
                                <div className="section-title">
                                    <span className="step-number">2</span>
                                    PAYMENT METHOD
                                </div>
                                
                                <Row className="g-3 mb-4">
                                    <Col sm={4}>
                                        <div 
                                            className={`payment-option-card text-center ${paymentMethod === 'credit_card' ? 'selected' : ''}`}
                                            onClick={() => setPaymentMethod('credit_card')}
                                        >
                                            <CreditCard size={24} className="mb-2 text-primary"/>
                                            <div className="small fw-bold">Card</div>
                                        </div>
                                    </Col>
                                    <Col sm={4}>
                                        <div 
                                            className={`payment-option-card text-center ${paymentMethod === 'gcash' ? 'selected' : ''}`}
                                            onClick={() => setPaymentMethod('gcash')}
                                        >
                                            <Smartphone size={24} className="mb-2 text-primary"/>
                                            <div className="small fw-bold">GCash</div>
                                        </div>
                                    </Col>
                                    <Col sm={4}>
                                        <div 
                                            className={`payment-option-card text-center ${paymentMethod === 'cod' ? 'selected' : ''}`}
                                            onClick={() => setPaymentMethod('cod')}
                                        >
                                            <Banknote size={24} className="mb-2 text-primary"/>
                                            <div className="small fw-bold">COD</div>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Dynamic Payment Content */}
                                <div className="p-4 border rounded-4 bg-light">
                                    {paymentMethod === 'credit_card' && (
                                        <div className="animate-fade-in">
                                            <Form.Label className="checkout-label">Card Number</Form.Label>
                                            <Form.Control 
                                                required 
                                                type="text" 
                                                className="checkout-input mb-3 bg-white" 
                                                placeholder="0000 0000 0000 0000"
                                                value={cardNum}
                                                onChange={(e) => setCardNum(formatCardNumber(e.target.value))}
                                                maxLength={19}
                                            />
                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <Form.Label className="checkout-label">Expiry Date</Form.Label>
                                                    <Form.Control 
                                                        required 
                                                        type="text" 
                                                        className="checkout-input bg-white" 
                                                        placeholder="MM/YY" 
                                                        value={cardExpiry}
                                                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                        maxLength={5}
                                                    />
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Label className="checkout-label">CVV</Form.Label>
                                                    <Form.Control required type="password" className="checkout-input bg-white" placeholder="123" maxLength={4} />
                                                </Col>
                                            </Row>
                                        </div>
                                    )}

                                    {paymentMethod === 'gcash' && (
                                        <div className="text-center py-3 animate-fade-in">
                                            <Smartphone size={48} className="text-muted mb-3 opacity-50"/>
                                            <h6>You will be redirected to GCash to complete your purchase securely.</h6>
                                        </div>
                                    )}

                                    {paymentMethod === 'cod' && (
                                        <div className="text-center py-3 animate-fade-in">
                                            <Banknote size={48} className="text-muted mb-3 opacity-50"/>
                                            <h6>Please have the exact amount ready upon delivery.</h6>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* RIGHT: SUMMARY */}
                        <Col lg={5} className={`d-lg-block ${showSummary ? 'd-block' : 'd-none'}`}>
                            <div className="checkout-summary">
                                <h5 className="fw-bold mb-4">Order Summary</h5>
                                
                                <div className="checkout-items mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {cart.map(item => (
                                        <div key={item.id} className="checkout-item">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} />
                                            ) : (
                                                <div className="bg-light rounded-3 d-flex align-items-center justify-content-center me-3" style={{width:'60px', height:'60px'}}>
                                                    <ShoppingBag size={20} className="text-muted"/>
                                                </div>
                                            )}
                                            <div className="flex-grow-1">
                                                <h6 className="mb-0 small fw-bold text-truncate" style={{maxWidth: '150px'}}>{item.name}</h6>
                                                <small className="text-muted">Qty: {item.quantity}</small>
                                            </div>
                                            <div className="fw-bold small">₱{(item.price * item.quantity).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Promo Code Section */}
                                <div className="mb-4">
                                    <InputGroup>
                                        <Form.Control 
                                            placeholder="Discount Code" 
                                            className="checkout-input"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                                        />
                                        <Button variant="dark" className="px-4" onClick={handlePromoApply}>Apply</Button>
                                    </InputGroup>
                                    {promoError && <small className="text-danger mt-1 d-block">{promoError}</small>}
                                    {promoSuccess && <small className="text-success mt-1 d-block">{promoSuccess}</small>}
                                </div>

                                <div className="checkout-total-row">
                                    <span className="text-muted">Subtotal</span>
                                    <strong>₱{subtotal.toLocaleString()}</strong>
                                </div>
                                
                                {discount > 0 && (
                                    <div className="checkout-total-row discount-row">
                                        <span>Discount (10%)</span>
                                        <strong>-₱{discountAmount.toLocaleString()}</strong>
                                    </div>
                                )}

                                <div className="checkout-total-row">
                                    <span className="text-muted">Shipping</span>
                                    <strong className="text-success">Free</strong>
                                </div>
                                
                                <div className="checkout-total-row final-total">
                                    <span>Total</span>
                                    <span className="text-primary">₱{total.toLocaleString()}</span>
                                </div>

                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    className="w-100 rounded-pill py-3 fw-bold mt-4 shadow-lg d-flex align-items-center justify-content-center"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : <>PLACE ORDER <ArrowRight size={18} className="ms-2"/></>}
                                </Button>
                                
                                <div className="text-center mt-3 d-flex align-items-center justify-content-center text-muted small">
                                    <CheckCircle size={14} className="me-1 text-success"/> Secure SSL Encryption
                                </div>
                            </div>
                        </Col>
                    </Row>
                </form>

                {/* --- SAVE ADDRESS MODAL --- */}
                <Modal show={showSaveModal} onHide={handleDontSave} centered>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="fw-bold">Save this address?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p className="text-muted">We noticed this is a new address. Would you like to save it to your account for faster checkout next time?</p>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">LABEL (e.g., Home, Work)</Form.Label>
                            <Form.Select 
                                value={newAddressLabel} 
                                onChange={(e) => setNewAddressLabel(e.target.value)}
                                className="checkout-input"
                            >
                                <option value="Home">Home</option>
                                <option value="Office">Office</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="outline-secondary" onClick={handleDontSave}>
                            No, just for this order
                        </Button>
                        <Button variant="primary" onClick={handleSaveAndContinue}>
                            Yes, Save It
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default Checkout;