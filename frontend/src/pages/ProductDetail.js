import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import { ArrowLeft, Star, ShoppingBag, CreditCard, Check, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewContext';
import { useProducts } from '../context/ProductContext'; // 💡 NEW IMPORT
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // 💡 USE CONTEXT FOR DATA
    const { products: ALL_PRODUCTS } = useProducts(); 
    
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { getProductReviews, getAverageRating, toggleLike } = useReviews();

    const [isAdded, setIsAdded] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const productId = parseInt(id);
    const product = ALL_PRODUCTS.find(p => p.id === productId);

    // If data isn't loaded yet or ID is wrong
    if (!product) {
        return (
            <Container className="py-5 text-center" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>
                    <h2>Product not found</h2>
                    <Button variant="primary" onClick={() => navigate('/products')}>Return to Shop</Button>
                </div>
            </Container>
        );
    }

    const productReviews = getProductReviews(productId);
    const averageRating = getAverageRating(productId);

    // Filter related products from the Context data
    const relatedProducts = ALL_PRODUCTS
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 3);

    const handleAddToCart = () => {
        if (!user) {
            alert("You must be logged in to add items to the cart!");
            navigate('/login');
            return;
        }
        addToCart(product);
        setIsAdded(true);
        setShowToast(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (!user) {
            alert("You must be logged in to purchase!");
            navigate('/login');
            return;
        }
        setIsBuying(true);
        const itemToCheckout = { ...product, quantity: 1 };
        setTimeout(() => {
            setIsBuying(false);
            navigate('/checkout', { state: { checkoutItems: [itemToCheckout] } });
        }, 800);
    };

    const handleLikeReview = (reviewId) => {
        if (!user) {
            alert("Please login to like reviews!");
            return;
        }
        toggleLike(reviewId);
    };

    return (
        <div className="product-detail-page animate-fade-in bg-white min-vh-100 py-5">
            <Container>
                <Button variant="link" className="text-muted mb-4 text-decoration-none p-0 d-flex align-items-center" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} className="me-2" /> Back to Collection
                </Button>

                <Row className="g-5 mb-5">
                    {/* PRODUCT IMAGE */}
                    <Col md={6}>
                        <div className="position-relative rounded-4 overflow-hidden shadow-sm product-image-container">
                            <img src={product.image} alt={product.name} className="product-detail-img" />
                            <span className="position-absolute top-0 start-0 m-4 px-4 py-2 fw-bold rounded-pill shadow-sm small" style={{ backgroundColor: '#ffffff', color: '#ff6b8b', letterSpacing: '1px', textTransform: 'uppercase', zIndex: 2 }}>
                                {product.category}
                            </span>
                        </div>
                    </Col>

                    {/* PRODUCT DETAILS */}
                    <Col md={6}>
                        <div className="h-100 d-flex flex-column justify-content-center">
                            <h1 className="display-4 fw-bold mb-3">{product.name}</h1>
                            <div className="d-flex align-items-center mb-4">
                                <h3 className="text-primary fw-bold mb-0 me-4">₱{product.price.toLocaleString()}</h3>
                                <div className="d-flex align-items-center text-warning">
                                    <Star size={18} fill="currentColor" className="me-1"/>
                                    <span className="fw-bold me-1">{averageRating || '0.0'}</span>
                                    <span className="text-muted ms-1 small">({productReviews.length} reviews)</span>
                                </div>
                            </div>
                            <p className="lead text-muted mb-5">{product.description}</p>
                            
                            <div className="d-grid gap-3">
                                <Button variant={isAdded ? "success" : "primary"} size="lg" className={`rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center transition-all ${isAdded ? 'text-white border-success' : ''}`} onClick={handleAddToCart} disabled={isAdded || isBuying}>
                                    {isAdded ? <><Check size={20} className="me-2" /> ADDED TO BAG</> : <><ShoppingBag size={20} className="me-2" /> ADD TO BAG</>}
                                </Button>
                                <Button variant="outline-primary" size="lg" className="rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center" onClick={handleBuyNow} disabled={isBuying || isAdded}>
                                    {isBuying ? <><Spinner animation="border" size="sm" className="me-2"/> PROCESSING...</> : <><CreditCard size={20} className="me-2" /> BUY NOW</>}
                                </Button>
                            </div>

                            <div className="mt-5 pt-4 border-top">
                                <small className="text-muted d-block mb-2"><strong>Free Shipping</strong> on orders over ₱5,000</small>
                                <small className="text-muted d-block"><strong>30 Day Returns</strong> if you change your mind</small>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* REVIEWS SECTION */}
                <div className="mt-5 pt-5 border-top">
                    <h3 className="fw-bold mb-4">CUSTOMER REVIEWS ({productReviews.length})</h3>
                    
                    {productReviews.length > 0 ? (
                        <Row>
                            {productReviews.map(review => {
                                const isLiked = user && review.likedBy?.includes(user.email);
                                return (
                                    <Col md={6} key={review.id} className="mb-4">
                                        <div className="p-4 rounded-4 bg-light h-100 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{width: '40px', height: '40px'}}>{review.user.charAt(0).toUpperCase()}</div>
                                                        <div><h6 className="mb-0 fw-bold">{review.user}</h6><small className="text-muted">{review.date}</small></div>
                                                    </div>
                                                    <div className="d-flex text-warning">{[...Array(5)].map((_, i) => (<Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} color={i < review.rating ? "#f59e0b" : "#cbd5e1"} />))}</div>
                                                </div>
                                                <p className="text-muted mb-3">"{review.comment}"</p>
                                            </div>
                                            
                                            <div className="d-flex align-items-center mt-2">
                                                <button 
                                                    className={`btn btn-sm rounded-pill d-flex align-items-center gap-1 ps-0 ${isLiked ? 'text-danger' : 'text-muted'}`}
                                                    onClick={() => handleLikeReview(review.id)}
                                                    style={{border: 'none', background: 'transparent'}}
                                                >
                                                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                                                    <span className="small fw-bold">{review.likes || 0} Helpful</span>
                                                </button>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    ) : (
                        <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                    )}
                </div>

                {/* RELATED PRODUCTS */}
                {relatedProducts.length > 0 && (
                    <div className="mt-5 pt-5 border-top">
                        <h3 className="fw-bold mb-4">YOU MIGHT ALSO LIKE</h3>
                        <Row xs={1} md={3} className="g-4">
                            {relatedProducts.map((item) => <Col key={item.id}><ProductCard product={item} /></Col>)}
                        </Row>
                    </div>
                )}

                <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{zIndex: 9999}}>
                    <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="dark">
                        <Toast.Header closeButton={false} className="d-flex justify-content-between bg-dark text-white border-0">
                            <strong className="me-auto d-flex align-items-center"><ShoppingBag size={16} className="me-2"/> Added to Bag</strong>
                            <small className="text-white-50">just now</small>
                            <button type="button" className="btn-close btn-close-white ms-2" onClick={() => setShowToast(false)}></button>
                        </Toast.Header>
                        <Toast.Body className="text-white">{product.name} is now in your cart.</Toast.Body>
                    </Toast>
                </ToastContainer>
            </Container>
        </div>
    );
};

export default ProductDetail;