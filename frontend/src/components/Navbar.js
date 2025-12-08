import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Badge, Modal, Button, Spinner } from 'react-bootstrap'; 
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext'; // <--- 1. IMPORT SETTINGS
import { ShoppingBag, User, LogOut, ShoppingCart, LayoutDashboard } from 'lucide-react'; 
import './FootNav.css';

const Navigation = () => {
    // Contexts
    const { user, logout, loading: authLoading } = useAuth();
    const { getCartCount } = useCart();
    
    // 2. GET CATEGORIES FROM CONTEXT
    // This array comes directly from your Database (via SettingsContext)
    const { settings, categories } = useSettings(); 
    
    const navigate = useNavigate();
    const count = getCartCount();
    
    // Role Check
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    // Local UI State
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false); 

    const handleLogoutClick = () => setShowLogoutModal(true);

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true); 
        await logout(); 
        setIsLoggingOut(false); 
        setShowLogoutModal(false); 
        navigate('/'); 
    };

    return (
        <>
            <nav className="custom-navbar d-flex align-items-center">
                <Container fluid className="px-4 d-flex justify-content-between align-items-center">
                    
                    {/* LEFT: BRANDING */}
                    <Link to="/" className="navbar-logo-text">
                        <ShoppingBag className="me-2" size={28} strokeWidth={2.5} />
                        HAPPY CART
                    </Link>

                    {/* ======================================================== */}
                    {/* CENTER: DYNAMIC CATEGORIES */}
                    {/* ======================================================== */}
                    {!isAdmin && (
                        <div className="nav-center-links d-none d-md-flex">
                            {/* "New Arrivals" is usually a special filter, so we keep it static or separate */}
                            <Link to="/products?collection=New" className="nav-category-link">New Arrivals</Link>

                            {/* DYNAMIC LOOP: This creates a link for every category in your DB */}
                            {categories.map((cat) => (
                                <Link 
                                    key={cat} 
                                    to={`/products?collection=${cat}`} // Creates URL like /products?collection=Gaming
                                    className="nav-category-link"
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* RIGHT: USER ACTIONS */}
                    <div className="nav-actions d-flex align-items-center">
                        
                        {authLoading ? (
                            <div style={{ minWidth: '120px', height: '40px' }}></div>
                        ) : user ? (
                            // --- LOGGED IN VIEW ---
                            <>
                                {isAdmin && (
                                    <Link to="/admin" className="nav-icon-btn me-2 text-primary" title="Admin Dashboard">
                                        <LayoutDashboard size={24} />
                                    </Link>
                                )}

                                {!isAdmin && (
                                    <Link to="/cart" className="nav-icon-btn position-relative me-2">
                                        <ShoppingCart size={24} />
                                        {count > 0 && (
                                            <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle border border-light rounded-circle" style={{ fontSize: '0.6rem', padding: '0.35em 0.5em' }}>
                                                {count}
                                            </Badge>
                                        )}
                                    </Link>
                                )}

                                <Link to={isAdmin ? "/admin/settings" : "/account"} className="nav-icon-btn ms-2">
                                    <User size={24} />
                                </Link>

                                <button onClick={handleLogoutClick} className="nav-icon-btn ms-3 text-muted" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            // --- GUEST VIEW ---
                            <>
                                <Link to="/login">
                                    <button className="btn-nav-auth btn-login me-2">Login</button>
                                </Link>
                                
                                {settings.allowRegistration && (
                                    <Link to="/register">
                                        <button className="btn-nav-auth btn-signup">Sign Up</button>
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </Container>
            </nav>

            {/* LOGOUT MODAL */}
            <Modal show={showLogoutModal} onHide={() => !isLoggingOut && setShowLogoutModal(false)} centered size="sm">
                <Modal.Body className="text-center p-4">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}>
                        <LogOut size={24} className="text-danger" />
                    </div>
                    <h5 className="fw-bold mb-2">Log Out?</h5>
                    <p className="text-muted small mb-4">Are you sure you want to sign out?</p>
                    <div className="d-grid gap-2">
                        <Button variant="danger" onClick={handleConfirmLogout} className="rounded-pill fw-bold" disabled={isLoggingOut}>
                            {isLoggingOut ? <Spinner as="span" animation="border" size="sm"/> : "Yes, Log Out"}
                        </Button>
                        <Button variant="link" onClick={() => setShowLogoutModal(false)} className="text-muted text-decoration-none" disabled={isLoggingOut}>
                            Cancel
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Navigation;