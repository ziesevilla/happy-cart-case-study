import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { ArrowLeft, Star, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ALL_PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard'; // Import Card for related items
import './ProductDetail.css'; // Import responsive styles

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    // Scroll to top when ID changes (e.g. clicking a related product)
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Find the current product
    const product = ALL_PRODUCTS.find(p => p.id === parseInt(id));

    // Find related products (Same category, excluding current item)
    const relatedProducts = ALL_PRODUCTS
        .filter(p => p.category === product?.category && p.id !== product?.id)
        .slice(0, 3); // Limit to 3 items

    if (!product) {
        return <Container className="py-5 text-center"><h2>Product not found</h2></Container>;
    }

    const handleAddToCart = () => {
        if (!user) {
            alert("You must be logged in to add items to the cart!");
            navigate('/login');
            return;
        }
        addToCart(product);
    };

    const handleBuyNow = () => {
        if (!user) {
            alert("You must be logged in to purchase!");
            navigate('/login');
            return;
        }
        addToCart(product);
        navigate('/checkout');
    };

    return (
        <div className="product-detail-page animate-fade-in bg-white min-vh-100 py-5">
            <Container>
                {/* Back Button */}
                <Button 
                    variant="link" 
                    className="text-muted mb-4 text-decoration-none p-0 d-flex align-items-center"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={18} className="me-2" /> Back to Collection
                </Button>

                {/* Main Product Section */}
                <Row className="g-5 mb-5">
                    {/* Left: Image */}
                    <Col md={6}>
                        <div className="position-relative rounded-4 overflow-hidden shadow-sm product-image-container">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="product-detail-img" /* Responsive class */
                            />
                            {/* Category Label */}
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
                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    className="rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingBag size={20} className="me-2" />
                                    ADD TO BAG
                                </Button>
                                <Button 
                                    variant="outline-primary" 
                                    size="lg" 
                                    className="rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center"
                                    onClick={handleBuyNow}
                                >
                                    <CreditCard size={20} className="me-2" />
                                    BUY NOW
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

                {/* Related Products Section */}
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
            </Container>
        </div>
    );
};

export default ProductDetail;