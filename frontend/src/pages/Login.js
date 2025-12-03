import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert, Modal, FloatingLabel } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { ArrowRight, Eye, EyeOff, Facebook, Chrome } from 'lucide-react';
import './styles/Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Forgot Password State
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    
    const { login } = useAuth(); 
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 💡 FIX 1: Call API directly (No Timeout)
            // 💡 FIX 2: Pass arguments separately (email, password)
            const result = await login(email, password);

            if (result.success) {
                // Redirect on success (Admin check happens inside Account.js)
                navigate('/account');
            } else {
                // Show error from Laravel
                setError(result.message || "Invalid credentials.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
        
        setLoading(false);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        alert(`Password reset link sent to ${resetEmail}`);
        setShowResetModal(false);
        setResetEmail('');
    };

    return (
        <div className="auth-page">
            <Row className="g-0">
                {/* LEFT: Editorial Image */}
                <Col md={6} className="d-none d-md-block">
                    <div 
                        className="auth-image-side"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop)' }}
                    >
                        <div className="auth-image-text-overlay">
                            <h2 className="display-5 fw-bold mb-2">New Season</h2>
                            <p className="lead mb-0 fw-medium">Discover the latest trends for Summer '24.</p>
                        </div>
                    </div>
                </Col>

                {/* RIGHT: Login Form */}
                <Col md={6} className="auth-form-side">
                    <div className="auth-container">
                        <Link to="/" className="auth-brand">HAPPY CART</Link>

                        <div className="mb-4">
                            <h1 className="auth-title display-5">Welcome Back</h1>
                            <p className="auth-subtitle">Please enter your details to sign in.</p>
                        </div>

                        {error && <Alert variant="danger" className="rounded-3 border-0 shadow-sm mb-4">{error}</Alert>}
                        
                        <Form onSubmit={handleSubmit}>
                            <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: '#fff5f7' }}>
                                <FloatingLabel controlId="floatingInput" label="Email Address" className="mb-3">
                                    <Form.Control 
                                        type="email" 
                                        className="auth-input rounded-pill"
                                        placeholder="name@example.com"
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                    />
                                </FloatingLabel>

                                <div className="position-relative">
                                    <FloatingLabel controlId="floatingPassword" label="Password">
                                        <Form.Control 
                                            type={showPassword ? "text" : "password"}
                                            className="auth-input rounded-pill pe-5"
                                            placeholder="Password"
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required 
                                        />
                                    </FloatingLabel>
                                    <button
                                        type="button"
                                        className="btn border-0 p-0 position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ zIndex: 5 }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <Form.Check 
                                    type="checkbox" 
                                    label="Remember me" 
                                    className="small text-muted"
                                />
                                <span 
                                    role="button"
                                    style={{fontSize: '0.85rem', cursor: 'pointer'}} 
                                    className="text-decoration-none text-primary fw-bold"
                                    onClick={() => setShowResetModal(true)}
                                >
                                    Forgot Password?
                                </span>
                            </div>

                            <Button 
                                variant="primary" 
                                type="submit" 
                                className="w-100 auth-btn rounded-pill shadow-sm mb-4"
                                disabled={loading}
                            >
                                {loading ? 'Signing In...' : <>Sign In <ArrowRight size={18} className="ms-2" /></>}
                            </Button>

                            {/* SOCIAL LOGIN */}
                            <div className="d-flex gap-3 mb-4">
                                <Button variant="outline-light" className="btn-social w-100">
                                    <Chrome size={18} className="me-2 text-danger" /> Google
                                </Button>
                                <Button variant="outline-light" className="btn-social w-100">
                                    <Facebook size={18} className="me-2 text-primary" /> Facebook
                                </Button>
                            </div>
                        </Form>
                        
                        <div className="text-center">
                            <span className="text-muted">Don't have an account? </span>
                            <Link to="/register" className="link-animated ms-1">Create account</Link>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* FORGOT PASSWORD MODAL */}
            <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Reset Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted small mb-4">Enter your email address and we'll send you a link to reset your password.</p>
                    <Form onSubmit={handleResetPassword}>
                        <FloatingLabel controlId="resetEmail" label="Email Address" className="mb-4">
                            <Form.Control 
                                type="email" 
                                className="auth-input rounded-pill"
                                placeholder="name@example.com"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                            />
                        </FloatingLabel>
                        <div className="d-grid">
                            <Button variant="primary" type="submit" className="rounded-pill fw-bold auth-btn">
                                Send Reset Link
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Login;