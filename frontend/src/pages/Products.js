import React, { useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ALL_PRODUCTS } from '../data/products'; // Import shared data
import './Products.css';

const CATEGORIES = ['All', 'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'];

const Products = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState(5000);

    // Filter Logic
    const filteredProducts = ALL_PRODUCTS.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesPrice = product.price <= priceRange;
        return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return 0; // featured order
    });

    return (
        <div className="products-page animate-fade-in">
            {/* HERO BANNER */}
            <div 
                className="products-hero" 
                style={{ 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop)' 
                }}
            >
                <div className="products-hero-content">
                    <h1 className="display-3 fw-bold mb-2">THE COLLECTION</h1>
                    <p className="lead mb-0 text-white-50">Curated essentials for the modern wardrobe.</p>
                </div>
            </div>

            <Container className="pb-5">
                <Row>
                    {/* STICKY SIDEBAR FILTERS */}
                    <Col md={3} className="mb-4">
                        <div className="filter-sidebar">
                            <div className="d-flex align-items-center mb-4 text-primary">
                                <SlidersHorizontal size={20} className="me-2" />
                                <h5 className="mb-0 fw-bold">FILTER BY</h5>
                            </div>
                            
                            <div className="filter-group mb-4">
                                <h5>CATEGORY</h5>
                                <div className="d-flex flex-column gap-2">
                                    {CATEGORIES.map(cat => (
                                        <span 
                                            key={cat} 
                                            className={`filter-option ${selectedCategory === cat ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <h5>PRICE RANGE</h5>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">Max Price:</span>
                                    <span className="fw-bold text-primary">₱{priceRange.toLocaleString()}</span>
                                </div>
                                <Form.Range 
                                    className="mt-2" 
                                    min={0}
                                    max={5000}
                                    step={100}
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                />
                                <div className="d-flex justify-content-between small text-muted mt-2">
                                    <span>₱0</span>
                                    <span>₱5,000+</span>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* PRODUCT GRID */}
                    <Col md={9}>
                        {/* STICKY Search & Sort Bar */}
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 sticky-search-bar mb-4">
                            <div className="search-wrapper w-100" style={{ maxWidth: '400px' }}>
                                <Search className="search-icon" size={18} />
                                <Form.Control 
                                    type="text"
                                    placeholder="Search for items..." 
                                    className="search-input rounded-pill"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <Form.Select 
                                className="sort-select w-auto" 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="featured">Featured</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </Form.Select>
                        </div>

                        {/* Grid Content */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-5">
                                <h4 className="text-muted">No items found matching your search.</h4>
                                <button 
                                    className="btn btn-link text-primary mt-2" 
                                    onClick={() => {setSearchTerm(''); setSelectedCategory('All'); setPriceRange(5000);}}
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <Row xs={1} md={2} lg={3} className="g-4">
                                {filteredProducts.map((product) => (
                                    <Col key={product.id}>
                                        <ProductCard product={product} />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Products;