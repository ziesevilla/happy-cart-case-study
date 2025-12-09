import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Modal, Spinner } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 
import { useOrders } from '../context/OrderContext';
import { useAddress } from '../context/AddressContext';
import { useProducts } from '../context/ProductContext'; 
import { useSettings } from '../context/SettingsContext'; 
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { CheckCircle, CreditCard, ShoppingBag, Smartphone, Banknote, ChevronDown, ChevronUp, ArrowRight, MapPin, Lock } from 'lucide-react';
import './styles/Checkout.css';

/**
 * Checkout Component
 * * Fixed: Now correctly sends payment_method to the API and Confirmation page.
 */
const Checkout = () => {
    // --- CONTEXT HOOKS ---
    const { cart, removeItems } = useCart(); 
    const { user } = useAuth(); 
    
    // API Actions from Contexts
    const { addOrder } = useOrders(); 
    const { getUserAddresses, addAddress } = useAddress();
    const { updateStockAfterPurchase } = useProducts(); 
    
    // Global Settings
    const { storeInfo } = useSettings();

    // --- ROUTING ---
    const navigate = useNavigate();
    const location = useLocation();

    // --- GET ITEMS TO CHECKOUT ---
    const checkoutItems = location.state?.checkoutItems || cart;
    
    // --- BUSINESS LOGIC: DYNAMIC TOTALS ---
    const FREE_SHIPPING_THRESHOLD = Number(storeInfo?.freeShippingThreshold) || 5000;
    const SHIPPING_FEE = Number(storeInfo?.shippingFee) || 150;
    const TAX_RATE = (Number(storeInfo?.taxRate) || 12) / 100; 

    const subtotal = checkoutItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const taxAmount = subtotal * TAX_RATE;
    const finalTotal = subtotal + shippingCost + taxAmount;

    // --- HELPER: FORCE 2 DECIMAL PLACES ---
    const formatPrice = (amount) => {
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // --- LOCAL STATE ---
    const [loading, setLoading] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    
    // Form State
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', street: '', city: '', state: '', zip: '', phone: ''
    });
    
    const [isSavedAddress, setIsSavedAddress] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState('');

    const myAddresses = user ? getUserAddresses(user.id) : [];

    const [cardNum, setCardNum] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    
    const [showSummary, setShowSummary] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newAddressLabel, setNewAddressLabel] = useState('Home');
    const [isCustomLabel, setIsCustomLabel] = useState(false);

    // Auto-fill form
    useEffect(() => {
        if (myAddresses.length > 0 && !selectedAddressId) {
            const defaultAddr = myAddresses.find(addr => addr.default);
            if (defaultAddr) {
                setFormData({
                    firstName: defaultAddr.firstName || defaultAddr.first_name, 
                    lastName: defaultAddr.lastName || defaultAddr.last_name, 
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

    const formatCardNumber = (val) => val.replace(/\s+/g, "").replace(/[^0-9]/gi, "").match(/\d{4,16}/g)?.[0]?.match(/.{1,4}/g)?.join(" ") || val;
    const formatExpiry = (val) => { const v = val.replace(/[^0-9]/gi, ""); return v.length >= 2 ? v.substring(0, 2) + '/' + v.substring(2, 4) : v; };
    
    const total = subtotal + shippingCost + taxAmount;

    // --- HANDLERS ---
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
                firstName: addr.firstName || addr.first_name, 
                lastName: addr.lastName || addr.last_name, 
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

    // 🔴 THIS FUNCTION WAS MISSING THE PAYMENT METHOD
    const processOrder = async () => {
        setLoading(true); 
        const orderPayload = {
            items: checkoutItems,
            shipping_address: formData,
            total: total,
            payment_method: paymentMethod // ✅ ADDED: Send payment method to DB
        };
        const result = await addOrder(orderPayload);

        if (result.success) {
            updateStockAfterPurchase(checkoutItems);
            const purchasedIds = checkoutItems.map(item => item.id);
            removeItems(purchasedIds);
            
            navigate('/confirmation', { 
                state: { 
                    orderId: result.order.order_number, 
                    total: total,
                    paymentMethod: paymentMethod // ✅ ADDED: Pass payment method to Confirmation Page
                } 
            });
        } else {
            alert("Checkout Failed: " + result.message);
        }
        setLoading(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!isSavedAddress) {
            const isDuplicate = myAddresses.some(addr => addr.street.toLowerCase() === formData.street.toLowerCase() && addr.zip === formData.zip);
            if (!isDuplicate && user) { setShowSaveModal(true); } else { processOrder(); }
        } else { 
            processOrder(); 
        }
    };

    const handleSaveAndContinue = async () => {
        if (user) {
            setIsSavingAddress(true); 
            try {
                await addAddress(user.id, { 
                    label: newAddressLabel, 
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    ...formData,
                    is_default: false
                });
            } catch (error) {
                console.error("Failed to save address", error);
            } finally {
                setIsSavingAddress(false); 
            }
        }
        setShowSaveModal(false);
        processOrder();
    };

    const handleDontSave = () => {
        setShowSaveModal(false);
        processOrder();
    };

    return (
        <div className="checkout-page pb-5 animate-fade-in">
            <div className="checkout-breadcrumbs pt-4 d-flex justify-content-center align-items-center">
                <Link to="/cart" className="text-decoration-none text-muted">Cart</Link>
                <span className="breadcrumb-divider mx-2">/</span>
                <span className="breadcrumb-item active">Checkout</span>
                <span className="breadcrumb-divider mx-2">/</span>
                <span className="text-muted">Confirmation</span>
            </div>

            <div className="mobile-summary-toggle d-lg-none" onClick={() => setShowSummary(!showSummary)}>
                <div className="d-flex align-items-center text-primary fw-bold">
                    <ShoppingBag size={18} className="me-2" /> {showSummary ? 'Hide' : 'Show'} Order Summary
                    {showSummary ? <ChevronUp size={16} className="ms-1"/> : <ChevronDown size={16} className="ms-1"/>}
                </div>
                <span className="fw-bold">₱{formatPrice(total)}</span>
            </div>

            <Container className="mt-4">
                <form onSubmit={handleFormSubmit}>
                    <Row className="g-5">
                        <Col lg={7}>
                            <div className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="section-title mb-0"><span className="step-number">1</span>SHIPPING ADDRESS</div>
                                    {(isSavedAddress || loading) && <span className="badge bg-light text-muted border d-flex align-items-center"><Lock size={12} className="me-1"/> {loading ? 'Processing...' : 'Locked'}</span>}
                                </div>
                                {myAddresses.length > 0 && (
                                    <div className="mb-4 p-3 bg-light rounded-3 border border-dashed border-secondary">
                                        <Form.Label className="small fw-bold text-muted d-flex align-items-center"><MapPin size={14} className="me-2"/> Quick Fill from Saved Address</Form.Label>
                                        <Form.Select 
                                            className="checkout-input bg-white" 
                                            value={selectedAddressId} 
                                            onChange={handleAddressSelect}
                                            disabled={loading} 
                                        >
                                            <option value="new">Enter New Address</option>
                                            {myAddresses.map(addr => <option key={addr.id} value={addr.id}>{addr.label}: {addr.street}</option>)}
                                        </Form.Select>
                                    </div>
                                )}
                                <Row className="g-3">
                                    <Col md={6}><Form.Label className="checkout-label">First Name</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress || loading ? 'bg-light' : ''}`} placeholder="John" name="firstName" value={formData.firstName} onChange={handleInputChange} readOnly={isSavedAddress || loading}/></Col>
                                    <Col md={6}><Form.Label className="checkout-label">Last Name</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress || loading ? 'bg-light' : ''}`} placeholder="Doe" name="lastName" value={formData.lastName} onChange={handleInputChange} readOnly={isSavedAddress || loading}/></Col>
                                    <Col xs={12}><Form.Label className="checkout-label">Street Address</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress || loading ? 'bg-light' : ''}`} placeholder="123 Fashion St" name="street" value={formData.street} onChange={handleInputChange} readOnly={isSavedAddress || loading}/></Col>
                                    <Col md={6}><Form.Label className="checkout-label">City</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress || loading ? 'bg-light' : ''}`} placeholder="Makati City" name="city" value={formData.city} onChange={handleInputChange} readOnly={isSavedAddress || loading}/></Col>
                                    <Col md={3}><Form.Label className="checkout-label">State</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress || loading ? 'bg-light' : ''}`} placeholder="NCR" name="state" value={formData.state} onChange={handleInputChange} readOnly={isSavedAddress || loading}/></Col>
                                    <Col md={3}><Form.Label className="checkout-label">Zip</Form.Label><Form.Control required type="text" className={`checkout-input ${isSavedAddress || loading ? 'bg-light' : ''}`} placeholder="1200" name="zip" value={formData.zip} onChange={handleInputChange} readOnly={isSavedAddress || loading}/></Col>
                                    <Col xs={12}><Form.Label className="checkout-label">Phone</Form.Label><Form.Control required type="tel" className={`checkout-input ${isSavedAddress || loading ? 'bg-light' : ''}`} placeholder="0912..." name="phone" value={formData.phone} onChange={handleInputChange} readOnly={isSavedAddress || loading}/></Col>
                                </Row>
                            </div>
                            
                            <div className="mb-5">
                                <div className="section-title"><span className="step-number">2</span>PAYMENT</div>
                                <Row className="g-3 mb-4">
                                    {['credit_card', 'gcash', 'cod'].map(method => (
                                        <Col sm={4} key={method}>
                                            <div 
                                                className={`payment-option-card text-center ${paymentMethod === method ? 'selected' : ''} ${loading ? 'opacity-50 pointer-events-none' : ''}`} 
                                                style={{ cursor: loading ? 'not-allowed' : 'pointer'}}
                                                onClick={() => !loading && setPaymentMethod(method)}
                                            >
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
                                        <Form.Control required type="text" className="checkout-input mb-3 bg-white" placeholder="0000 0000 0000 0000" value={cardNum} onChange={(e) => setCardNum(formatCardNumber(e.target.value))} maxLength={19} disabled={loading}/>
                                        <Row className="g-3">
                                            <Col md={6}><Form.Control required type="text" className="checkout-input bg-white" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} disabled={loading}/></Col>
                                            <Col md={6}><Form.Control required type="password" className="checkout-input bg-white" placeholder="CVV" maxLength={4} disabled={loading}/></Col>
                                        </Row>
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
                                            <div className="fw-bold small">₱{formatPrice(item.price * item.quantity)}</div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="checkout-total-row"><span className="text-muted">Subtotal</span><strong>₱{formatPrice(subtotal)}</strong></div>
                                <div className="checkout-total-row"><span className="text-muted">Shipping</span><strong className="text-success">{shippingCost === 0 ? 'Free' : `₱${formatPrice(shippingCost)}`}</strong></div>
                                {TAX_RATE > 0 && (
                                    <div className="checkout-total-row"><span className="text-muted">Tax ({(TAX_RATE * 100).toFixed(0)}%)</span><strong>₱{formatPrice(taxAmount)}</strong></div>
                                )}
                                
                                <div className="checkout-total-row final-total"><span>Total</span><span className="text-primary">₱{formatPrice(total)}</span></div>
                                
                                <Button type="submit" variant="primary" className="w-100 rounded-pill py-3 fw-bold mt-4 shadow-lg" disabled={loading}>
                                    {loading ? (
                                        <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>Processing...</>
                                    ) : (
                                        <>PLACE ORDER <ArrowRight size={18} className="ms-2"/></>
                                    )}
                                </Button>
                                <div className="text-center mt-3 d-flex align-items-center justify-content-center text-muted small"><CheckCircle size={14} className="me-1 text-success"/> Secure SSL Encryption</div>
                            </div>
                        </Col>
                    </Row>
                </form>

                <Modal show={showSaveModal} onHide={handleDontSave} centered backdrop={isSavingAddress ? 'static' : true}>
                    <Modal.Header closeButton={!isSavingAddress} className="border-0"><Modal.Title className="fw-bold">Save this address?</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <p className="text-muted">We noticed this is a new address. Would you like to save it to your account for faster checkout next time?</p>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">LABEL (e.g., Home, Work)</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Select value={isCustomLabel ? 'Custom' : newAddressLabel} onChange={handleModalLabelChange} className="checkout-input" style={{ width: isCustomLabel ? '40%' : '100%' }} disabled={isSavingAddress}>
                                    <option value="Home">Home</option>
                                    <option value="Office">Office</option>
                                    <option value="Custom">Custom...</option>
                                </Form.Select>
                                {isCustomLabel && <Form.Control placeholder="Label Name" value={newAddressLabel} onChange={(e) => setNewAddressLabel(e.target.value)} className="checkout-input" autoFocus disabled={isSavingAddress}/>}
                            </div>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="outline-secondary" onClick={handleDontSave} disabled={isSavingAddress}>No</Button>
                        <Button variant="primary" onClick={handleSaveAndContinue} disabled={isSavingAddress}>
                            {isSavingAddress ? (
                                <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>Saving...</>
                            ) : (
                                "Yes, Save"
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default Checkout;