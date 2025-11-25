import React from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Register = () => {
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <Card style={{ width: '400px' }} className="shadow p-4">
                <Card.Body>
                    <h2 className="text-center mb-4">Register</h2>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control type="text" placeholder="John Doe" />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" />
                        </Form.Group>

                        <Button variant="success" type="submit" className="w-100">
                            Sign Up
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <small>Already have an account? <Link to="/login">Login here</Link></small>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Register;