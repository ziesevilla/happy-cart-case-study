import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Products = () => {
    // Dummy Data
    const products = [
        { id: 1, name: 'Wireless Headphones', price: 99.99, desc: 'Noise cancelling' },
        { id: 2, name: 'Smart Watch', price: 199.99, desc: 'Fitness tracker' },
        { id: 3, name: 'Gaming Mouse', price: 49.99, desc: 'High precision' },
        { id: 4, name: 'Mechanical Keyboard', price: 89.99, desc: 'RGB Backlit' },
    ];

    return (
        <Container>
            <h2 className="mb-4">Our Products</h2>
            <Row xs={1} md={2} lg={4} className="g-4">
                {products.map((product) => (
                    <Col key={product.id}>
                        <Card className="h-100 shadow-sm">
                            {/* Placeholder image */}
                            <div className="bg-secondary text-white d-flex align-items-center justify-content-center" style={{height: '150px'}}>
                                <span>Image</span>
                            </div>
                            <Card.Body className="d-flex flex-column">
                                <Card.Title>{product.name}</Card.Title>
                                <Card.Text>{product.desc}</Card.Text>
                                <h5 className="mt-auto text-primary">${product.price}</h5>
                                <Button variant="primary" className="mt-2">Add to Cart</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Products;