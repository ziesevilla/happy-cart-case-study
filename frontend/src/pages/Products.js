import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext'; // NEW IMPORT
import './Products.css';

const Products = () => {
    // --- USE CONTEXT INSTEAD OF STATIC DATA ---
    const { products: ALL_PRODUCTS } = useProducts(); 
    
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const collectionFilter = queryParams.get('collection') || 'All'; 

    // ... (Rest of the file logic remains identical) ...
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState(5000);

    useEffect(() => {
        setSelectedCategory('All');
    }, [collectionFilter]);

    const getCategoriesInCollection = (collection) => {
        switch(collection) {
            case 'Clothing': return ['Dresses', 'Tops', 'Bottoms', 'Outerwear'];
            case 'Shoes': return ['Shoes'];
            case 'Accessories': return ['Accessories'];
            default: return [];
        }
    };

    const targetCategories = getCategoriesInCollection(collectionFilter);

    const uniqueCategories = [...new Set(
        collectionFilter === 'All' || collectionFilter === 'New' 
            ? ALL_PRODUCTS.map(p => p.category) 
            : targetCategories 
    )].filter(cat => cat !== 'All').sort();

    const sidebarCategories = ['All', ...uniqueCategories];

    const filteredProducts = ALL_PRODUCTS.filter(product => {
        let matchesCollection = true;
        if (collectionFilter !== 'All' && collectionFilter !== 'New') {
            matchesCollection = targetCategories.includes(product.category);
        }

        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesPrice = product.price <= priceRange;

        return matchesCollection && matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return 0; 
    });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('All');
        setPriceRange(5000);
        navigate('/products'); 
    };

    const getBannerImage = () => {
        switch(collectionFilter) {
            case 'Clothing': return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop';
            case 'Shoes': return 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2070&auto=format&fit=crop';
            case 'Accessories': return 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop';
            default: return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop';
        }
    }

    return (
        <div className="products-page animate-fade-in">
            <div 
                className="products-hero" 
                style={{ backgroundImage: `url(${getBannerImage()})` }}
            >
                <div className="products-hero-content">
                    <h1 className="display-3 fw-bold mb-2">
                        {collectionFilter === 'All' || collectionFilter === 'New' ? 'THE COLLECTION' : collectionFilter.toUpperCase()}
                    </h1>
                    <p className="lead mb-0 text-white-50">Style that knows no boundaries.</p>
                </div>
            </div>

            <Container className="pb-5">
                <Row>
                    <Col md={3} className="mb-4">
                        <div className="filter-sidebar">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div className="d-flex align-items-center text-primary">
                                    <SlidersHorizontal size={20} className="me-2" />
                                    <h5 className="mb-0 fw-bold">FILTERS</h5>
                                </div>
                                {collectionFilter !== 'All' && (
                                    <span className="badge bg-primary-subtle text-primary d-flex align-items-center">
                                        {collectionFilter} <X size={12} className="ms-1" style={{cursor:'pointer'}} onClick={() => navigate('/products')}/>
                                    </span>
                                )}
                            </div>
                            
                            <div className="filter-group mb-4">
                                <h5>CATEGORY</h5>
                                <div className="d-flex flex-column gap-2">
                                    {sidebarCategories.map(cat => (
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

                    <Col md={9}>
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

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-5">
                                <h4 className="text-muted">No items found.</h4>
                                <p className="text-muted small">Try adjusting your filters or search criteria.</p>
                                <button 
                                    className="btn btn-link text-primary mt-2" 
                                    onClick={clearFilters}
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