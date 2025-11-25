import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext'; // Import Auth Hook

const Navigation = () => {
    const { user, logout } = useAuth(); // Get user state
    const navigate = useNavigate();

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
                    <Nav className="ms-auto">
                        {user ? (
                            <>
                                {/* Show this if Logged In */}
                                <Nav.Link as={Link} to="/account" className="text-light fw-bold">
                                    {user.name} ({user.role})
                                </Nav.Link>
                                <Nav.Link onClick={handleLogout} className="text-danger">
                                    Logout
                                </Nav.Link>
                            </>
                        ) : (
                            /* Show this if Logged Out */
                            <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;