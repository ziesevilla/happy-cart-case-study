import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap'; 
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shirt, ShoppingBag, Check, Footprints, Glasses, AlertCircle, ShoppingCart, X } from 'lucide-react'; 

const ProductCard = ({ product, onAddToCart }) => {
    // 1. GET CART STATE to count items
    const { addToCart, cart } = useCart(); 
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // UI States
    const [isAdded, setIsAdded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Stock Logic
    const stock = product.stock || 0;
    const isOutOfStock = stock === 0;
    const isLowStock = stock > 0 && stock <= 5;

    // 2. CALCULATE CART QUANTITY
    const cartItem = cart.find(item => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const getProductIcon = (category) => {
        const props = { size: 64, color: "#ff6b8b", strokeWidth: 1.5 }; 
        switch(category) {
            case 'Clothing': return <Shirt {...props} />;
            case 'Shoes': return <Footprints {...props} />;
            case 'Accessories': return <Glasses {...props} />; 
            default: return <ShoppingBag {...props} />;
        }
    };

    const displayPrice = product.formatted_price 
        ? product.formatted_price 
        : `₱${parseFloat(product.price || 0).toLocaleString()}`;

    const handleAddToCart = (e) => {
        e.stopPropagation(); 
        
        if (isOutOfStock) return;

        if (!user) {
            alert("You must be logged in to add items to the cart!");
            navigate('/login');
            return;
        }

        addToCart(product);
        if (onAddToCart) onAddToCart(product); 

        setIsAnimating(true);
        setTimeout(() => {
            setIsAdded(true);
            setIsAnimating(false);
        }, 200);
        
        setTimeout(() => {
            setIsAdded(false);
        }, 1500);
    };

    return (
        <Card 
            className={`h-100 shadow-sm hover-shadow border-0 overflow-hidden product-card ${isOutOfStock ? 'opacity-75' : ''}`} 
            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => navigate(`/products/${product.id}`)} 
        >
            {/* IMAGE AREA */}
            <div className="position-relative overflow-hidden group">
                
                {isOutOfStock && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                         style={{ backgroundColor: 'rgba(255,255,255,0.6)', zIndex: 10 }}>
                        <Badge bg="dark" className="px-3 py-2 fs-6 text-uppercase" style={{ letterSpacing: '2px' }}>
                            Sold Out
                        </Badge>
                    </div>
                )}

                {product.image && !product.image.includes('via.placeholder') ? (
                    <div 
                        style={{ 
                            height: '280px', 
                            backgroundImage: `url(${product.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.5s ease',
                        }}
                        className="card-img-top product-img"
                    />
                ) : (
                    <div 
                        className="d-flex align-items-center justify-content-center" 
                        style={{ height: '280px', background: 'linear-gradient(135deg, #fff5f7 0%, #ffe4e8 100%)' }}
                    >
                        {getProductIcon(product.category)}
                    </div>
                )}
                
                {/* 3. SHOW QUANTITY IN CART (Pink Badge) */}
                {quantityInCart > 0 && (
                    <span 
                        className="position-absolute top-0 end-0 m-3 px-2 py-1 fw-bold rounded-circle shadow-sm text-white d-flex align-items-center justify-content-center animate-bounce"
                        // FIX: Explicitly set background color to Pink (#ff6b8b)
                        style={{ width: '28px', height: '28px', fontSize: '0.8rem', zIndex: 5, backgroundColor: '#ff6b8b' }}
                        title={`${quantityInCart} in cart`}
                    >
                        {quantityInCart}
                    </span>
                )}

                {/* 4. CATEGORY BADGE (Pink Text) */}
                {product.category && (
                    <span 
                        className="position-absolute top-0 start-0 m-3 px-3 py-1 fw-bold rounded-pill small shadow-sm bg-white"
                        // FIX: Explicitly set text color to Pink (#ff6b8b)
                        style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ff6b8b' }}
                    >
                        {product.category}
                    </span>
                )}
            </div>

            {/* CARD BODY */}
            <Card.Body className="d-flex flex-column p-4">
                <div className="mb-2">
                    <Card.Title className="fw-bold text-dark text-truncate mb-1" style={{ fontSize: '1.1rem' }}>
                        {product.name}
                    </Card.Title>
                    
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small text-truncate" style={{ maxWidth: '60%' }}>
                            {product.sub_category || product.subCategory ? `${product.sub_category || product.subCategory}` : ''}
                        </span>
                        
                        {isLowStock && !isOutOfStock && (
                             <span className="text-danger small fw-bold d-flex align-items-center">
                                <AlertCircle size={12} className="me-1"/> {stock} left
                             </span>
                        )}
                    </div>
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="text-dark fw-bold fs-5">{displayPrice}</span>
                    
                    {/* ACTION BUTTON */}
                    <Button 
                        variant={isAdded ? "success" : (isOutOfStock ? "secondary" : "dark")} 
                        className={`rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm transition-transform ${isAnimating ? 'scale-90' : ''}`}
                        style={{ width: '42px', height: '42px', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                        onClick={handleAddToCart}
                        disabled={isAdded || isOutOfStock}
                        title={isAdded ? "Added to Cart" : "Add to Cart"}
                    >
                        {isAdded ? (
                            <Check size={20} className="animate-bounce text-white" />
                        ) : (
                            isOutOfStock ? <X size={20} className="text-white"/> : (
                                <ShoppingCart size={20} className="text-white" />
                            )
                        )}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;