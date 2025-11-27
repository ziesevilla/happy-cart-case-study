import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, ListGroup } from 'react-bootstrap';
import { Plus, X } from 'lucide-react';

const AdminSettings = ({ showNotification }) => {
    const [categories, setCategories] = useState(['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories']);
    const [newCategory, setNewCategory] = useState('');

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategory) {
            setCategories([...categories, newCategory]);
            setNewCategory('');
            showNotification("Category added successfully!");
        }
    };

    const handleDeleteCategory = (cat) => {
        if(window.confirm(`Delete category ${cat}?`)) {
            setCategories(categories.filter(c => c !== cat));
        }
    };

    return (
        <div className="animate-fade-in">
            <h4 className="fw-bold mb-4">System Settings</h4>
            
            <Row className="g-4">
                <Col md={6}>
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3">Product Categories</h5>
                            <Form onSubmit={handleAddCategory} className="d-flex gap-2 mb-4">
                                <Form.Control 
                                    placeholder="New Category Name" 
                                    className="rounded-pill bg-light border-0"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                />
                                <Button type="submit" variant="primary" className="rounded-pill px-4"><Plus size={20}/></Button>
                            </Form>
                            
                            <ListGroup variant="flush">
                                {categories.map(cat => (
                                    <ListGroup.Item key={cat} className="d-flex justify-content-between align-items-center border-0 px-0">
                                        {cat}
                                        <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDeleteCategory(cat)}>
                                            <X size={16}/>
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3">Platform Settings</h5>
                            <Form>
                                <Form.Check type="switch" id="maintenance" label="Maintenance Mode" className="mb-3" />
                                <Form.Check type="switch" id="registration" label="Allow User Registration" defaultChecked className="mb-3" />
                                <Form.Check type="switch" id="reviews" label="Enable Product Reviews" defaultChecked className="mb-3" />
                                <Button variant="dark" className="rounded-pill mt-3">Save Configuration</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminSettings;