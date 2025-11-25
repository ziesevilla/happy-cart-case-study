import React from 'react';
import { Container, Table, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Cart = () => {
    return (
        <Container>
            <h2 className="mb-4">Shopping Cart</h2>
            <div className="row">
                <div className="col-md-8">
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Wireless Headphones</td>
                                <td>$99.99</td>
                                <td>1</td>
                                <td>$99.99</td>
                                <td><Button variant="danger" size="sm">Remove</Button></td>
                            </tr>
                            <tr>
                                <td>Gaming Mouse</td>
                                <td>$49.99</td>
                                <td>2</td>
                                <td>$99.98</td>
                                <td><Button variant="danger" size="sm">Remove</Button></td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
                <div className="col-md-4">
                    <Card>
                        <Card.Header className="bg-primary text-white">Summary</Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>$199.97</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tax:</span>
                                <span>$0.00</span>
                            </div>
                            <h5 className="d-flex justify-content-between fw-bold">
                                <span>Total:</span>
                                <span>$199.97</span>
                            </h5>
                            <Button variant="success" className="w-100 mt-3" as={Link} to="/checkout">
                                Proceed to Checkout
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </Container>
    );
};

export default Cart;