import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, ShoppingCart } from 'lucide-react';
import './FootNav.css'; // Make sure this CSS file exists as we created before

const Navigation = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const count = getCartCount();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="custom-navbar d-flex align-items-center">
            <Container fluid className="px-4 d-flex justify-content-between align-items-center">
                
                {/* LEFT: LOGO */}
                <Link to="/" className="navbar-logo-text">
                    <ShoppingBag className="me-2" size={28} strokeWidth={2.5} />
                    HAPPY CART
                </Link>

                {/* CENTER: CATEGORIES */}
                <div className="nav-center-links d-none d-md-flex">
                    <Link to="/products" className="nav-category-link">Men's Clothing</Link>
                    <Link to="/products" className="nav-category-link">Women's Clothing</Link>
                    <Link to="/products" className="nav-category-link">Kid's Clothing</Link>
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="nav-actions">
                    {user ? (
                        /* REGISTERED USER VIEW */
                        <>
                            {/* Cart Icon */}
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

                            {/* Profile Link */}
                            <Link to="/account" className="nav-icon-btn ms-2">
                                <User size={24} />
                            </Link>
                            
                            {/* Logout */}
                            <button onClick={handleLogout} className="nav-icon-btn ms-3 text-muted" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        /* VISITOR VIEW */
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
    );
};

export default Navigation;