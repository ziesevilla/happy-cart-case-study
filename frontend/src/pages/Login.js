import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import hook

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { login } = useAuth(); // Get login function
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Mock Logic
        if (email === "admin@example.com" && password === "password") {
            login({ name: "Admin User", email: email, role: "admin" });
            navigate('/account');
        } else if (email === "user@example.com" && password === "password") {
            login({ name: "John Doe", email: email, role: "customer" });
            navigate('/account');
        } else {
            setError("Invalid credentials.");
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <Card style={{ width: '400px' }} className="shadow p-4">
                <Card.Body>
                    <h2 className="text-center mb-4">Login</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">Login</Button>
                    </Form>
                    <div className="text-center mt-3">
                        <small>Don't have an account? <Link to="/register">Register here</Link></small>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;