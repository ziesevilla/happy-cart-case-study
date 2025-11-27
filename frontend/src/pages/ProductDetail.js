import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import { ArrowLeft, Star, ShoppingBag, CreditCard, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ALL_PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    // --- VISUAL FEEDBACK STATE ---
    const [isAdded, setIsAdded] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Scroll to top when ID changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const product = ALL_PRODUCTS.find(p => p.id === parseInt(id));

    const relatedProducts = ALL_PRODUCTS
        .filter(p => p.category === product?.category && p.id !== product?.id)
        .slice(0, 3);

    if (!product) {
        return <Container className="py-5 text-center"><h2>Product not found</h2></Container>;
    }

    // --- HANDLERS ---
    const handleAddToCart = () => {
        if (!user) {
            alert("You must be logged in to add items to the cart!");
            navigate('/login');
            return;
        }
        addToCart(product);
        
        // Visual Feedback: Button Change + Toast
        setIsAdded(true);
        setShowToast(true);
        
        // Reset button state after 2 seconds
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (!user) {
            alert("You must be logged in to purchase!");
            navigate('/login');
            return;
        }
        
        // Visual Feedback: Loading Spinner
        setIsBuying(true);
        
        // NOTE: We do NOT call addToCart(product) here anymore.
        // Instead, we create a temporary cart item just for this checkout session.
        const itemToCheckout = { ...product, quantity: 1 };

        // Small delay to show the interaction before redirecting
        setTimeout(() => {
            setIsBuying(false);
            // Navigate to checkout with ONLY this item in state
            navigate('/checkout', { 
                state: { 
                    checkoutItems: [itemToCheckout] 
                } 
            });
        }, 800);
    };

    return (
        <div className="product-detail-page animate-fade-in bg-white min-vh-100 py-5">
            <Container>
                <Button 
                    variant="link" 
                    className="text-muted mb-4 text-decoration-none p-0 d-flex align-items-center"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={18} className="me-2" /> Back to Collection
                </Button>

                <Row className="g-5 mb-5">
                    {/* Left: Image */}
                    <Col md={6}>
                        <div className="position-relative rounded-4 overflow-hidden shadow-sm product-image-container">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="product-detail-img" 
                            />
                            <span 
                                className="position-absolute top-0 start-0 m-4 px-4 py-2 fw-bold rounded-pill shadow-sm small"
                                style={{ 
                                    backgroundColor: '#ffffff', 
                                    color: '#ff6b8b', 
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    zIndex: 2
                                }}
                            >
                                {product.category}
                            </span>
                        </div>
                    </Col>

                    {/* Right: Details */}
                    <Col md={6}>
                        <div className="h-100 d-flex flex-column justify-content-center">
                            <h1 className="display-4 fw-bold mb-3">{product.name}</h1>
                            
                            <div className="d-flex align-items-center mb-4">
                                <h3 className="text-primary fw-bold mb-0 me-4">₱{product.price.toLocaleString()}</h3>
                                <div className="d-flex text-warning">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                                    <span className="text-muted ms-2 small">(24 reviews)</span>
                                </div>
                            </div>

                            <p className="lead text-muted mb-5">
                                {product.description}
                            </p>

                            <div className="d-grid gap-3">
                                {/* ADD TO BAG BUTTON (Turns Green on Success) */}
                                <Button 
                                    variant={isAdded ? "success" : "primary"}
                                    size="lg" 
                                    className={`rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center transition-all ${isAdded ? 'text-white border-success' : ''}`}
                                    onClick={handleAddToCart}
                                    disabled={isAdded || isBuying}
                                >
                                    {isAdded ? (
                                        <><Check size={20} className="me-2" /> ADDED TO BAG</>
                                    ) : (
                                        <><ShoppingBag size={20} className="me-2" /> ADD TO BAG</>
                                    )}
                                </Button>

                                {/* BUY NOW BUTTON (Shows Spinner) */}
                                <Button 
                                    variant="outline-primary" 
                                    size="lg" 
                                    className="rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center"
                                    onClick={handleBuyNow}
                                    disabled={isBuying || isAdded}
                                >
                                    {isBuying ? (
                                        <><Spinner animation="border" size="sm" className="me-2"/> PROCESSING...</>
                                    ) : (
                                        <><CreditCard size={20} className="me-2" /> BUY NOW</>
                                    )}
                                </Button>
                            </div>

                            <div className="mt-5 pt-4 border-top">
                                <small className="text-muted d-block mb-2">
                                    <strong>Free Shipping</strong> on orders over ₱5,000
                                </small>
                                <small className="text-muted d-block">
                                    <strong>30 Day Returns</strong> if you change your mind
                                </small>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-5 pt-5 border-top">
                        <h3 className="fw-bold mb-4">YOU MIGHT ALSO LIKE</h3>
                        <Row xs={1} md={3} className="g-4">
                            {relatedProducts.map((item) => (
                                <Col key={item.id}>
                                    <ProductCard product={item} />
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}

                {/* TOAST NOTIFICATION */}
                <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{zIndex: 9999}}>
                    <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="dark">
                        <Toast.Header closeButton={false} className="d-flex justify-content-between bg-dark text-white border-0">
                            <strong className="me-auto d-flex align-items-center">
                                <ShoppingBag size={16} className="me-2"/> Added to Bag
                            </strong>
                            <small className="text-white-50">just now</small>
                            <button type="button" className="btn-close btn-close-white ms-2" onClick={() => setShowToast(false)}></button>
                        </Toast.Header>
                        <Toast.Body className="text-white">
                            {product.name} is now in your cart.
                        </Toast.Body>
                    </Toast>
                </ToastContainer>

            </Container>
        </div>
    );
};

export default ProductDetail;