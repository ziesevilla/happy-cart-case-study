import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-light py-4 mt-auto">
            <Container>
                <Row>
                    <Col md={6}>
                        <h5>TechStore</h5>
                        <p>Your one-stop shop for all things tech.</p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <p>&copy; {new Date().getFullYear()} TechStore. All rights reserved.</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;