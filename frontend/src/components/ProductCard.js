import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Headphones, Watch, Mouse, Monitor, Package, Usb, BatteryCharging } from 'lucide-react';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Helper to choose the right icon based on category
    const getProductIcon = (category) => {
        const props = { size: 64, color: "#ff6b8b", strokeWidth: 1.5 }; // Pink icon styling
        
        switch(category) {
            case 'Audio': return <Headphones {...props} />;
            case 'Wearables': return <Watch {...props} />;
            case 'Peripherals': return <Mouse {...props} />; // or Keyboard
            case 'Displays': return <Monitor {...props} />;
            case 'Accessories': return <Usb {...props} />;
            default: return <Package {...props} />;
        }
    };

    const handleAddToCart = () => {
        if (!user) {
            alert("You must be logged in to add items to the cart!");
            navigate('/login');
            return;
        }
        addToCart(product);
    };

    return (
        <Card className="h-100 shadow-sm hover-shadow border-0">
            {/* Icon Placeholder Area */}
            <div className="position-relative">
                <div 
                    className="d-flex align-items-center justify-content-center" 
                    style={{ 
                        height: '220px', 
                        background: 'linear-gradient(135deg, #fff5f7 0%, #ffe4e8 100%)' // Soft pink gradient bg
                    }}
                >
                    {/* Render the Lucide Icon instead of Emoji */}
                    {getProductIcon(product.category)}
                </div>
                
                {product.category && (
                    <span className="position-absolute top-3 start-3 badge bg-white text-primary shadow-sm m-3">
                        {product.category}
                    </span>
                )}
            </div>

            <Card.Body className="d-flex flex-column p-4">
                <Card.Title className="fw-bold text-dark text-truncate mb-1">{product.name}</Card.Title>
                <Card.Text className="text-muted small mb-3">
                    {product.description}
                </Card.Text>
                
                <div className="mt-auto d-flex justify-content-between align-items-center">
                    <h5 className="text-primary fw-bold mb-0">${product.price.toFixed(2)}</h5>
                    <Button 
                        variant="primary" 
                        size="sm"
                        className="px-3"
                        onClick={handleAddToCart}
                    >
                        Add +
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;