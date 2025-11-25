import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
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
                <span className="position-absolute top-0 start-0 badge bg-primary m-2">
                    {product.category}
                </span>
            </div>

            <Card.Body className="d-flex flex-column">
                <Card.Title className="text-truncate">{product.name}</Card.Title>
                <Card.Text className="text-muted small">
                    {product.description}
                </Card.Text>
                
                <div className="mt-auto d-flex justify-content-between align-items-center">
                    <h5 className="text-primary mb-0">${product.price.toFixed(2)}</h5>
                    <Button variant="outline-primary" size="sm">Add to Cart</Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;