import React from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Account = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Protect the route: If no user, redirect to login
    if (!user) {
        // In a real app, use useEffect for this redirect
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

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Account</h2>
                <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
            </div>
            
            <Row>
                {/* Profile Section */}
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

                {/* Order History Section */}
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
                                    <tr>
                                        <td>#ORD-003</td>
                                        <td>Nov 20, 2023</td>
                                        <td>3</td>
                                        <td>$210.00</td>
                                        <td><Badge bg="secondary">Processing</Badge></td>
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