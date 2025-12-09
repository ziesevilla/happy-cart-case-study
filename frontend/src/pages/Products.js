import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Pagination, Spinner, InputGroup, Button } from 'react-bootstrap';
import { Search, SlidersHorizontal, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext'; 
import './styles/Products.css';

const Products = () => {
    const { products: ALL_PRODUCTS, loading } = useProducts(); 
    
    const location = useLocation();
    const navigate = useNavigate();
    
    const queryParams = new URLSearchParams(location.search);
    const collectionFilter = queryParams.get('collection') || 'All'; 
    const initialSubCat = queryParams.get('subCategory') || 'All';
    const isNewArrivals = collectionFilter === 'New'; 

    // --- LOCAL STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState(initialSubCat);
    const [sortBy, setSortBy] = useState('featured');
    
    // REFACTORED PRICE FILTER: Min/Max inputs
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; 

    // Sync state
    useEffect(() => {
        setSelectedSubCategory(initialSubCat);
        setCurrentPage(1); 
    }, [initialSubCat, collectionFilter]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    // --- HELPERS ---
    const isWithinNewWindow = (dateString) => {
        if (!dateString) return false;
        const productDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - productDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 60; 
    };

    const getCategoriesInCollection = (collection) => {
        if (collection === 'All' || collection === 'New') return [];
        return [collection];
    };

    const targetCategories = getCategoriesInCollection(collectionFilter);

    const uniqueSubCategories = [...new Set(
        collectionFilter === 'All' || collectionFilter === 'New'
            ? ALL_PRODUCTS.map(p => p.sub_category || p.subCategory).filter(Boolean)
            : ALL_PRODUCTS
                .filter(p => targetCategories.includes(p.category))
                .map(p => p.sub_category || p.subCategory)
                .filter(Boolean)
    )].sort();

    const sidebarFilters = ['All', ...uniqueSubCategories];

    // --- FILTERING ---
    const filteredProducts = ALL_PRODUCTS.filter(product => {
        // 1. New Arrivals
        if (isNewArrivals) {
            return isWithinNewWindow(product.dateAdded || product.created_at);
        }

        // 2. Category
        let matchesCollection = true;
        if (collectionFilter !== 'All') {
            matchesCollection = targetCategories.includes(product.category);
        }

        // 3. Search
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 4. Sub-Category
        const productSub = product.sub_category || product.subCategory;
        const matchesSubCategory = selectedSubCategory === 'All' || productSub === selectedSubCategory;
        
        // 5. Price Range (Refactored)
        const productPrice = parseFloat(product.price);
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        const matchesPrice = productPrice >= min && productPrice <= max;

        return matchesCollection && matchesSearch && matchesSubCategory && matchesPrice;
    }).sort((a, b) => {
        // 6. Sorting Logic
        if (isNewArrivals) return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        switch(sortBy) {
            case 'price-low': return priceA - priceB;
            case 'price-high': return priceB - priceA;
            case 'name-asc': return nameA.localeCompare(nameB);
            case 'name-desc': return nameB.localeCompare(nameA);
            default: return 0; // Featured
        }
    });

    // --- PAGINATION ---
    const currentProducts = isNewArrivals 
        ? filteredProducts 
        : filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSubCategory('All');
        setMinPrice('');
        setMaxPrice('');
        setCurrentPage(1);
        navigate('/products'); 
    };

    const getDynamicGridProps = () => {
        if (!isNewArrivals) return { xs: 1, md: 2, lg: 3 }; 
        const count = filteredProducts.length;
        if (count === 1) return { xs: 1, md: 1, lg: 1 };
        if (count === 2) return { xs: 1, md: 2, lg: 2 };
        if (count === 4) return { xs: 2, md: 2, lg: 2 };
        if (count >= 5 && count <= 7) return { xs: 2, md: 3, lg: 3 };
        return { xs: 2, md: 3, lg: 4 };
    };

    const gridProps = getDynamicGridProps();

    const getBannerImage = () => {
        if (isNewArrivals) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop'; 
        switch(collectionFilter) {
            case 'Clothing': return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop';
            case 'Shoes': return 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2070&auto=format&fit=crop';
            case 'Accessories': return 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop';
            default: return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop';
        }
    }

    return (
        <div className="products-page animate-fade-in">
            {/* HERO BANNER */}
            <div className="products-hero" style={{ backgroundImage: `url(${getBannerImage()})` }}>
                <div className="products-hero-content">
                    <h1 className="display-3 fw-bold mb-2">
                        {isNewArrivals ? 'JUST LANDED' : (collectionFilter === 'All' ? 'THE COLLECTION' : collectionFilter.toUpperCase())}
                    </h1>
                    <p className="lead mb-0 text-white-50">
                        {isNewArrivals ? 'Fresh finds dropped this week.' : 'Style that knows no boundaries.'}
                    </p>
                </div>
            </div>

            <Container className="pb-5">
                <Row>
                    {/* SIDEBAR FILTERS */}
                    {!isNewArrivals && (
                        <Col md={3} className="mb-4">
                            <div className="filter-sidebar">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="d-flex align-items-center text-primary">
                                        <SlidersHorizontal size={20} className="me-2" />
                                        <h5 className="mb-0 fw-bold">FILTERS</h5>
                                    </div>
                                </div>
                                
                                <div className="filter-group mb-4">
                                    <h6 className="fw-bold mb-3">CATEGORY</h6> 
                                    <div className="d-flex flex-column gap-2">
                                        {sidebarFilters.map(subCat => (
                                            <div 
                                                key={subCat} 
                                                className={`filter-option d-flex justify-content-between align-items-center ${selectedSubCategory === subCat ? 'active fw-bold text-primary' : ''}`}
                                                onClick={() => { setSelectedSubCategory(subCat); setCurrentPage(1); }}
                                                style={{cursor:'pointer'}}
                                            >
                                                <span>{subCat}</span>
                                                {selectedSubCategory === subCat && <ArrowRight size={14}/>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* REFACTORED PRICE FILTER */}
                                <div className="filter-group">
                                    <h6 className="fw-bold mb-3">PRICE RANGE</h6>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <Form.Control 
                                            type="number" 
                                            placeholder="Min" 
                                            value={minPrice} 
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="rounded-pill bg-light border-0"
                                            size="sm"
                                        />
                                        <span className="text-muted">-</span>
                                        <Form.Control 
                                            type="number" 
                                            placeholder="Max" 
                                            value={maxPrice} 
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="rounded-pill bg-light border-0"
                                            size="sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Col>
                    )}

                    {/* MAIN GRID */}
                    <Col md={isNewArrivals ? 12 : 9}>
                        
                        {!isNewArrivals && (
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 sticky-search-bar mb-4 p-3 bg-white rounded-4 shadow-sm border">
                                
                                {/* Search Bar */}
                                <div className="search-wrapper w-100" style={{ maxWidth: '350px' }}>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-0 ps-3 rounded-start-pill">
                                            <Search size={18} className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control 
                                            type="text"
                                            placeholder="Search products..." 
                                            className="search-input border-0 bg-light rounded-end-pill shadow-none"
                                            value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        />
                                    </InputGroup>
                                </div>
                                
                                {/* Right Side: Sort & Pagination */}
                                <div className="d-flex align-items-center gap-3">
                                    
                                    {/* Sort Dropdown */}
                                    <Form.Select 
                                        className="sort-select w-auto rounded-pill border-0 bg-light fw-bold text-secondary" 
                                        value={sortBy} 
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{ minWidth: '160px' }}
                                    >
                                        <option value="featured">Sort: Featured</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="name-asc">Name: A - Z</option>
                                        <option value="name-desc">Name: Z - A</option>
                                    </Form.Select>

                                    {/* TOP PAGINATION CONTROLS */}
                                    {totalPages > 1 && (
                                        <div className="d-flex align-items-center bg-light rounded-pill px-2 py-1 border">
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="p-1 text-dark" 
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft size={16} />
                                            </Button>
                                            
                                            <span className="mx-2 small fw-bold text-muted" style={{ minWidth: '40px', textAlign: 'center' }}>
                                                {currentPage} / {totalPages}
                                            </span>
                                            
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="p-1 text-dark" 
                                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                                                disabled={currentPage === totalPages}
                                            >
                                                <ChevronRight size={16} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isNewArrivals && (
                            <div className="d-flex align-items-center mb-4 text-muted justify-content-center">
                                <Clock size={20} className="me-2 text-primary" />
                                <span className="fw-bold">Showing {filteredProducts.length} newly added items</span>
                            </div>
                        )}

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-5">
                                <h4 className="text-muted">{isNewArrivals ? "No new drops recently." : "No items found."}</h4>
                                {!isNewArrivals && (
                                    <button className="btn btn-link text-primary mt-2" onClick={clearFilters}>Clear filters</button>
                                )}
                            </div>
                        ) : (
                            <>
                                <Row {...gridProps} className="g-4 justify-content-center">
                                    {currentProducts.map((product) => (
                                        <Col key={product.id}>
                                            <ProductCard product={product} />
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Products;