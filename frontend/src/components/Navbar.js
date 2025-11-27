import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Badge, Modal, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, ShoppingCart } from 'lucide-react';
import './FootNav.css';

const Navigation = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const count = getCartCount();
    
    // State for Logout Confirmation
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        navigate('/');
    };

    return (
        <>
            <nav className="custom-navbar d-flex align-items-center">
                <Container fluid className="px-4 d-flex justify-content-between align-items-center">
                    
                    {/* LEFT: LOGO */}
                    <Link to="/" className="navbar-logo-text">
                        <ShoppingBag className="me-2" size={28} strokeWidth={2.5} />
                        HAPPY CART
                    </Link>

                    {/* CENTER: GENDER-NEUTRAL CATEGORIES */}
                    <div className="nav-center-links d-none d-md-flex">
                        <Link to="/products?collection=New" className="nav-category-link">New Arrivals</Link>
                        <Link to="/products?collection=Clothing" className="nav-category-link">Clothing</Link>
                        <Link to="/products?collection=Shoes" className="nav-category-link">Shoes</Link>
                        <Link to="/products?collection=Accessories" className="nav-category-link">Accessories</Link>
                    </div>

                    {/* RIGHT: ACTIONS */}
                    <div className="nav-actions">
                        {user ? (
                            <>
                                <Link to="/cart" className="nav-icon-btn position-relative me-2">
                                    <ShoppingCart size={24} />
                                    {count > 0 && (
                                        <Badge 
                                            bg="danger" 
                                            pill 
                                            className="position-absolute top-0 start-100 translate-middle border border-light rounded-circle"
                                            style={{ fontSize: '0.6rem', padding: '0.35em 0.5em' }}
                                        >
                                            {count}
                                        </Badge>
                                    )}
                                </Link>
                                <Link to="/account" className="nav-icon-btn ms-2">
                                    <User size={24} />
                                </Link>
                                {/* Updated Logout Button to trigger Modal */}
                                <button onClick={handleLogoutClick} className="nav-icon-btn ms-3 text-muted" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <button className="btn-nav-auth btn-login">Login</button>
                                </Link>
                                <Link to="/register">
                                    <button className="btn-nav-auth btn-signup">Sign Up</button>
                                </Link>
                            </>
                        )}
                    </div>
                </Container>
            </nav>

            {/* LOGOUT CONFIRMATION MODAL */}
            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered size="sm">
                <Modal.Body className="text-center p-4">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}>
                        <LogOut size={24} className="text-danger" />
                    </div>
                    <h5 className="fw-bold mb-2">Log Out?</h5>
                    <p className="text-muted small mb-4">Are you sure you want to sign out of your account?</p>
                    <div className="d-grid gap-2">
                        <Button variant="danger" onClick={handleConfirmLogout} className="rounded-pill fw-bold">Yes, Log Out</Button>
                        <Button variant="link" onClick={() => setShowLogoutModal(false)} className="text-muted text-decoration-none">Cancel</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Navigation;