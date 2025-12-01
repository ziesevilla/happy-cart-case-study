import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shirt, ShoppingBag, Check, Footprints, Glasses } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAdded, setIsAdded] = useState(false);

    // Helper: Choose icon based on Fashion Category
    const getProductIcon = (category) => {
        const props = { size: 64, color: "#ff6b8b", strokeWidth: 1.5 }; 
        
        switch(category) {
            case 'Clothing': return <Shirt {...props} />;
            case 'Shoes': return <Footprints {...props} />;
            case 'Accessories': return <Glasses {...props} />; // Or ShoppingBag
            default: return <ShoppingBag {...props} />;
        }
    };

    const handleAddToCart = (e) => {
        e.stopPropagation(); 
        if (!user) {
            alert("You must be logged in to add items to the cart!");
            navigate('/login');
            return;
        }
        addToCart(product);
        
        setIsAdded(true);
        if (onAddToCart) onAddToCart(product); 
        
        setTimeout(() => {
            setIsAdded(false);
        }, 1500);
    };

    return (
        <Card 
            className="h-100 shadow-sm hover-shadow border-0 overflow-hidden" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/products/${product.id}`)} 
        >
            {/* Image Area */}
            <div className="position-relative">
                {product.image && !product.image.includes('via.placeholder') ? (
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
                    // Fallback if image is a placeholder or missing
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
                    <Card.Title className="fw-bold text-dark text-truncate mb-0" style={{ maxWidth: '70%' }}>
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
                            "ADD TO CART"
                        )}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;