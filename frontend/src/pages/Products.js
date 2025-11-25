import React, { useState } from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';

// Enhanced Mock Data
const ALL_PRODUCTS = [
    { id: 1, name: 'Wireless Headphones', price: 99.99, category: 'Audio', description: 'Immersive sound with noise cancelling.', emoji: '🎧' },
    { id: 2, name: 'Smart Watch Series 5', price: 299.99, category: 'Wearables', description: 'Track your fitness and sleep.', emoji: '⌚' },
    { id: 3, name: 'Mechanical Keyboard', price: 120.00, category: 'Peripherals', description: 'RGB backlit with blue switches.', emoji: '⌨️' },
    { id: 4, name: 'Gaming Mouse', price: 59.99, category: 'Peripherals', description: 'High precision 16000 DPI sensor.', emoji: '🖱️' },
    { id: 5, name: '4K Monitor', price: 349.50, category: 'Displays', description: '27-inch IPS panel for crisp visuals.', emoji: '🖥️' },
    { id: 6, name: 'Laptop Stand', price: 29.99, category: 'Accessories', description: 'Ergonomic aluminum design.', emoji: '📐' },
    { id: 7, name: 'USB-C Hub', price: 45.00, category: 'Accessories', description: 'Expand your connectivity.', emoji: '🔌' },
    { id: 8, name: 'Bluetooth Speaker', price: 79.99, category: 'Audio', description: 'Portable sound with deep bass.', emoji: '🔈' },
];

const Products = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Filter Logic
    const filteredProducts = ALL_PRODUCTS.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', 'Audio', 'Wearables', 'Peripherals', 'Displays', 'Accessories'];

    return (
        <Container>
            {/* Header & Filters */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 mt-3">
                <h2 className="mb-3 mb-md-0">Our Collection</h2>
                
                <div className="d-flex gap-2">
                    {/* Category Dropdown */}
                    <Form.Select 
                        style={{ width: '150px' }} 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </Form.Select>

                    {/* Search Bar */}
                    <InputGroup style={{ width: '250px' }}>
                        <Form.Control 
                            placeholder="Search products..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                    <h4>No products found matching your criteria.</h4>
                    <button className="btn btn-link" onClick={() => {setSearchTerm(''); setSelectedCategory('All')}}>Reset Filters</button>
                </div>
            ) : (
                <Row xs={1} md={2} lg={4} className="g-4">
                    {filteredProducts.map((product) => (
                        <Col key={product.id}>
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default Products;