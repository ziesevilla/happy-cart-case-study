import React from 'react';
import { Container, Button, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
    // Categories that actually match our Products page
    const featuredCategories = [
        { name: 'Audio', desc: 'Premium headphones and speakers', img: '🎧' },
        { name: 'Peripherals', desc: 'Keyboards, mice, and more', img: '⌨️' },
        { name: 'Wearables', desc: 'Smartwatches for active lives', img: '⌚' }
    ];

    return (
        <Container>
            {/* Hero Section */}
            <div className="p-5 mb-5 bg-dark text-white rounded-3 text-center" style={{ backgroundImage: 'linear-gradient(45deg, #212529, #343a40)' }}>
                <h1 className="display-4 fw-bold">Next Gen Tech</h1>
                <p className="lead mb-4">Upgrade your setup with the latest gear delivered to your door.</p>
                <Button variant="primary" size="lg" as={Link} to="/products">Browse Catalog</Button>
            </div>

            {/* Featured Categories */}
            <h3 className="mb-4 text-center">Shop by Category</h3>
            <Row xs={1} md={3} className="g-4 mb-5">
                {featuredCategories.map((cat, idx) => (
                    <Col key={idx}>
                        <Card className="h-100 text-center p-4 shadow-sm border-0 hover-shadow">
                            <Card.Body>
                                <div className="display-4 mb-3">{cat.img}</div>
                                <Card.Title>{cat.name}</Card.Title>
                                <Card.Text className="text-muted">{cat.desc}</Card.Text>
                                <Button 
                                    variant="outline-dark" 
                                    size="sm" 
                                    as={Link} 
                                    to="/products"
                                    className="mt-2"
                                >
                                    View {cat.name}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Home;