import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Modal } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 
import { useOrders } from '../context/OrderContext';
import { useAddress } from '../context/AddressContext';
import { useProducts } from '../context/ProductContext'; // 💡 1. NEW IMPORT
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { CheckCircle, CreditCard, ShoppingBag, Smartphone, Banknote, ChevronDown, ChevronUp, ArrowRight, MapPin, Lock, Tag } from 'lucide-react';
import './styles/Checkout.css';

const Checkout = () => {
    const { cart, removeItems } = useCart(); 
    const { user } = useAuth(); 
    
    const { addOrder } = useOrders(); 
    const { getUserAddresses, addAddress } = useAddress();
    const { updateStockAfterPurchase } = useProducts(); // 💡 2. GET THE FUNCTION

    const navigate = useNavigate();
    const location = useLocation();

    // --- GET ITEMS TO CHECKOUT ---
    const checkoutItems = location.state?.checkoutItems || cart;
    
    // Recalculate totals
    const subtotal = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const FREE_SHIPPING_THRESHOLD = 5000;
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 150;
    
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    
    // Form State
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', street: '', city: '', state: '', zip: '', phone: ''
    });
    
    // LOCK STATE
    const [isSavedAddress, setIsSavedAddress] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState('');

    // Addresses for current user
    const myAddresses = user ? getUserAddresses(user.id) : [];

    const [cardNum, setCardNum] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [promoError, setPromoError] = useState('');
    const [promoSuccess, setPromoSuccess] = useState('');
    const [showSummary, setShowSummary] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newAddressLabel, setNewAddressLabel] = useState('Home');
    const [isCustomLabel, setIsCustomLabel] = useState(false);

    // Auto-fill default address on load
    useEffect(() => {
        if (myAddresses.length > 0 && !selectedAddressId) {
            const defaultAddr = myAddresses.find(addr => addr.default);
            if (defaultAddr) {
                setFormData({
                    firstName: defaultAddr.firstName, 
                    lastName: defaultAddr.lastName, 
                    street: defaultAddr.street, 
                    city: defaultAddr.city, 
                    state: 'Metro Manila', 
                    zip: defaultAddr.zip, 
                    phone: defaultAddr.phone
                });
                setIsSavedAddress(true);
                setSelectedAddressId(defaultAddr.id);
            }
        }
    }, [myAddresses, selectedAddressId]);

    if (checkoutItems.length === 0) {
        navigate('/cart');
        return null;
    }

    // Helpers
    const formatCardNumber = (val) => val.replace(/\s+/g, "").replace(/[^0-9]/gi, "").match(/\d{4,16}/g)?.[0]?.match(/.{1,4}/g)?.join(" ") || val;
    const formatExpiry = (val) => { const v = val.replace(/[^0-9]/gi, ""); return v.length >= 2 ? v.substring(0, 2) + '/' + v.substring(2, 4) : v; };
    
    const handlePromoApply = () => {
        if (promoCode.toUpperCase() === 'WELCOME10') { setDiscount(0.10); setPromoError(''); setPromoSuccess('10% Discount Applied!'); }
        else { setDiscount(0); setPromoSuccess(''); setPromoError('Invalid promo code'); }
    };

    const discountAmount = subtotal * discount;
    const total = subtotal + shippingCost - discountAmount;

    // --- ADDRESS SELECTION LOGIC ---
    const handleAddressSelect = (e) => {
        const value = e.target.value;
        setSelectedAddressId(value);
        
        if (value === 'new') {
            setFormData({ firstName: '', lastName: '', street: '', city: '', state: '', zip: '', phone: '' });
            setIsSavedAddress(false); 
            return;
        }
        
        const addr = myAddresses.find(a => a.id === parseInt(value));
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
            setIsSavedAddress(true);
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleModalLabelChange = (e) => {
        const val = e.target.value;
        if (val === 'Custom') { setIsCustomLabel(true); setNewAddressLabel(''); }
        else { setIsCustomLabel(false); setNewAddressLabel(val); }
    };

    // --- PROCESS ORDER & SAVE ---
    const processOrder = () => {
        setLoading(true);
        const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // 1. Create the Order Object
        const newOrder = {
            id: newOrderId,
            customerName: `${formData.firstName} ${formData.lastName}`,
            email: user?.email,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            itemsCount: checkoutItems.reduce((acc, item) => acc + item.quantity, 0),
            total: total,
            status: 'Placed', 
            shippingAddress: { ...formData }, 
            details: checkoutItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: item.quantity,
                image: item.image || 'https://via.placeholder.com/100'
            }))
        };

        setTimeout(() => {
            // 💡 3. UPDATE STOCK HERE
            updateStockAfterPurchase(checkoutItems);

            // 4. Save Order to Global State
            addOrder(newOrder);

            // 5. Clean up Cart
            const purchasedIds = checkoutItems.map(item => item.id);
            removeItems(purchasedIds);
            
            // 6. Redirect
            navigate('/confirmation', { state: { orderId: newOrderId, total: total } });
            setLoading(false);
        }, 2000);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // If new address (not saved), check for duplicates or save
        if (!isSavedAddress) {
            const isDuplicate = myAddresses.some(addr => addr.street.toLowerCase() === formData.street.toLowerCase() && addr.zip === formData.zip);
            if (!isDuplicate && user) { setShowSaveModal(true); } else { processOrder(); }
        } else { 
            processOrder(); 
        }
    };

    const handleSaveAndContinue = () => {
        if (user) addAddress(user.id, { label: newAddressLabel, ...formData });
        setShowSaveModal(false);
        processOrder();
    };

    const handleDontSave = () => {
        setShowSaveModal(false);
        processOrder();
    };

    return (
        <div className="checkout-page pb-5 animate-fade-in">
            <div className="checkout-breadcrumbs pt-4">
                <Link to="/cart" className="text-decoration-none text-muted">Cart</Link>
                <span className="breadcrumb-divider">/</span>
                <span className="breadcrumb-item active">Checkout</span>
                <span className="breadcrumb-divider">/</span>
                <span className="text-muted">Confirmation</span>
            </div>

            <div className="mobile-summary-toggle d-lg-none" onClick={() => setShowSummary(!showSummary)}>
                <div className="d-flex align-items-center text-primary fw-bold">
                    <ShoppingBag size={18} className="me-2" /> {showSummary ? 'Hide' : 'Show'} Order Summary
                    {showSummary ? <ChevronUp size={16} className="ms-1"/> : <ChevronDown size={16} className="ms-1"/>}
                </div>
                <span className="fw-bold">₱{total.toLocaleString()}</span>
            </div>

            <Container className="mt-4">
                <form onSubmit={handleFormSubmit}>
                    <Row className="g-5">
                        <Col lg={7}>
                            <div className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="section-title mb-0"><span className="step-number">1</span>SHIPPING ADDRESS</div>
                                    {isSavedAddress && <span className="badge bg-light text-muted border d-flex align-items-center"><Lock size={12} className="me-1"/> Locked</span>}
                                </div>
                                
                                {/* ADDRESS SELECTOR (Only show if user has saved addresses) */}
                                {myAddresses.length > 0 && (
                                    <div className="mb-4 p-3 bg-light rounded-3 border border-dashed border-secondary">
                                        <Form.Label className="small fw-bold text-muted d-flex align-items-center"><MapPin size={14} className="me-2"/> Quick Fill from Saved Address</Form.Label>
                                        <Form.Select className="checkout-input bg-white" value={selectedAddressId} onChange={handleAddressSelect}>
                                            <option value="new">Enter New Address</option>
                                            {myAddresses.map(addr => <option key={addr.id} value={addr.id}>{addr.label}: {addr.street}</option>)}
                                        </Form.Select>
                                    </div>
                                )}

                                <Row className="g-3">
                                    <Col md={6}><Form.Label className="checkout-label">First Name</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} placeholder="John" name="firstName" value={formData.firstName} onChange={handleInputChange} readOnly={isSavedAddress}/></Col>
                                    <Col md={6}><Form.Label className="checkout-label">Last Name</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} placeholder="Doe" name="lastName" value={formData.lastName} onChange={handleInputChange} readOnly={isSavedAddress}/></Col>
                                    <Col xs={12}><Form.Label className="checkout-label">Street Address</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} placeholder="123 Fashion St" name="street" value={formData.street} onChange={handleInputChange} readOnly={isSavedAddress}/></Col>
                                    <Col md={6}><Form.Label className="checkout-label">City</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} placeholder="Makati City" name="city" value={formData.city} onChange={handleInputChange} readOnly={isSavedAddress}/></Col>
                                    <Col md={3}><Form.Label className="checkout-label">State</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} placeholder="NCR" name="state" value={formData.state} onChange={handleInputChange} readOnly={isSavedAddress}/></Col>
                                    <Col md={3}><Form.Label className="checkout-label">Zip</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} placeholder="1200" name="zip" value={formData.zip} onChange={handleInputChange} readOnly={isSavedAddress}/></Col>
                                    <Col xs={12}><Form.Label className="checkout-label">Phone</Form.Label><Form.Control required type="tel" className={`checkout-input ${isSavedAddress ? 'bg-light' : ''}`} placeholder="0912..." name="phone" value={formData.phone} onChange={handleInputChange} readOnly={isSavedAddress}/></Col>
                                </Row>
                            </div>
                            
                            <div className="mb-5">
                                <div className="section-title"><span className="step-number">2</span>PAYMENT</div>
                                <Row className="g-3 mb-4">
                                    {['credit_card', 'gcash', 'cod'].map(method => (
                                        <Col sm={4} key={method}>
                                            <div className={`payment-option-card text-center ${paymentMethod === method ? 'selected' : ''}`} onClick={() => setPaymentMethod(method)}>
                                                {method === 'credit_card' && <CreditCard size={24} className="mb-2 text-primary"/>}
                                                {method === 'gcash' && <Smartphone size={24} className="mb-2 text-primary"/>}
                                                {method === 'cod' && <Banknote size={24} className="mb-2 text-primary"/>}
                                                <div className="small fw-bold">{method.replace('_', ' ').toUpperCase()}</div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                                {paymentMethod === 'credit_card' && (
                                    <div className="p-4 border rounded-4 bg-light animate-fade-in">
                                        <Form.Label className="checkout-label">Card Number</Form.Label>
                                        <Form.Control required type="text" className="checkout-input mb-3 bg-white" placeholder="0000 0000 0000 0000" value={cardNum} onChange={(e) => setCardNum(formatCardNumber(e.target.value))} maxLength={19}/>
                                        <Row className="g-3"><Col md={6}><Form.Control required type="text" className="checkout-input bg-white" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} maxLength={5}/></Col><Col md={6}><Form.Control required type="password" className="checkout-input bg-white" placeholder="CVV" maxLength={4}/></Col></Row>
                                    </div>
                                )}
                                {paymentMethod === 'gcash' && <div className="text-center py-3 animate-fade-in"><Smartphone size={48} className="text-muted mb-3 opacity-50"/><h6>You will be redirected to GCash to complete your purchase securely.</h6></div>}
                                {paymentMethod === 'cod' && <div className="text-center py-3 animate-fade-in"><Banknote size={48} className="text-muted mb-3 opacity-50"/><h6>Please have the exact amount ready upon delivery.</h6></div>}
                            </div>
                        </Col>

                        <Col lg={5} className={`d-lg-block ${showSummary ? 'd-block' : 'd-none'}`}>
                            <div className="checkout-summary">
                                <h5 className="fw-bold mb-4">Order Summary</h5>
                                <div className="checkout-items mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {checkoutItems.map(item => (
                                        <div key={item.id} className="checkout-item">
                                            {item.image ? <img src={item.image} alt={item.name} /> : <div className="bg-light rounded-3 d-flex align-items-center justify-content-center me-3" style={{width:'60px', height:'60px'}}><ShoppingBag size={20} className="text-muted"/></div>}
                                            <div className="flex-grow-1"><h6 className="mb-0 small fw-bold text-truncate" style={{maxWidth: '150px'}}>{item.name}</h6><small className="text-muted">Qty: {item.quantity}</small></div>
                                            <div className="fw-bold small">₱{(item.price * item.quantity).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                                <InputGroup className="my-4 border rounded-pill overflow-hidden bg-white p-1">
                                    <InputGroup.Text className="bg-transparent border-0 ps-3 pe-0"><Tag size={16} className="text-muted"/></InputGroup.Text>
                                    <Form.Control placeholder="Discount Code" className="bg-transparent border-0 shadow-none ps-2" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}/>
                                    <Button variant="dark" size="sm" className="rounded-pill px-4" onClick={handlePromoApply}>Apply</Button>
                                </InputGroup>
                                {promoError && <small className="text-danger mt-1 d-block">{promoError}</small>}
                                {promoSuccess && <small className="text-success mt-1 d-block">{promoSuccess}</small>}
                                <div className="checkout-total-row"><span className="text-muted">Subtotal</span><strong>₱{subtotal.toLocaleString()}</strong></div>
                                {discount > 0 && <div className="checkout-total-row discount-row"><span>Discount (10%)</span><strong>-₱{discountAmount.toLocaleString()}</strong></div>}
                                <div className="checkout-total-row"><span className="text-muted">Shipping</span><strong className="text-success">{shippingCost === 0 ? 'Free' : `₱${shippingCost}`}</strong></div>
                                <div className="checkout-total-row final-total"><span>Total</span><span className="text-primary">₱{total.toLocaleString()}</span></div>
                                <Button type="submit" variant="primary" className="w-100 rounded-pill py-3 fw-bold mt-4 shadow-lg" disabled={loading}>{loading ? 'Processing...' : <>PLACE ORDER <ArrowRight size={18} className="ms-2"/></>}</Button>
                                <div className="text-center mt-3 d-flex align-items-center justify-content-center text-muted small"><CheckCircle size={14} className="me-1 text-success"/> Secure SSL Encryption</div>
                            </div>
                        </Col>
                    </Row>
                </form>

                {/* --- SAVE ADDRESS MODAL --- */}
                <Modal show={showSaveModal} onHide={handleDontSave} centered>
                    <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Save this address?</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <p className="text-muted">We noticed this is a new address. Would you like to save it to your account for faster checkout next time?</p>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">LABEL (e.g., Home, Work)</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Select value={isCustomLabel ? 'Custom' : newAddressLabel} onChange={handleModalLabelChange} className="checkout-input" style={{ width: isCustomLabel ? '40%' : '100%' }}><option value="Home">Home</option><option value="Office">Office</option><option value="Custom">Custom...</option></Form.Select>
                                {isCustomLabel && <Form.Control placeholder="Label Name" value={newAddressLabel} onChange={(e) => setNewAddressLabel(e.target.value)} className="checkout-input" autoFocus/>}
                            </div>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="outline-secondary" onClick={handleDontSave}>No</Button>
                        <Button variant="primary" onClick={handleSaveAndContinue}>Yes, Save</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default Checkout;