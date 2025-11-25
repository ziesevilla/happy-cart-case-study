import React from 'react';
import { Container, Table, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cart, removeFromCart, getCartTotal, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <Container className="text-center py-5">
                <h2>Your cart is empty</h2>
                <p className="text-muted">Looks like you haven't added anything yet.</p>
                <Button as={Link} to="/products" variant="primary">Start Shopping</Button>
            </Container>
        );
    }

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
                            {cart.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <span className="me-2 fs-4">{item.emoji}</span>
                                            {item.name}
                                        </div>
                                    </td>
                                    <td>${item.price.toFixed(2)}</td>
                                    <td>{item.quantity}</td>
                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                    <td>
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Button variant="outline-danger" size="sm" onClick={clearCart}>Clear Cart</Button>
                </div>
                <div className="col-md-4">
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-primary text-white">Summary</Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>${getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tax (0%):</span>
                                <span>$0.00</span>
                            </div>
                            <hr />
                            <h5 className="d-flex justify-content-between fw-bold">
                                <span>Total:</span>
                                <span>${getCartTotal().toFixed(2)}</span>
                            </h5>
                            <Button 
                                variant="success" 
                                className="w-100 mt-3" 
                                as={Link} 
                                to="/checkout"
                            >
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