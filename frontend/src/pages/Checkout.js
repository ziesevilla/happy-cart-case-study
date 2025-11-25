import React from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';

const Checkout = () => {
    return (
        <Container>
            <h2 className="mb-4">Checkout</h2>
            <Row>
                <Col md={8}>
                    <h4 className="mb-3">Billing Details</h4>
                    <Form>
                        <Row className="mb-3">
                            <Col>
                                <Form.Control placeholder="First name" />
                            </Col>
                            <Col>
                                <Form.Control placeholder="Last name" />
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Control placeholder="Email Address" type="email" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Control placeholder="Shipping Address" />
                        </Form.Group>
                        <Button variant="primary" type="submit" size="lg" className="w-100">
                            Place Order
                        </Button>
                    </Form>
                </Col>
                <Col md={4}>
                    <div className="bg-light p-4 rounded">
                        <h4>Order Total</h4>
                        <hr />
                        <div className="d-flex justify-content-between fw-bold">
                            <span>Total</span>
                            <span>$199.97</span>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Checkout;