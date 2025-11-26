import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Star, Quote, Mail } from 'lucide-react';
import './Home.css'; // Import the specific styles

// --- FASHION DATA ---
const PROMOS = [
    "✨ NEW SEASON: Shop the Spring/Summer '24 Collection",
    "🚚 Free Express Shipping on orders over $100",
    "💖 Student Discount: Get 15% off with valid ID"
];

const HERO_SLIDES = [
    {
        id: 1,
        // Fashion Model / Street Style
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", 
        tagline: "WEAR YOUR CONFIDENCE",
    },
    {
        id: 2,
        // Aesthetic Outfit Layout
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
        tagline: "THE VACATION EDIT",
    },
    {
        id: 3,
        // Group of friends / Lifestyle
        image: "https://images.unsplash.com/photo-1529139574466-a302d2052505?q=80&w=2070&auto=format&fit=crop",
        tagline: "EFFORTLESS ELEGANCE",
    }
];

const FEATURED_GRID = [
    { id: 1, title: "DATE NIGHT LOOKS", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop", link: "/products" },
    { id: 2, title: "OFF-DUTY DENIM", image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=1000&auto=format&fit=crop", link: "/products" },
    { id: 3, title: "ACTIVEWEAR", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1000&auto=format&fit=crop", link: "/products" },
    { id: 4, title: "ACCESSORIES", image: "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=1000&auto=format&fit=crop", link: "/products" },
];

const CATEGORIES = [
    { name: "Dresses", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400" },
    { name: "Tops", img: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=400" },
    { name: "Bottoms", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400" },
    { name: "Outerwear", img: "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=400" },
    { name: "Shoes", img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400" },
    { name: "Bags", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400" },
];

const Home = () => {
    const [promoIndex, setPromoIndex] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);

    // --- LOGIC: Promo Carousel (Every 4 seconds) ---
    useEffect(() => {
        const interval = setInterval(() => {
            setPromoIndex((prev) => (prev + 1) % PROMOS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // --- LOGIC: Hero Slider (Every 5 seconds) ---
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-page animate-fade-in">
            
            {/* SECTION 1: PROMO BAR */}
            <div className="promo-bar d-flex justify-content-center align-items-center w-100 m-0 p-0">
                <div key={promoIndex} className="promo-slide fw-bold">
                    {PROMOS[promoIndex]}
                </div>
            </div>

            {/* SECTION 2: HERO BANNER (Standard height) */}
            <div 
                className="hero-section d-flex align-items-center justify-content-center text-white w-100 m-0"
                style={{ backgroundImage: `url(${HERO_SLIDES[heroIndex].image})` }}
            >
                <div className="hero-overlay">
                    <div className="text-center animate-fade-in" key={heroIndex}>
                        <h1 className="display-1 fw-bold mb-4" style={{ letterSpacing: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                            {HERO_SLIDES[heroIndex].tagline}
                        </h1>
                        <Button 
                            variant="light" 
                            size="lg" 
                            className="rounded-pill px-5 py-3 fw-bold text-dark shadow"
                            as={Link} 
                            to="/products"
                        >
                            SHOP COLLECTION
                        </Button>
                    </div>
                </div>
            </div>

            {/* SECTION 3: FEATURES (Normal Flow) */}
            <div className="w-100 m-0 bg-white py-5">
                <div className="text-start pb-4" style={{ paddingLeft: '10%' }}>
                    <h1 className="mb-0 fw-bold">TRENDING NOW</h1>
                </div>
                
                <div className="position-relative">
                    <div className="featured-grid w-100">
                        {FEATURED_GRID.map((item) => (
                            <div key={item.id} className="grid-item">
                                <img src={item.image} alt={item.title} className="grid-img" />
                                <div className="grid-overlay">
                                    <div className="text-center">
                                        <h3 className="text-white fw-bold mb-3" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{item.title}</h3>
                                        <Button 
                                            variant="primary" 
                                            className="grid-btn"
                                            as={Link}
                                            to={item.link}
                                        >
                                            SHOP LOOK
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION 4: CATEGORIES (Normal Flow) */}
            <div className="w-100 m-0 bg-white py-5">
                <div className="text-start pb-4" style={{ paddingLeft: '10%' }}>
                    <h1 className="mb-0 fw-bold">SHOP BY CATEGORY</h1>
                </div>
                <div className="d-flex align-items-center bg-white">
                    <div className="category-marquee-wrapper w-100 m-0">
                        <div className="category-track">
                            {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((cat, idx) => (
                                <div 
                                    key={idx} 
                                    className="category-card d-flex align-items-center justify-content-center position-relative"
                                    style={{ '--cat-img': `url(${cat.img})` }}
                                >
                                    <div className="text-center position-relative z-2">
                                        <h4 className="text-white fw-bold mb-3">{cat.name}</h4>
                                        <Button size="sm" variant="light" as={Link} to="/products">View All</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 5: CUSTOMER REVIEWS (Normal Flow) */}
            <div className="w-100 m-0 bg-white py-5">
                <div className="text-start pb-5" style={{ paddingLeft: '10%' }}>
                     <h1 className="fw-bold">STYLE STORIES</h1>
                     <p className="text-muted lead">Real style from real customers.</p>
                </div>
                <Container fluid className="px-0">
                    <Row className="g-4 px-4 mx-0 justify-content-center"> 
                        {[1, 2, 3, 4, 5, 6].map((review, idx) => (
                            <Col md={4} key={idx}>
                                <div className="review-card h-100 text-center shadow-sm border">
                                    <div className="mb-3 text-warning">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} fill="currentColor" size={16} />
                                        ))}
                                    </div>
                                    <Quote size={24} className="text-primary mb-3 opacity-25 mx-auto" />
                                    <p className="fst-italic mb-4 text-muted small">
                                        "The fit is absolutely perfect! I wore this to a wedding and got so many compliments. Definitely buying in another color."
                                    </p>
                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold text-secondary" style={{width: '40px', height: '40px'}}>
                                            {['JD', 'AS', 'MK', 'LR', 'PT', 'BW'][idx]}
                                        </div>
                                        <div className="text-start">
                                            <h6 className="mb-0 fw-bold small">
                                                {['Jane Doe', 'Ashley S.', 'Mila K.', 'Lily R.', 'Priya T.', 'Bella W.'][idx]}
                                            </h6>
                                            <small className="text-muted" style={{fontSize: '0.7rem'}}>Verified Buyer</small>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>

            {/* SECTION 6: JOIN THE CLUB (Normal Flow) */}
            <div className="w-100 m-0 bg-white py-5">
                <div className="text-start pb-5" style={{ paddingLeft: '10%' }}>
                     <h1 className="fw-bold">JOIN THE CLUB</h1>
                     <p className="text-muted lead">Get 10% off your first order & exclusive access.</p>
                </div>
                <div className="d-flex align-items-center justify-content-center pb-5">
                    <Container style={{ maxWidth: '600px' }}>
                        <div className="text-center bg-white p-5 rounded-4 shadow-sm">
                            <Mail size={48} className="text-primary mb-4" />
                            <h2 className="fw-bold mb-3">Stay in Style</h2>
                            <p className="text-muted mb-4">
                                Be the first to know about new drops, flash sales, and style inspiration.
                            </p>
                            <Form>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Control type="email" placeholder="Enter your email" size="lg" className="text-center rounded-pill" />
                                </Form.Group>
                                <Button variant="primary" type="submit" size="lg" className="w-100 rounded-pill">
                                    SUBSCRIBE
                                </Button>
                            </Form>
                            <small className="text-muted mt-3 d-block">We respect your privacy. Unsubscribe at any time.</small>
                        </div>
                    </Container>
                </div>
            </div>

        </div>
    );
};

export default Home;