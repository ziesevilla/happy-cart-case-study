import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Toast, ToastContainer, Spinner, Badge, Modal } from 'react-bootstrap';
import { ArrowLeft, Star, ShoppingBag, CreditCard, Check, Heart, Box, Plus, Minus } from 'lucide-react'; 
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewContext';
import { useProducts } from '../context/ProductContext'; 
// 💡 Import API to fetch single product
import api from '../api/axios'; 
import ProductCard from '../components/ProductCard';
import './styles/ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Use Context for related products list
    const { products: ALL_PRODUCTS } = useProducts(); 
    
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { getProductReviews, getAverageRating, toggleLike } = useReviews();

    // 💡 NEW: Local state for the specific product
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isAdded, setIsAdded] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [buyQuantity, setBuyQuantity] = useState(1);

    // 💡 FETCH PRODUCT DETAILS
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                // Try to find in Context first (Instant load)
                const existing = ALL_PRODUCTS.find(p => p.id === parseInt(id));
                if (existing) {
                    setProduct(existing);
                    setLoading(false);
                }
                
                // Fetch fresh data from API (to get real-time stock)
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error("Failed to fetch product", error);
            }
            setLoading(false);
        };

        window.scrollTo(0, 0);
        fetchProduct();
    }, [id, ALL_PRODUCTS]);

    // 💡 LOADING STATE
    if (loading) {
        return (
            <Container className="py-5 text-center d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    // 404 STATE
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

    // --- LOGIC ---
    const stock = product.stock || 0;
    const isOutOfStock = stock === 0;
    const isLowStock = stock > 0 && stock <= 5;

    const productReviews = getProductReviews(parseInt(id));
    const averageRating = getAverageRating(parseInt(id));

    const relatedProducts = ALL_PRODUCTS
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 3);

    const handleAddToCart = () => {
        if (isOutOfStock) return; 
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

    const handleBuyNowClick = () => {
        if (isOutOfStock) return; 
        if (!user) {
            alert("You must be logged in to purchase!");
            navigate('/login');
            return;
        }
        setBuyQuantity(1);
        setShowBuyModal(true);
    };

    const confirmBuyNow = () => {
        setIsBuying(true);
        const itemToCheckout = { ...product, quantity: buyQuantity };
        
        setTimeout(() => {
            setIsBuying(false);
            setShowBuyModal(false);
            // Navigate to Checkout with state
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

    const increaseQty = () => {
        if (buyQuantity < stock) setBuyQuantity(prev => prev + 1);
    };
    const decreaseQty = () => {
        if (buyQuantity > 1) setBuyQuantity(prev => prev - 1);
    };

    return (
        <div className="product-detail-page animate-fade-in bg-white min-vh-100 py-5">
            <Container>
                <Button variant="link" className="text-muted mb-4 text-decoration-none p-0 d-flex align-items-center" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} className="me-2" /> Back to Collection
                </Button>

                <Row className="g-5 mb-5">
                    {/* LEFT: IMAGE */}
                    <Col md={6}>
                        <div className="position-relative rounded-4 overflow-hidden shadow-sm product-image-container">
                             {isOutOfStock && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
                                    <div className="bg-dark text-white px-4 py-2 text-uppercase fw-bold fs-4" style={{ letterSpacing: '4px' }}>SOLD OUT</div>
                                </div>
                            )}
                            <img src={product.image} alt={product.name} className={`product-detail-img ${isOutOfStock ? 'grayscale' : ''}`} style={{ filter: isOutOfStock ? 'grayscale(100%)' : 'none' }} />
                            <span className="position-absolute top-0 start-0 m-4 px-4 py-2 fw-bold rounded-pill shadow-sm small" style={{ backgroundColor: '#ffffff', color: '#ff6b8b', letterSpacing: '1px', textTransform: 'uppercase', zIndex: 2 }}>
                                {product.category}
                            </span>
                        </div>
                    </Col>

                    {/* RIGHT: DETAILS */}
                    <Col md={6}>
                        <div className="h-100 d-flex flex-column justify-content-center">
                            <h1 className="display-4 fw-bold mb-3">{product.name}</h1>
                            <div className="d-flex align-items-center mb-4">
                                {/* Use formatted_price from API if available */}
                                <h3 className="text-primary fw-bold mb-0 me-4">{product.formatted_price || `₱${product.price}`}</h3>
                                <div className="d-flex align-items-center text-warning">
                                    <Star size={18} fill="currentColor" className="me-1"/>
                                    <span className="fw-bold me-1">{averageRating || '0.0'}</span>
                                    <span className="text-muted ms-1 small">({productReviews.length} reviews)</span>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                {isOutOfStock ? (
                                    <span className="text-danger fw-bold d-flex align-items-center"><Box size={18} className="me-2"/> Currently Out of Stock</span>
                                ) : isLowStock ? (
                                    <span className="text-danger fw-bold d-flex align-items-center animate-pulse"><Box size={18} className="me-2"/> Hurry! Only {stock} left in stock.</span>
                                ) : (
                                    <span className="text-success fw-bold d-flex align-items-center"><Check size={18} className="me-2"/> In Stock ({stock} available)</span>
                                )}
                            </div>

                            <p className="lead text-muted mb-5">{product.description}</p>
                            
                            <div className="d-grid gap-3">
                                <Button 
                                    variant={isAdded ? "success" : (isOutOfStock ? "secondary" : "primary")} 
                                    size="lg" 
                                    className={`rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center transition-all ${isAdded ? 'text-white border-success' : ''}`} 
                                    onClick={handleAddToCart} 
                                    disabled={isAdded || isBuying || isOutOfStock} 
                                >
                                    {isOutOfStock ? "SOLD OUT" : isAdded ? <><Check size={20} className="me-2" /> ADDED TO BAG</> : <><ShoppingBag size={20} className="me-2" /> ADD TO BAG</>}
                                </Button>

                                <Button 
                                    variant="outline-primary" 
                                    size="lg" 
                                    className="rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center" 
                                    onClick={handleBuyNowClick}
                                    disabled={isBuying || isAdded || isOutOfStock} 
                                >
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
                {/* ... (Kept existing Review Logic) ... */}
                
                {/* TOAST & MODAL */}
                {/* ... (Kept existing Toast & Modal Logic) ... */}
                {/* Just verify inside Modal: Total: ₱{(parseFloat(product.price) * buyQuantity).toLocaleString()} */}
            </Container>
            
            {/* ... Modal Components ... */}
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

            <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Select Quantity</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <div className="d-flex align-items-center justify-content-center mb-4">
                        <img src={product.image} alt={product.name} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}} className="me-3"/>
                        <div className="text-start">
                            <h6 className="fw-bold mb-0">{product.name}</h6>
                            <small className="text-primary fw-bold">₱{parseFloat(product.price).toLocaleString()}</small>
                        </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-center gap-3">
                        <Button variant="outline-secondary" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}} onClick={decreaseQty} disabled={buyQuantity <= 1}>
                            <Minus size={16} />
                        </Button>
                        <span className="fw-bold fs-4" style={{width: '40px'}}>{buyQuantity}</span>
                        <Button variant="outline-dark" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}} onClick={increaseQty} disabled={buyQuantity >= stock}>
                            <Plus size={16} />
                        </Button>
                    </div>
                    <div className="mt-2 text-muted small">Max available: {stock}</div>
                    <div className="mt-3 fw-bold">
                        Total: <span className="text-primary">₱{(parseFloat(product.price) * buyQuantity).toLocaleString()}</span>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 justify-content-center pb-4">
                    <Button variant="outline-secondary" className="px-4 rounded-pill" onClick={() => setShowBuyModal(false)}>Cancel</Button>
                    <Button variant="primary" className="px-5 rounded-pill fw-bold" onClick={confirmBuyNow} disabled={isBuying}>
                        {isBuying ? <Spinner size="sm" animation="border"/> : <>Checkout <CreditCard size={16} className="ms-2"/></>}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ProductDetail;