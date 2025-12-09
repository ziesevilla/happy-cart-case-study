import React, { useState, useEffect, useMemo } from 'react';
import { Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Quote, Heart, Package, Truck, ShieldCheck } from 'lucide-react'; 
import { useReviews } from '../context/ReviewContext';
import { useAuth } from '../context/AuthContext'; 
import { useProducts } from '../context/ProductContext'; 
import './styles/Home.css';

// --- STATIC DATA ---
const HERO_SLIDES = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", 
        tagline: "WEAR YOUR CONFIDENCE",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
        tagline: "THE VACATION EDIT",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1529139574466-a302d2052505?q=80&w=2070&auto=format&fit=crop",
        tagline: "EFFORTLESS ELEGANCE",
    }
];

const FEATURED_GRID = [
    { id: 1, title: "NEW ARRIVALS", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1000&auto=format&fit=crop", link: "/products?collection=New" }, 
    { id: 2, title: "SHOES & FOOTWEAR", image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=1000&auto=format&fit=crop", link: "/products?collection=Shoes" },
    { id: 3, title: "ACCESSORIES", image: "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=1000&auto=format&fit=crop", link: "/products?collection=Accessories" },
    { id: 4, title: "CLOTHING ESSENTIALS", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop", link: "/products?collection=Clothing" },
];

const Home = () => {
    const { products, loading } = useProducts(); 
    const { reviews, toggleLike } = useReviews(); 
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [heroIndex, setHeroIndex] = useState(0);

    // --- SUB-CATEGORY EXTRACTION ---
    const subCategoryList = useMemo(() => {
        if (!products || products.length === 0) return [];

        const map = new Map();
        const sortedProducts = [...products].sort((a, b) => b.id - a.id);

        sortedProducts.forEach(product => {
            const subCat = product.sub_category || product.subCategory;
            const mainCat = product.category;
            const image = product.image;

            if (subCat && !map.has(subCat)) {
                map.set(subCat, {
                    name: subCat,
                    mainCategory: mainCat,
                    img: image || "https://via.placeholder.com/300?text=No+Image" 
                });
            }
        });

        return Array.from(map.values());
    }, [products]);

    // --- TOP REVIEWS ---
    const topReviews = reviews
        .filter(r => r.rating === 5) 
        .sort((a, b) => (b.likes || 0) - (a.likes || 0)) 
        .slice(0, 6); 

    useEffect(() => {
        const interval = setInterval(() => setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length), 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLike = (e, reviewId) => {
        e.stopPropagation(); 
        if (!user) {
            alert("Please login to like reviews!");
            return;
        }
        toggleLike(reviewId);
    };

    // --- 💡 MARQUEE LOGIC FIX ---
    // 1. Duplicate the list exactly once to create a seamless loop
    const marqueeList = [...subCategoryList, ...subCategoryList];
    
    // 2. Calculate duration dynamically: e.g., 3 seconds per item
    // This ensures that if you have 50 items, it slows down enough to see them all.
    const animationDuration = `${Math.max(20, marqueeList.length * 2)}s`; 

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="home-page animate-fade-in">
            
            {/* 1. PROMO BAR */}
            <div className="promo-bar d-flex justify-content-center align-items-center w-100 m-0 py-2 bg-light border-bottom">
                <div className="d-flex gap-5 text-muted small fw-bold text-uppercase">
                    <span className="d-flex align-items-center gap-2"><Truck size={16}/> FAST SHIPPING NATIONWIDE</span>
                    <span className="d-flex align-items-center gap-2"><ShieldCheck size={16}/> SECURE PAYMENTS</span>
                    <span className="d-flex align-items-center gap-2"><Package size={16}/> 30-DAY RETURNS</span>
                </div>
            </div>

            {/* 2. HERO */}
            <div className="hero-section d-flex align-items-center justify-content-center text-white w-100 m-0" style={{ backgroundImage: `url(${HERO_SLIDES[heroIndex].image})` }}>
                <div className="hero-overlay">
                    <div className="text-center animate-fade-in" key={heroIndex}>
                        <h1 className="display-1 fw-bold mb-4" style={{ letterSpacing: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{HERO_SLIDES[heroIndex].tagline}</h1>
                        <Button 
                            variant="light" 
                            size="lg" 
                            className="rounded-pill px-5 py-3 fw-bold text-dark shadow" 
                            as={Link} 
                            to="/products?collection=New"
                        >
                            BROWSE COLLECTION
                        </Button>
                    </div>
                </div>
            </div>

            {/* 3. FEATURED GRID */}
            <div className="w-100 m-0 bg-white py-5">
                <div className="text-start pb-4" style={{ paddingLeft: '10%' }}>
                    <h1 className="mb-0 fw-bold">SHOP BY COLLECTION</h1>
                    <p className="text-muted">Discover what is being offered.</p>
                </div>
                
                <div className="position-relative">
                    <div className="featured-grid w-100">
                        {FEATURED_GRID.map((item) => (
                            <div key={item.id} className="grid-item">
                                <img src={item.image} alt={item.title} className="grid-img" />
                                <div className="grid-overlay">
                                    <div className="text-center">
                                        <h3 className="text-white fw-bold mb-3" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{item.title}</h3>
                                        <Button variant="primary" className="grid-btn" as={Link} to={item.link}>VIEW ALL</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. DYNAMIC SUB-CATEGORY MARQUEE */}
            <div className="w-100 m-0 bg-light py-5">
                <div className="text-start pb-4" style={{ paddingLeft: '10%' }}>
                    <h1 className="mb-0 fw-bold">TRENDING CATEGORIES</h1>
                    <p className="text-muted">Explore our most popular styles.</p>
                </div>
                
                {subCategoryList.length > 0 ? (
                    <div className="d-flex align-items-center bg-light overflow-hidden"> {/* Ensure overflow hidden */}
                        <div className="category-marquee-wrapper w-100 m-0">
                            {/* 💡 PASS DYNAMIC DURATION HERE 
                                We map 'animationDuration' to a CSS variable or direct style
                            */}
                            <div className="category-track" style={{ animationDuration: animationDuration }}>
                                {marqueeList.map((cat, idx) => (
                                    <div 
                                        key={idx} 
                                        className="category-card d-flex align-items-center justify-content-center position-relative flex-shrink-0" // prevent shrinking
                                        style={{ 
                                            backgroundImage: `url("${cat.img}")`, 
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            borderRadius: '1rem',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
                                        <div className="text-center position-relative z-2">
                                            <h4 className="text-white fw-bold mb-3 text-uppercase" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>{cat.name}</h4>
                                            
                                            <Button 
                                                size="sm" 
                                                variant="light" 
                                                as={Link} 
                                                to={`/products?collection=${cat.mainCategory || 'All'}&subCategory=${cat.name}`}
                                            >
                                                Shop {cat.name}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-5 text-muted">
                        <p>Loading categories...</p>
                    </div>
                )}
            </div>

            {/* 5. REVIEWS */}
            <div className="w-100 m-0 bg-white py-5">
                <div className="text-start pb-5" style={{ paddingLeft: '10%' }}>
                     <h1 className="fw-bold">STYLE STORIES</h1>
                     <p className="text-muted">Top rated looks from our community.</p>
                </div>
                <Container fluid className="px-0">
                    <Row className="g-4 px-4 mx-0 justify-content-center"> 
                        {topReviews.length > 0 ? topReviews.map((review) => {
                            const isLiked = user && review.likedBy?.includes(user.email);
                            return (
                                <Col md={4} key={review.id}>
                                    <div 
                                        className="review-card h-100 text-center shadow-sm border review-hover position-relative"
                                        onClick={() => navigate(`/products/${review.productId}`)} 
                                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
                                    >
                                        <div className="mb-3 text-warning">{[...Array(5)].map((_, i) => (<Star key={i} fill="currentColor" size={16} />))}</div>
                                        <Quote size={24} className="text-primary mb-3 opacity-25 mx-auto" />
                                        <p className="fst-italic mb-4 text-muted small">"{review.comment}"</p>
                                        
                                        <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold text-secondary" style={{width: '40px', height: '40px'}}>{review.user.charAt(0).toUpperCase()}</div>
                                            <div className="text-start">
                                                <h6 className="mb-0 fw-bold small">{review.user}</h6>
                                                <small className="text-muted" style={{fontSize: '0.7rem'}}>Verified Buyer • {review.productName || 'View Item'}</small>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-center align-items-center border-top pt-3 w-100">
                                            <button 
                                                className={`btn btn-sm rounded-pill d-flex align-items-center gap-1 ${isLiked ? 'text-danger bg-danger-subtle' : 'text-muted hover-pink'}`} 
                                                onClick={(e) => handleLike(e, review.id)} 
                                                style={{border: 'none'}}
                                            >
                                                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                                                <span className="small fw-bold">{review.likes || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </Col>
                            );
                        }) : (
                            <div className="text-center text-muted py-5"><p>No 5-star reviews yet. Be the first!</p></div>
                        )}
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default Home;