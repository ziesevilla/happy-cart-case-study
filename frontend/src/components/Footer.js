import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="text-white py-5 mt-auto" style={{ background: 'var(--primary-gradient)' }}>
            <Container>
                <Row className="gy-4">
                    <Col md={6}>
                        <h5 className="fw-bold mb-3">HAPPY CART</h5>
                        <p className="mb-0 opacity-75">
                            Curated tech for your happy life. <br />
                            Shop the latest trends in pastel pop style.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <div className="mb-3">
                            <a href="#" className="text-white text-decoration-none me-3">Instagram</a>
                            <a href="#" className="text-white text-decoration-none me-3">Twitter</a>
                            <a href="#" className="text-white text-decoration-none">Facebook</a>
                        </div>
                        <p className="small opacity-50">&copy; {new Date().getFullYear()} Happy Cart. All rights reserved.</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;