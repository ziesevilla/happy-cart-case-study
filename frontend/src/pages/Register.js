import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Alert, FloatingLabel } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Check, X, Chrome, Facebook } from 'lucide-react';
import './styles/Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [passStrength, setPassStrength] = useState({
        length: false, uppercase: false, number: false, special: false
    });

    const navigate = useNavigate();

    useEffect(() => {
        const { password } = formData;
        setPassStrength({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    }, [formData.password]);

    const isStrongPassword = Object.values(passStrength).every(Boolean);
    const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!isStrongPassword || !passwordsMatch) return;

        setLoading(true);
        setTimeout(() => {
            console.log("Registering User:", formData);
            alert("Registration Successful! Please Login.");
            navigate('/login');
        }, 1500);
    };

    const ValidationItem = ({ fulfilled, text }) => (
        <div className={`d-flex align-items-center small mb-1 ${fulfilled ? 'text-success' : 'text-muted'}`}>
            {fulfilled ? <Check size={14} className="me-2" /> : <X size={14} className="me-2" />}
            <span style={{ opacity: fulfilled ? 1 : 0.7 }}>{text}</span>
        </div>
    );

    return (
        <div className="auth-page">
            <Row className="g-0">
                {/* LEFT: Editorial Image */}
                <Col md={6} className="d-none d-md-block order-md-2">
                    <div 
                        className="auth-image-side"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop)' }}
                    >
                        <div className="auth-image-text-overlay">
                            <h2 className="display-5 fw-bold mb-2">Join the Club</h2>
                            <p className="lead mb-0 fw-medium">Get exclusive access to sales and new drops.</p>
                        </div>
                    </div>
                </Col>

                {/* RIGHT: Form */}
                <Col md={6} className="auth-form-side order-md-1">
                    <div className="auth-container">
                        <Link to="/" className="auth-brand">HAPPY CART</Link>

                        <div className="mb-4">
                            <h1 className="auth-title display-5">Create Account</h1>
                            <p className="auth-subtitle">Start your fashion journey with us today.</p>
                        </div>

                        {error && <Alert variant="danger" className="rounded-3 border-0 shadow-sm mb-4">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: '#fff5f7' }}>
                                <FloatingLabel controlId="floatingName" label="Full Name" className="mb-3">
                                    <Form.Control 
                                        type="text" 
                                        name="name"
                                        className="auth-input rounded-pill"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </FloatingLabel>

                                <FloatingLabel controlId="floatingEmail" label="Email Address" className="mb-3">
                                    <Form.Control 
                                        type="email" 
                                        name="email"
                                        className="auth-input rounded-pill"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </FloatingLabel>

                                <div className="position-relative mb-3">
                                    <FloatingLabel controlId="floatingPass" label="Password">
                                        <Form.Control 
                                            type={showPassword ? "text" : "password"} 
                                            name="password"
                                            className="auth-input rounded-pill pe-5"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleChange}
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

                                {formData.password && (
                                    <div className="mb-3 ps-2">
                                        <ValidationItem fulfilled={passStrength.length} text="At least 8 characters" />
                                        <ValidationItem fulfilled={passStrength.uppercase} text="At least 1 uppercase letter" />
                                        <ValidationItem fulfilled={passStrength.number} text="At least 1 number" />
                                        <ValidationItem fulfilled={passStrength.special} text="At least 1 special character" />
                                    </div>
                                )}

                                <div className="position-relative">
                                    <FloatingLabel controlId="floatingConfirm" label="Confirm Password">
                                        <Form.Control 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            name="confirmPassword"
                                            className="auth-input rounded-pill pe-5"
                                            placeholder="Confirm Password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </FloatingLabel>
                                    <button
                                        type="button"
                                        className="btn border-0 p-0 position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ zIndex: 5 }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {formData.confirmPassword && (
                                    <div className="mt-2 ps-2">
                                        <ValidationItem fulfilled={passwordsMatch} text="Passwords match" />
                                    </div>
                                )}
                            </div>

                            <Button 
                                variant="primary" 
                                type="submit" 
                                className="w-100 auth-btn rounded-pill shadow-sm mb-4" 
                                disabled={!isStrongPassword || !passwordsMatch || loading}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
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
                            <span className="text-muted">Already have an account? </span>
                            <Link to="/login" className="link-animated ms-1">Log in</Link>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Register;