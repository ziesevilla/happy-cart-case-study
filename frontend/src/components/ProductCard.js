import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Headphones, Watch, Mouse, Monitor, Package, Shirt, ShoppingBag, Check } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAdded, setIsAdded] = useState(false);

    // Helper to choose the right icon based on category (Fallback)
    const getProductIcon = (category) => {
        const props = { size: 64, color: "#ff6b8b", strokeWidth: 1.5 }; 
        
        switch(category) {
            case 'Audio': return <Headphones {...props} />;
            case 'Wearables': return <Watch {...props} />;
            case 'Peripherals': return <Mouse {...props} />;
            case 'Displays': return <Monitor {...props} />;
            case 'Accessories': return <ShoppingBag {...props} />;
            case 'Dresses':
            case 'Tops':
            case 'Bottoms':
            case 'Outerwear': return <Shirt {...props} />;
            default: return <Package {...props} />;
        }
    };

    const handleAddToCart = (e) => {
        e.stopPropagation(); // Prevent triggering the card click
        if (!user) {
            alert("You must be logged in to add items to the cart!");
            navigate('/login');
            return;
        }
        addToCart(product);
        
        // Trigger Visual Feedback
        setIsAdded(true);
        if (onAddToCart) onAddToCart(product); // Notify parent if prop exists
        
        // Reset button after 1.5 seconds
        setTimeout(() => {
            setIsAdded(false);
        }, 1500);
    };

    return (
        <Card 
            className="h-100 shadow-sm hover-shadow border-0 overflow-hidden" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/products/${product.id}`)} // Make the whole card clickable
        >
            {/* Image Area */}
            <div className="position-relative">
                {product.image ? (
                    <div 
                        style={{ 
                            height: '320px', 
                            backgroundImage: `url(${product.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'top center',
                            transition: 'transform 0.5s ease'
                        }}
                        className="card-img-top"
                    />
                ) : (
                    <div 
                        className="d-flex align-items-center justify-content-center" 
                        style={{ 
                            height: '320px', 
                            background: 'linear-gradient(135deg, #fff5f7 0%, #ffe4e8 100%)' 
                        }}
                    >
                        {getProductIcon(product.category)}
                    </div>
                )}
                
                {/* Fixed Category Label */}
                {product.category && (
                    <span 
                        className="position-absolute top-0 start-0 m-3 px-3 py-1 fw-bold rounded-pill small shadow-sm"
                        style={{ 
                            backgroundColor: '#ffffff', 
                            color: '#ff6b8b', 
                            letterSpacing: '0.5px',
                            zIndex: 2
                        }}
                    >
                        {product.category}
                    </span>
                )}
            </div>

            <Card.Body className="d-flex flex-column p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="fw-bold text-dark text-truncate mb-0" style={{ maxWidth: '85%' }}>
                        {product.name}
                    </Card.Title>
                    <span className="text-primary fw-bold">₱{product.price.toLocaleString()}</span>
                </div>
                
                <Card.Text className="text-muted small mb-4 line-clamp-2">
                    {product.description}
                </Card.Text>
                
                <div className="mt-auto">
                    <Button 
                        variant={isAdded ? "success" : "outline-primary"} 
                        className={`w-100 rounded-pill fw-bold transition-all ${isAdded ? 'text-white border-success' : ''}`}
                        onClick={handleAddToCart}
                        disabled={isAdded}
                    >
                        {isAdded ? (
                            <><Check size={18} className="me-2"/> ADDED</>
                        ) : (
                            "ADD TO BAG"
                        )}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;