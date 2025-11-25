import React from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';

const Account = () => {
    // Dummy user data
    const user = { name: "John Doe", email: "john@example.com", role: "Customer" };

    return (
        <Container>
            <h2 className="mb-4">My Account</h2>
            <Row>
                <Col md={4} className="mb-4">
                    <Card className="text-center p-4">
                        <Card.Body>
                            <div className="display-4 mb-2">👤</div>
                            <Card.Title>{user.name}</Card.Title>
                            <Card.Text>{user.email}</Card.Text>
                            <Badge bg="info">{user.role}</Badge>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card>
                        <Card.Header>Order History</Card.Header>
                        <Card.Body>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>#1001</td>
                                        <td>Oct 12, 2023</td>
                                        <td>$129.99</td>
                                        <td><Badge bg="success">Delivered</Badge></td>
                                    </tr>
                                    <tr>
                                        <td>#1002</td>
                                        <td>Nov 05, 2023</td>
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