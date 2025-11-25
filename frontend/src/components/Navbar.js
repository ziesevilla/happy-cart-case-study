import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { useCart } from '../context/CartContext'; // Import the hook

const Navigation = () => {
    const { getCartCount } = useCart(); // Use the hook to get data
    const count = getCartCount();

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
                        <Nav.Link as={Link} to="/cart" className="position-relative me-3">
                            Cart
                            {count > 0 && (
                                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                                    {count}
                                </Badge>
                            )}
                        </Nav.Link>
                        <Nav.Link as={Link} to="/login">Login</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;