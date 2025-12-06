import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Badge, Modal, Button, Spinner } from 'react-bootstrap'; 
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, ShoppingCart } from 'lucide-react';
import './FootNav.css';

/**
 * Navigation Component
 * * The main header of the application.
 * * DYNAMIC: Changes appearance based on Login Status and Cart Count.
 * * RESPONSIVE: Hides category links on mobile screens.
 */
const Navigation = () => {
    // 1. Context Integration
    // We need 'user' to decide whether to show "Login" or "Profile".
    // We need 'authLoading' to prevent UI flickering during initial load.
    const { user, logout, loading: authLoading } = useAuth();
    
    // We need 'getCartCount' to update the red badge number in real-time.
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const count = getCartCount();
    
    // 2. Local UI State
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false); 

    // Open the confirmation modal
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    /**
     * Handle Async Logout
     * * Since logout() talks to the backend (to invalidate token), it is async.
     * * We show a loading spinner so the user knows something is happening.
     */
    const handleConfirmLogout = async () => {
        setIsLoggingOut(true); // 1. Start Spinner
        
        await logout(); // 2. Wait for Server/Context to finish
        
        setIsLoggingOut(false); // 3. Stop Spinner
        setShowLogoutModal(false); // 4. Close Modal
        navigate('/'); // 5. Redirect to Home
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

                    {/* CENTER: CATEGORIES (Hidden on Mobile) */}
                    {/* d-none d-md-flex: "Display None" on mobile, "Flex" on Medium+ screens */}
                    <div className="nav-center-links d-none d-md-flex">
                        <Link to="/products?collection=New" className="nav-category-link">New Arrivals</Link>
                        <Link to="/products?collection=Clothing" className="nav-category-link">Clothing</Link>
                        <Link to="/products?collection=Shoes" className="nav-category-link">Shoes</Link>
                        <Link to="/products?collection=Accessories" className="nav-category-link">Accessories</Link>
                    </div>

                    {/* RIGHT: USER ACTIONS */}
                    <div className="nav-actions d-flex align-items-center">
                        
                        {/* UX PATTERN: SKELETON LOADING
                            If the app is still checking LocalStorage for a token, 
                            we show a blank space instead of flashing "Login" buttons.
                        */}
                        {authLoading ? (
                            <div style={{ minWidth: '120px', height: '40px' }}></div>
                        ) : user ? (
                            // --- LOGGED IN VIEW ---
                            <>
                                {/* Cart Icon with Badge */}
                                <Link to="/cart" className="nav-icon-btn position-relative me-2">
                                    <ShoppingCart size={24} />
                                    {count > 0 && (
                                        <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle border border-light rounded-circle" style={{ fontSize: '0.6rem', padding: '0.35em 0.5em' }}>
                                            {count}
                                        </Badge>
                                    )}
                                </Link>

                                {/* Profile Link */}
                                <Link to="/account" className="nav-icon-btn ms-2">
                                    <User size={24} />
                                </Link>

                                {/* Logout Button (Triggers Modal) */}
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
                                <Link to="/register">
                                    <button className="btn-nav-auth btn-signup">Sign Up</button>
                                </Link>
                            </>
                        )}
                    </div>
                </Container>
            </nav>

            {/* ======================================================== */}
            {/* LOGOUT CONFIRMATION MODAL */}
            {/* ======================================================== */}
            {/* onHide logic prevents closing the modal while spinner is spinning */}
            <Modal show={showLogoutModal} onHide={() => !isLoggingOut && setShowLogoutModal(false)} centered size="sm">
                <Modal.Body className="text-center p-4">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}>
                        <LogOut size={24} className="text-danger" />
                    </div>
                    <h5 className="fw-bold mb-2">Log Out?</h5>
                    <p className="text-muted small mb-4">Are you sure you want to sign out of your account?</p>
                    <div className="d-grid gap-2">
                        
                        {/* CONFIRM BUTTON (With Spinner State) */}
                        <Button 
                            variant="danger" 
                            onClick={handleConfirmLogout} 
                            className="rounded-pill fw-bold"
                            disabled={isLoggingOut} // Disable to prevent double-clicks
                        >
                            {isLoggingOut ? (
                                <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>Signing out...</>
                            ) : (
                                "Yes, Log Out"
                            )}
                        </Button>

                        {/* CANCEL BUTTON */}
                        <Button 
                            variant="link" 
                            onClick={() => setShowLogoutModal(false)} 
                            className="text-muted text-decoration-none"
                            disabled={isLoggingOut}
                        >
                            Cancel
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Navigation;