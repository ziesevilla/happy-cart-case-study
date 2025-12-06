import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Pagination, Spinner } from 'react-bootstrap';
import { Search, SlidersHorizontal, X, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext'; // 💡 Use Context
import './styles/Products.css';

/**
 * Products Component
 * * The central catalog page handling product listings.
 * * Features: Advanced Filtering (Category, Price, Sub-category), 
 * * Sorting, Search, and Pagination.
 */
const Products = () => {
    // 💡 1. Get products and loading state from Context
    // We use the global context to ensure we have the latest data across the app
    const { products: ALL_PRODUCTS, loading } = useProducts(); 
    
    // --- ROUTING HOOKS ---
    const location = useLocation();
    const navigate = useNavigate();
    
    // Parse query parameters to determine current collection (e.g., ?collection=Shoes)
    const queryParams = new URLSearchParams(location.search);
    const collectionFilter = queryParams.get('collection') || 'All'; 
    const isNewArrivals = collectionFilter === 'New'; 

    // --- LOCAL STATE MANAGEMENT ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState(10000);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; 

    // Reset filters and page number when the main collection changes (e.g. Navigating from Men -> Women)
    useEffect(() => {
        setSelectedSubCategory('All');
        setCurrentPage(1); 
    }, [collectionFilter]);

    // 💡 2. Show Loading Spinner
    // Prevents rendering empty grids while data fetches from API
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    // --- HELPER FUNCTIONS ---

    // Utility: Determines if a product counts as a "New Arrival" (added within 7 days)
    const isWithin7Days = (dateString) => {
        if (!dateString) return false;
        const productDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - productDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    // Maps the URL 'collection' param to specific database Category names
    const getCategoriesInCollection = (collection) => {
        switch(collection) {
            case 'Clothing': return ['Clothing']; 
            case 'Shoes': return ['Shoes'];
            case 'Accessories': return ['Accessories'];
            default: return [];
        }
    };

    const targetCategories = getCategoriesInCollection(collectionFilter);

    // 💡 3. Map unique sub-categories (Handle 'sub_category' from DB vs 'subCategory')
    // Dynamically generates the sidebar filter options based on the currently displayed collection
    const uniqueSubCategories = [...new Set(
        collectionFilter === 'All' 
            ? ALL_PRODUCTS.map(p => p.sub_category || p.subCategory).filter(Boolean)
            : ALL_PRODUCTS
                .filter(p => targetCategories.includes(p.category))
                .map(p => p.sub_category || p.subCategory)
                .filter(Boolean)
    )].sort();

    const sidebarFilters = ['All', ...uniqueSubCategories];

    // --- CORE FILTERING LOGIC ---
    
    // Step 1: Filter the master list based on all active criteria
    const filteredProducts = ALL_PRODUCTS.filter(product => {
        // Handle "New Arrivals" (based on dateAdded from DB)
        if (isNewArrivals) {
            return isWithin7Days(product.dateAdded || product.created_at);
        }

        // Filter by Main Category (e.g., Shoes)
        let matchesCollection = true;
        if (collectionFilter !== 'All') {
            matchesCollection = targetCategories.includes(product.category);
        }

        // Filter by Search Input
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Handle sub-category mapping (normalize keys)
        const productSub = product.sub_category || product.subCategory;
        const matchesSubCategory = selectedSubCategory === 'All' || productSub === selectedSubCategory;
        
        // Handle Price (Ensure number)
        const productPrice = parseFloat(product.price);
        const matchesPrice = productPrice <= priceRange;

        return matchesCollection && matchesSearch && matchesSubCategory && matchesPrice;
    }).sort((a, b) => {
        // Step 2: Sort the filtered results
        if (isNewArrivals) {
            return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        }
        
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);

        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        return 0; // Default 'featured' order
    });

    // --- PAGINATION LOGIC ---
    // Slices the filtered and sorted array to display only the current page's items
    const currentProducts = isNewArrivals 
        ? filteredProducts // Show all new arrivals without pagination
        : filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    // Resets all local state filters to defaults
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSubCategory('All');
        setPriceRange(10000);
        setCurrentPage(1);
        navigate('/products'); 
    };

    // --- DYNAMIC GRID LAYOUT ---
    // Adjusts column width based on the number of items found to prevent huge cards when few results exist
    const getDynamicGridProps = () => {
        if (!isNewArrivals) return { xs: 1, md: 2, lg: 3 }; 

        const count = filteredProducts.length;
        if (count === 1) return { xs: 1, md: 1, lg: 1 };
        if (count === 2) return { xs: 1, md: 2, lg: 2 };
        if (count === 4) return { xs: 2, md: 2, lg: 2 };
        if (count >= 5 && count <= 7) return { xs: 2, md: 3, lg: 3 };
        if (count === 8) return { xs: 2, md: 4, lg: 4 };
        return { xs: 2, md: 3, lg: 4 };
    };

    const gridProps = getDynamicGridProps();

    // Selects the Hero Banner image based on the active collection
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
            {/* --- HERO SECTION --- */}
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
                    {/* --- SIDEBAR FILTERS (Hidden on 'New Arrivals') --- */}
                    {!isNewArrivals && (
                        <Col md={3} className="mb-4">
                            <div className="filter-sidebar">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="d-flex align-items-center text-primary">
                                        <SlidersHorizontal size={20} className="me-2" />
                                        <h5 className="mb-0 fw-bold">FILTERS</h5>
                                    </div>
                                </div>
                                
                                {/* Sub-Category Filter */}
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

                                {/* Price Range Filter */}
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

                    {/* --- MAIN PRODUCT GRID AREA --- */}
                    <Col md={isNewArrivals ? 12 : 9}>
                        
                        {/* Top Control Bar (Search & Sort) - Hidden on New Arrivals */}
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

                        {/* New Arrivals Info Banner */}
                        {isNewArrivals && (
                            <div className="d-flex align-items-center mb-4 text-muted justify-content-center">
                                <Clock size={20} className="me-2 text-primary" />
                                <span className="fw-bold">Showing {filteredProducts.length} newly added items</span>
                            </div>
                        )}

                        {/* Empty State vs Product Grid */}
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
                                <Row {...gridProps} className="g-4 justify-content-center">
                                    {currentProducts.map((product) => (
                                        <Col key={product.id}>
                                            {/* 💡 Pass product to card */}
                                            <ProductCard product={product} />
                                        </Col>
                                    ))}
                                </Row>

                                {/* Pagination Controls */}
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