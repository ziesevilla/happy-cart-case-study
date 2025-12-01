import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Pagination } from 'react-bootstrap';
import { Search, SlidersHorizontal, X, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext'; 
import './Products.css';

const Products = () => {
    const { products: ALL_PRODUCTS } = useProducts(); 
    
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const collectionFilter = queryParams.get('collection') || 'All'; 
    const isNewArrivals = collectionFilter === 'New'; 

    // --- STATES ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState(5000);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; 

    useEffect(() => {
        setSelectedSubCategory('All');
        setCurrentPage(1); 
    }, [collectionFilter]);

    // --- 7 DAY HELPER ---
    const isWithin7Days = (dateString) => {
        if (!dateString) return false;
        const productDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - productDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    const getCategoriesInCollection = (collection) => {
        switch(collection) {
            case 'Clothing': return ['Clothing']; 
            case 'Shoes': return ['Shoes'];
            case 'Accessories': return ['Accessories'];
            default: return [];
        }
    };

    const targetCategories = getCategoriesInCollection(collectionFilter);

    const uniqueSubCategories = [...new Set(
        collectionFilter === 'All' 
            ? ALL_PRODUCTS.map(p => p.subCategory).filter(Boolean)
            : ALL_PRODUCTS
                .filter(p => targetCategories.includes(p.category))
                .map(p => p.subCategory)
                .filter(Boolean)
    )].sort();

    const sidebarFilters = ['All', ...uniqueSubCategories];

    // --- FILTER LOGIC ---
    const filteredProducts = ALL_PRODUCTS.filter(product => {
        if (isNewArrivals) {
            return isWithin7Days(product.dateAdded);
        }

        let matchesCollection = true;
        if (collectionFilter !== 'All') {
            matchesCollection = targetCategories.includes(product.category);
        }

        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubCategory = selectedSubCategory === 'All' || product.subCategory === selectedSubCategory;
        const matchesPrice = product.price <= priceRange;

        return matchesCollection && matchesSearch && matchesSubCategory && matchesPrice;
    }).sort((a, b) => {
        if (isNewArrivals) {
            return new Date(b.dateAdded) - new Date(a.dateAdded);
        }
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return 0; 
    });

    // --- PAGINATION LOGIC ---
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
        setPriceRange(5000);
        setCurrentPage(1);
        navigate('/products'); 
    };

    // --- 💡 DYNAMIC GRID LOGIC ---
    // Returns the number of columns per row (e.g., lg={3} means 3 items per row)
    const getDynamicGridProps = () => {
        if (!isNewArrivals) return { xs: 1, md: 2, lg: 3 }; 

        const count = filteredProducts.length;

        // 1 item: Centered single
        if (count === 1) return { xs: 1, md: 1, lg: 1 };
        
        // 2 items: Side by side
        if (count === 2) return { xs: 1, md: 2, lg: 2 };
        
        // 4 items: 2x2 Grid
        if (count === 4) return { xs: 2, md: 2, lg: 2 };

        // 5, 6, 7 items: 3 columns 
        // (5 = 3 top, 2 bottom centered)
        // (6 = 3 top, 3 bottom)
        // (7 = 3 top, 3 mid, 1 bottom centered)
        if (count >= 5 && count <= 7) return { xs: 2, md: 3, lg: 3 };

        // 8 items: 4x2 Grid (4 columns)
        if (count === 8) return { xs: 2, md: 4, lg: 4 };

        // 9+ items: Standard 4 columns
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
            <div 
                className="products-hero" 
                style={{ backgroundImage: `url(${getBannerImage()})` }}
            >
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
                                    <h5>TYPE</h5> 
                                    <div className="d-flex flex-column gap-2">
                                        {sidebarFilters.map(subCat => (
                                            <span 
                                                key={subCat} 
                                                className={`filter-option ${selectedSubCategory === subCat ? 'active' : ''}`}
                                                onClick={() => { setSelectedSubCategory(subCat); setCurrentPage(1); }}
                                            >
                                                {subCat}
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
                                        max={10000} 
                                        step={100}
                                        value={priceRange}
                                        onChange={(e) => { setPriceRange(Number(e.target.value)); setCurrentPage(1); }}
                                    />
                                    <div className="d-flex justify-content-between small text-muted mt-2">
                                        <span>₱0</span>
                                        <span>₱10,000+</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    )}

                    <Col md={isNewArrivals ? 12 : 9}>
                        
                        {!isNewArrivals && (
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 sticky-search-bar mb-4">
                                <div className="search-wrapper w-100" style={{ maxWidth: '400px' }}>
                                    <Search className="search-icon" size={18} />
                                    <Form.Control 
                                        type="text"
                                        placeholder="Search for items..." 
                                        className="search-input rounded-pill"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                        )}

                        {isNewArrivals && (
                            <div className="d-flex align-items-center mb-4 text-muted justify-content-center">
                                <Clock size={20} className="me-2 text-primary" />
                                <span className="fw-bold">Showing {filteredProducts.length} newly added items</span>
                            </div>
                        )}

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-5">
                                <h4 className="text-muted">
                                    {isNewArrivals ? "No new drops this week." : "No items found."}
                                </h4>
                                {!isNewArrivals && (
                                    <>
                                        <p className="text-muted small">Try adjusting your filters or search criteria.</p>
                                        <button className="btn btn-link text-primary mt-2" onClick={clearFilters}>
                                            Clear all filters
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* 💡 1. SPREAD GRID PROPS: Applies cols like { xs:2, lg:3 }
                                    💡 2. JUSTIFY-CONTENT-CENTER: This is the magic class.
                                          If there are 7 items in a 3-col grid, the last row has 1 item.
                                          This class pushes that 1 item to the middle.
                                */}
                                <Row {...gridProps} className="g-4 justify-content-center">
                                    {currentProducts.map((product) => (
                                        <Col key={product.id}>
                                            <ProductCard product={product} />
                                        </Col>
                                    ))}
                                </Row>

                                {!isNewArrivals && totalPages > 1 && (
                                    <div className="d-flex justify-content-center mt-5">
                                        <Pagination>
                                            <Pagination.Prev 
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                                                disabled={currentPage === 1} 
                                            />
                                            {[...Array(totalPages)].map((_, idx) => (
                                                <Pagination.Item 
                                                    key={idx + 1} 
                                                    active={idx + 1 === currentPage} 
                                                    onClick={() => handlePageChange(idx + 1)}
                                                >
                                                    {idx + 1}
                                                </Pagination.Item>
                                            ))}
                                            <Pagination.Next 
                                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                                                disabled={currentPage === totalPages} 
                                            />
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Products;