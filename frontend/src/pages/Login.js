import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook to redirect user after login

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        // --- SIMULATED BACKEND CALL ---
        // Later, this will be: axios.post('http://localhost:8000/api/login', { email, password })
        console.log("Attempting login with:", email, password);

        if (email === "admin@example.com" && password === "password") {
            alert("Admin Login Successful!");
            navigate('/account'); // Redirect to dashboard
        } else if (email === "user@example.com" && password === "password") {
            alert("User Login Successful!");
            navigate('/'); // Redirect to home
        } else {
            setError("Invalid credentials. Try admin@example.com / password");
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <Card style={{ width: '400px' }} className="shadow p-4">
                <Card.Body>
                    <h2 className="text-center mb-4">Login</h2>
                    
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Enter email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            Login
                        </Button>
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