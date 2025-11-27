import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Table, InputGroup, Form, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Truck, Tag, AlertTriangle } from 'lucide-react';
import './Cart.css';

const Cart = () => {
    // Added decreaseQuantity here
    const { cart, addToCart, removeFromCart, decreaseQuantity } = useCart();
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState('');
    
    // Selection State
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Remove Confirmation State
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    // Initialize selection when cart loads (optional)
    useEffect(() => {
        // if (cart.length > 0 && selectedItems.length === 0) {
        //     setSelectedItems(cart.map(item => item.id));
        //     setSelectAll(true);
        // }
    }, [cart]);

    // --- CALCULATIONS BASED ON SELECTION ---
    const selectedCartItems = cart.filter(item => selectedItems.includes(item.id));
    
    const currentTotal = selectedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    const FREE_SHIPPING_THRESHOLD = 5000;
    const progress = Math.min((currentTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remaining = FREE_SHIPPING_THRESHOLD - currentTotal;
    const shippingCost = (selectedItems.length > 0 && remaining <= 0) ? 0 : (selectedItems.length > 0 ? 150 : 0);
    const finalTotal = currentTotal + shippingCost;

    // --- HANDLERS ---
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cart.map(item => item.id));
        }
        setSelectAll(!selectAll);
    };

    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
            setSelectAll(false);
        } else {
            const newSelected = [...selectedItems, id];
            setSelectedItems(newSelected);
            if (newSelected.length === cart.length) {
                setSelectAll(true);
            }
        }
    };

    const handleRemoveClick = (item) => {
        setItemToRemove(item);
        setShowRemoveModal(true);
    };

    const confirmRemove = () => {
        if (itemToRemove) {
            removeFromCart(itemToRemove.id);
            setSelectedItems(selectedItems.filter(id => id !== itemToRemove.id));
        }
        setShowRemoveModal(false);
        setItemToRemove(null);
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert("Please select items to checkout.");
            return;
        }
        navigate('/checkout', { state: { checkoutItems: selectedCartItems } });
    };

    if (cart.length === 0) {
        return (
            <div className="cart-page d-flex align-items-center justify-content-center">
                <Container className="cart-empty animate-fade-in">
                    <div className="mb-4 text-muted opacity-25">
                        <ShoppingBag size={80} />
                    </div>
                    <h2 className="fw-bold mb-3">Your cart is empty</h2>
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
                    <h2 className="fw-bold mb-0">Shopping Cart ({cart.length})</h2>
                    <Link to="/products" className="text-decoration-none fw-bold text-muted d-flex align-items-center">
                        <ArrowLeft size={18} className="me-2" /> Continue Shopping
                    </Link>
                </div>

                <Row className="g-5">
                    {/* LEFT: CART ITEMS */}
                    <Col lg={8}>
                        <div className="free-shipping-container">
                            <div className="d-flex align-items-center mb-2">
                                <Truck size={20} className="text-primary me-2" />
                                <span className="fw-bold">
                                    {remaining > 0 
                                        ? <>Add <span className="text-primary">₱{remaining.toLocaleString()}</span> more to selected items for Free Shipping!</>
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
                                        <th style={{width: '50px'}}>
                                            <Form.Check 
                                                type="checkbox" 
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                aria-label="Select all"
                                            />
                                        </th>
                                        <th style={{width: '40%'}}>Product</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item) => (
                                        <tr key={item.id} className={selectedItems.includes(item.id) ? 'bg-light-primary' : ''}>
                                            <td>
                                                <Form.Check 
                                                    type="checkbox" 
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => handleSelectItem(item.id)}
                                                />
                                            </td>
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
                                                        // Use decreaseQuantity for simple reduction
                                                        // If qty is 1, clicking minus triggers the Modal for confirmation
                                                        onClick={() => item.quantity > 1 ? decreaseQuantity(item.id) : handleRemoveClick(item)}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="qty-input">{item.quantity}</span>
                                                    <button className="qty-btn" onClick={() => addToCart(item)}><Plus size={14} /></button>
                                                </div>
                                            </td>
                                            <td data-label="Total" className="fw-bold text-primary">₱{(item.price * item.quantity).toLocaleString()}</td>
                                            <td data-label="">
                                                <button className="btn btn-link text-danger p-0" onClick={() => handleRemoveClick(item)}>
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
                                <span>Selected Items</span>
                                <span>{selectedItems.length}</span>
                            </div>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span className="fw-bold">₱{currentTotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping Estimate</span>
                                <span className={remaining <= 0 ? "text-success fw-bold" : ""}>
                                    {selectedItems.length > 0 ? (remaining <= 0 ? "Free" : "₱150") : "₱0"}
                                </span>
                            </div>
                            
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
                                <span>₱{finalTotal.toLocaleString()}</span>
                            </div>

                            <Button 
                                variant="primary" 
                                className="w-100 rounded-pill py-3 fw-bold mt-4 shadow-sm"
                                onClick={handleCheckout}
                                disabled={selectedItems.length === 0}
                            >
                                CHECKOUT ({selectedItems.length})
                            </Button>

                            <div className="text-center mt-3">
                                <small className="text-muted">Secure Checkout powered by HappyCart</small>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* REMOVE CONFIRMATION MODAL */}
                <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)} centered size="sm">
                    <Modal.Body className="text-center p-4">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}>
                            <AlertTriangle size={24} className="text-warning" />
                        </div>
                        <h5 className="fw-bold mb-2">Remove Item?</h5>
                        <p className="text-muted small mb-4">
                            Are you sure you want to remove <strong>{itemToRemove?.name}</strong> from your cart?
                        </p>
                        <div className="d-grid gap-2">
                            <Button variant="danger" onClick={confirmRemove} className="rounded-pill fw-bold">Yes, Remove</Button>
                            <Button variant="link" onClick={() => setShowRemoveModal(false)} className="text-muted text-decoration-none">Cancel</Button>
                        </div>
                    </Modal.Body>
                </Modal>

            </Container>
        </div>
    );
};

export default Cart;