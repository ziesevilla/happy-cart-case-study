import React from 'react';
import { Container, Button, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <Container>
            {/* Hero Section */}
            <div className="p-5 mb-4 bg-light rounded-3 text-center">
                <h1 className="display-4 fw-bold">Welcome to TechStore</h1>
                <p className="lead">Discover the latest gadgets and accessories at unbeatable prices.</p>
                <Button variant="primary" size="lg" as={Link} to="/products">Shop Now</Button>
            </div>

            {/* Featured Categories (Dummy) */}
            <h3 className="mb-4">Featured Categories</h3>
            <Row xs={1} md={3} className="g-4">
                {['Laptops', 'Headphones', 'Accessories'].map((category, idx) => (
                    <Col key={idx}>
                        <Card className="h-100 text-center p-4 shadow-sm hover-shadow">
                            <Card.Body>
                                <Card.Title>{category}</Card.Title>
                                <Card.Text>Check out our new {category.toLowerCase()} collection.</Card.Text>
                                <Button variant="outline-dark" size="sm">Explore</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Home;