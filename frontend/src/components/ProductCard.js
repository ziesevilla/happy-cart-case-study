import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap'; 
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shirt, ShoppingBag, Check, Footprints, Glasses, AlertCircle } from 'lucide-react'; 

/**
 * ProductCard Component
 * * Represents a single item in the grid.
 * * Handles "Quick Add" functionality and Stock Status display.
 */
const ProductCard = ({ product, onAddToCart }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // UI State: Provides visual feedback ("Added!") for 1.5 seconds
    const [isAdded, setIsAdded] = useState(false);

    // =================================================================
    // 1. STOCK LOGIC
    // =================================================================
    const stock = product.stock || 0;
    const isOutOfStock = stock === 0;
    // UX Pattern: Scarcity. Warn user if items are running low (< 5).
    const isLowStock = stock > 0 && stock <= 5;

    /**
     * Helper: Dynamic Icon Fallback
     * * If the product has no image uploaded, we show a relevant icon 
     * * based on its category instead of a broken image link.
     */
    const getProductIcon = (category) => {
        const props = { size: 64, color: "#ff6b8b", strokeWidth: 1.5 }; 
        switch(category) {
            case 'Clothing': return <Shirt {...props} />;
            case 'Shoes': return <Footprints {...props} />;
            case 'Accessories': return <Glasses {...props} />; 
            default: return <ShoppingBag {...props} />;
        }
    };

    /**
     * Handle "Quick Add" Button Click
     */
    const handleAddToCart = (e) => {
        // CRITICAL: Stop Propagation
        // The entire Card is clickable (navigates to details).
        // Without this, clicking "Add to Cart" would add the item AND jump to the details page.
        e.stopPropagation(); 
        
        if (isOutOfStock) return;

        // Security: Force login before buying
        if (!user) {
            alert("You must be logged in to add items to the cart!");
            navigate('/login');
            return;
        }

        // Logic: Add to Context
        addToCart(product);
        
        // UI: Visual Feedback
        setIsAdded(true);
        if (onAddToCart) onAddToCart(product); 
        
        // Reset button state after 1.5 seconds
        setTimeout(() => {
            setIsAdded(false);
        }, 1500);
    };

    // Helper: Safe Price Display
    // Uses the 'formatted_price' from Laravel if available, otherwise formats manually.
    const displayPrice = product.formatted_price 
        ? product.formatted_price 
        : `₱${parseFloat(product.price || 0).toLocaleString()}`;

    return (
        <Card 
            className={`h-100 shadow-sm hover-shadow border-0 overflow-hidden ${isOutOfStock ? 'opacity-75' : ''}`} 
            style={{ cursor: 'pointer' }}
            // Clicking anywhere on the card (except the button) opens details
            onClick={() => navigate(`/products/${product.id}`)} 
        >
            {/* ================= IMAGE AREA ================= */}
            <div className="position-relative">
                
                {/* 1. Sold Out Overlay */}
                {isOutOfStock && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                         style={{ backgroundColor: 'rgba(255,255,255,0.6)', zIndex: 10 }}>
                        <Badge bg="dark" className="px-3 py-2 fs-6 text-uppercase" style={{ letterSpacing: '2px' }}>
                            Sold Out
                        </Badge>
                    </div>
                )}

                {/* 2. Image Rendering (with Fallback) */}
                {product.image && !product.image.includes('via.placeholder') ? (
                    <div 
                        style={{ 
                            height: '320px', 
                            backgroundImage: `url(${product.image})`, // CSS Background covers area better than <img> tag
                            backgroundSize: 'cover',
                            backgroundPosition: 'top center',
                            transition: 'transform 0.5s ease',
                            filter: isOutOfStock ? 'grayscale(100%)' : 'none' 
                        }}
                        className="card-img-top"
                    />
                ) : (
                    // Show Icon if no image exists
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
                
                {/* 3. Category Badge (Top Left) */}
                {product.category && (
                    <span 
                        className="position-absolute top-0 start-0 m-3 px-3 py-1 fw-bold rounded-pill small shadow-sm"
                        style={{ backgroundColor: '#ffffff', color: '#ff6b8b', zIndex: 2 }}
                    >
                        {product.category}
                    </span>
                )}
            </div>

            {/* ================= CARD BODY ================= */}
            <Card.Body className="d-flex flex-column p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="fw-bold text-dark text-truncate mb-0" style={{ maxWidth: '70%' }}>
                        {product.name}
                    </Card.Title>
                    <span className="text-primary fw-bold">{displayPrice}</span>
                </div>
                
                {/* 4. Low Stock Indicator */}
                {isLowStock && !isOutOfStock && (
                     <div className="d-flex align-items-center text-danger small fw-bold mb-2 animate-pulse">
                        <AlertCircle size={14} className="me-1"/> Only {stock} left!
                     </div>
                )}

                <Card.Text className="text-muted small mb-4 line-clamp-2">
                    {product.description}
                </Card.Text>
                
                {/* 5. Action Button */}
                <div className="mt-auto">
                    <Button 
                        variant={isAdded ? "success" : (isOutOfStock ? "secondary" : "outline-primary")} 
                        className={`w-100 rounded-pill fw-bold transition-all ${isAdded ? 'text-white border-success' : ''}`}
                        onClick={handleAddToCart}
                        disabled={isAdded || isOutOfStock} 
                    >
                        {isOutOfStock ? (
                            "SOLD OUT"
                        ) : isAdded ? (
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