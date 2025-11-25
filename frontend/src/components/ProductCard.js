import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Import Auth hook
import { useNavigate } from 'react-router-dom';   // Import Navigation hook

const ProductCard = ({ product }) => {
    // Ensure hooks are called safely
    const { addToCart } = useCart();
    const { user } = useAuth(); // Check who is logged in
    const navigate = useNavigate();

    const handleAddToCart = () => {
        // Check if user is logged in
        if (!user) {
            alert("You must be logged in to add items to the cart!");
            navigate('/login'); // Redirects to the login route
            return;
        }
        
        // If logged in, proceed to add item
        addToCart(product);
    };

    return (
        <Card className="h-100 shadow-sm hover-shadow border-0">
            {/* Image Placeholder with category badge */}
            <div className="position-relative">
                <div 
                    className="bg-secondary text-white d-flex align-items-center justify-content-center" 
                    style={{ height: '200px', backgroundColor: '#f8f9fa' }}
                >
                    <span className="display-4">{product.emoji}</span>
                </div>
                {product.category && (
                    <span className="position-absolute top-0 start-0 badge bg-primary m-2">
                        {product.category}
                    </span>
                )}
            </div>

            <Card.Body className="d-flex flex-column">
                <Card.Title className="text-truncate">{product.name}</Card.Title>
                <Card.Text className="text-muted small">
                    {product.description}
                </Card.Text>
                
                <div className="mt-auto d-flex justify-content-between align-items-center">
                    <h5 className="text-primary mb-0">${product.price.toFixed(2)}</h5>
                    <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={handleAddToCart} // Use the new handler
                    >
                        Add to Cart
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;