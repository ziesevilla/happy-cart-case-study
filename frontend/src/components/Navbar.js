import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navigation = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const count = getCartCount();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/">TechStore</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/products">Products</Nav.Link>
                    </Nav>
                    
                    <Nav className="ms-auto align-items-center">
                        {/* Cart Link - Only visible if user is logged in */}
                        {user && (
                            <Nav.Link as={Link} to="/cart" className="position-relative me-3">
                                <i className="bi bi-cart"></i> Cart
                                {count > 0 && (
                                    <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                                        {count}
                                    </Badge>
                                )}
                            </Nav.Link>
                        )}

                        {/* Auth Links */}
                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/account" className="text-light fw-bold">
                                    {user.name} ({user.role})
                                </Nav.Link>
                                <Nav.Link onClick={handleLogout} className="text-danger btn btn-link text-decoration-none">
                                    Logout
                                </Nav.Link>
                            </>
                        ) : (
                            <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;