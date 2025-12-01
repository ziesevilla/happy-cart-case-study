import React, { useState, useEffect, useMemo } from 'react';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Quote, Mail, Heart } from 'lucide-react';
import { useReviews } from '../context/ReviewContext';
import { useAuth } from '../context/AuthContext'; 
import { useProducts } from '../context/ProductContext'; 
import './styles/Home.css';

// ... (Keep PROMOS, HERO_SLIDES, FEATURED_GRID consts as they are) ...
const PROMOS = [
    "✨ NEW SEASON: Shop the Spring/Summer '24 Collection",
    "🚚 Free Express Shipping on orders over $100",
    "💖 Student Discount: Get 15% off with valid ID"
];

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
    { id: 1, title: "DATE NIGHT LOOKS", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop", link: "/products?collection=Clothing" },
    { id: 2, title: "OFF-DUTY DENIM", image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=1000&auto=format&fit=crop", link: "/products?collection=Clothing" },
    { id: 3, title: "ACTIVEWEAR", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1000&auto=format&fit=crop", link: "/products?collection=Clothing" },
    { id: 4, title: "ACCESSORIES", image: "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=1000&auto=format&fit=crop", link: "/products?collection=Accessories" },
];

const Home = () => {
    const { products } = useProducts(); 
    const { reviews, toggleLike } = useReviews(); 
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [promoIndex, setPromoIndex] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);

    // --- 💡 MODIFIED: EXTRACT SUB-CATS WITH MAIN CATEGORY ---
    const dynamicCategories = useMemo(() => {
        const subCatMap = new Map();

        products.forEach(product => {
            if (product.subCategory && !subCatMap.has(product.subCategory)) {
                subCatMap.set(product.subCategory, {
                    name: product.subCategory,
                    mainCategory: product.category, // 💡 Capture the Main Category
                    img: product.image 
                });
            }
        });

        return Array.from(subCatMap.values());
    }, [products]);

    const topReviews = reviews
        .filter(r => r.rating === 5) 
        .sort((a, b) => (b.likes || 0) - (a.likes || 0)) 
        .slice(0, 6); 

    useEffect(() => {
        const interval = setInterval(() => setPromoIndex((prev) => (prev + 1) % PROMOS.length), 4000);
        return () => clearInterval(interval);
    }, []);

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

    const marqueeList = dynamicCategories.length > 0 
        ? [...dynamicCategories, ...dynamicCategories, ...dynamicCategories, ...dynamicCategories]
        : [];

    return (
        <div className="home-page animate-fade-in">
            <div className="promo-bar d-flex justify-content-center align-items-center w-100 m-0 p-0">
                <div key={promoIndex} className="promo-slide fw-bold">{PROMOS[promoIndex]}</div>
            </div>

            <div className="hero-section d-flex align-items-center justify-content-center text-white w-100 m-0" style={{ backgroundImage: `url(${HERO_SLIDES[heroIndex].image})` }}>
                <div className="hero-overlay">
                    <div className="text-center animate-fade-in" key={heroIndex}>
                        <h1 className="display-1 fw-bold mb-4" style={{ letterSpacing: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{HERO_SLIDES[heroIndex].tagline}</h1>
                        <Button variant="light" size="lg" className="rounded-pill px-5 py-3 fw-bold text-dark shadow" as={Link} to="/products">SHOP COLLECTION</Button>
                    </div>
                </div>
            </div>

            <div className="w-100 m-0 bg-white py-5">
                <div className="text-start pb-4" style={{ paddingLeft: '10%' }}><h1 className="mb-0 fw-bold">TRENDING NOW</h1></div>
                <div className="position-relative">
                    <div className="featured-grid w-100">
                        {FEATURED_GRID.map((item) => (
                            <div key={item.id} className="grid-item">
                                <img src={item.image} alt={item.title} className="grid-img" />
                                <div className="grid-overlay">
                                    <div className="text-center">
                                        <h3 className="text-white fw-bold mb-3" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{item.title}</h3>
                                        <Button variant="primary" className="grid-btn" as={Link} to={item.link}>SHOP LOOK</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION 4: DYNAMIC CATEGORIES */}
            {marqueeList.length > 0 && (
                <div className="w-100 m-0 bg-white py-5">
                    <div className="text-start pb-4" style={{ paddingLeft: '10%' }}><h1 className="mb-0 fw-bold">SHOP BY CATEGORY</h1></div>
                    <div className="d-flex align-items-center bg-white">
                        <div className="category-marquee-wrapper w-100 m-0">
                            <div className="category-track">
                                {marqueeList.map((cat, idx) => (
                                    <div 
                                        key={idx} 
                                        className="category-card d-flex align-items-center justify-content-center position-relative" 
                                        style={{ '--cat-img': `url(${cat.img})` }}
                                    >
                                        <div className="text-center position-relative z-2">
                                            <h4 className="text-white fw-bold mb-3 text-uppercase">{cat.name}</h4>
                                            
                                            {/* 💡 UPDATED LINK: PASS MAIN COLLECTION + SUB-CATEGORY */}
                                            <Button 
                                                size="sm" 
                                                variant="light" 
                                                as={Link} 
                                                to={`/products?collection=${cat.mainCategory}&subCategory=${cat.name}`}
                                            >
                                                View All
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ... (Rest of the components: Reviews, Join Club) ... */}
            {/* The rest of the file remains exactly as you had it */}
            <div className="w-100 m-0 bg-white py-5">
                <div className="text-start pb-5" style={{ paddingLeft: '10%' }}>
                     <h1 className="fw-bold">STYLE STORIES</h1>
                     <p className="text-muted lead">Top rated looks from our community.</p>
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
                                            <div className="text-start"><h6 className="mb-0 fw-bold small">{review.user}</h6><small className="text-muted" style={{fontSize: '0.7rem'}}>Verified Buyer • {review.productName || 'View Item'}</small></div>
                                        </div>
                                        <div className="d-flex justify-content-center align-items-center border-top pt-3 w-100">
                                            <button className={`btn btn-sm rounded-pill d-flex align-items-center gap-1 ${isLiked ? 'text-danger bg-danger-subtle' : 'text-muted hover-pink'}`} onClick={(e) => handleLike(e, review.id)} style={{border: 'none'}}><Heart size={16} fill={isLiked ? "currentColor" : "none"} /><span className="small fw-bold">{review.likes || 0}</span></button>
                                        </div>
                                    </div>
                                </Col>
                            );
                        }) : (<div className="text-center text-muted py-5"><p>No 5-star reviews yet. Be the first!</p></div>)}
                    </Row>
                </Container>
            </div>

            <div className="w-100 m-0 bg-white py-5">
                <div className="text-start pb-5" style={{ paddingLeft: '10%' }}><h1 className="fw-bold">JOIN THE CLUB</h1><p className="text-muted lead">Get 10% off your first order & exclusive access.</p></div>
                <div className="d-flex align-items-center justify-content-center pb-5">
                    <Container style={{ maxWidth: '600px' }}>
                        <div className="text-center bg-white p-5 rounded-4 shadow-sm">
                            <Mail size={48} className="text-primary mb-4" /><h2 className="fw-bold mb-3">Stay in Style</h2><p className="text-muted mb-4">Be the first to know about new drops, flash sales, and style inspiration.</p>
                            <Form><Form.Group className="mb-3" controlId="formBasicEmail"><Form.Control type="email" placeholder="Enter your email" size="lg" className="text-center rounded-pill" /></Form.Group><Button variant="primary" type="submit" size="lg" className="w-100 rounded-pill">SUBSCRIBE</Button></Form>
                            <small className="text-muted mt-3 d-block">We respect your privacy. Unsubscribe at any time.</small>
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default Home;