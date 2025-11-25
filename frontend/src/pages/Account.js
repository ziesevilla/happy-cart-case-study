import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Account = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // --- ADMIN STATE ---
    // In a real app, this data would come from your Laravel API
    const [products, setProducts] = useState([
        { id: 1, name: 'Wireless Headphones', price: 99.99, stock: 50 },
        { id: 2, name: 'Smart Watch', price: 299.99, stock: 20 },
        { id: 3, name: 'Gaming Mouse', price: 59.99, stock: 100 },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });

    // Protect the route
    if (!user) {
        return (
            <Container className="text-center mt-5">
                <h3>Please Log In</h3>
                <p>You need to be logged in to view your account.</p>
                <Button onClick={() => navigate('/login')}>Go to Login</Button>
            </Container>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // --- ADMIN ACTIONS ---
    const handleAddProduct = (e) => {
        e.preventDefault();
        const product = {
            id: products.length + 1,
            name: newProduct.name,
            price: parseFloat(newProduct.price),
            stock: parseInt(newProduct.stock)
        };
        setProducts([...products, product]);
        setShowAddModal(false);
        setNewProduct({ name: '', price: '', stock: '' });
        alert("Product Added Successfully!");
    };

    const handleDeleteProduct = (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    // --- RENDER ADMIN DASHBOARD ---
    if (user.role === 'admin') {
        return (
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Admin Dashboard</h2>
                    <div className="d-flex gap-2">
                        <Button variant="success" onClick={() => setShowAddModal(true)}>+ Add New Product</Button>
                        <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
                    </div>
                </div>

                <Row>
                    {/* Stats Cards */}
                    <Col md={4}>
                        <Card className="bg-primary text-white mb-4 shadow-sm">
                            <Card.Body>
                                <h3>{products.length}</h3>
                                <div>Total Products</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="bg-success text-white mb-4 shadow-sm">
                            <Card.Body>
                                <h3>12</h3>
                                <div>Pending Orders</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="bg-info text-white mb-4 shadow-sm">
                            <Card.Body>
                                <h3>$1,250.00</h3>
                                <div>Total Revenue</div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Inventory Table */}
                <Card className="shadow-sm border-0">
                    <Card.Header className="bg-white fw-bold">Current Inventory</Card.Header>
                    <Card.Body>
                        <Table responsive hover>
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Product Name</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.name}</td>
                                        <td>${p.price.toFixed(2)}</td>
                                        <td>{p.stock} units</td>
                                        <td>
                                            <Button variant="sm btn-outline-primary" className="me-2">Edit</Button>
                                            <Button variant="sm btn-outline-danger" onClick={() => handleDeleteProduct(p.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {/* Add Product Modal */}
                <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Product</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleAddProduct}>
                            <Form.Group className="mb-3">
                                <Form.Label>Product Name</Form.Label>
                                <Form.Control 
                                    required 
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Price</Form.Label>
                                <Form.Control 
                                    type="number" step="0.01" required 
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Stock Quantity</Form.Label>
                                <Form.Control 
                                    type="number" required 
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                                />
                            </Form.Group>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                                <Button variant="primary" type="submit">Save Product</Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        );
    }

    // --- RENDER CUSTOMER DASHBOARD (Existing Code) ---
    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Account</h2>
                <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
            </div>
            
            <Row>
                <Col md={4} className="mb-4">
                    <Card className="text-center p-4 shadow-sm border-0">
                        <Card.Body>
                            <div className="display-1 mb-3">👤</div>
                            <Card.Title>{user.name}</Card.Title>
                            <Card.Text className="text-muted">{user.email}</Card.Text>
                            <Badge bg="info" className="mb-3">{user.role}</Badge>
                            <div className="d-grid gap-2">
                                <Button variant="outline-primary" size="sm">Edit Profile</Button>
                                <Button variant="outline-secondary" size="sm">Change Password</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white fw-bold">Order History</Card.Header>
                        <Card.Body>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>#ORD-001</td>
                                        <td>Oct 12, 2023</td>
                                        <td>2</td>
                                        <td>$129.99</td>
                                        <td><Badge bg="success">Delivered</Badge></td>
                                    </tr>
                                    <tr>
                                        <td>#ORD-002</td>
                                        <td>Nov 05, 2023</td>
                                        <td>1</td>
                                        <td>$59.50</td>
                                        <td><Badge bg="warning" text="dark">Shipped</Badge></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Account;