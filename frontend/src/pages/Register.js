import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Alert, FloatingLabel, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { ArrowRight, ArrowLeft, Check, X, Chrome, Facebook, User, Mail, Lock, Eye, EyeOff, UserX } from 'lucide-react';
import './styles/Auth.css';

/**
 * Register Component
 */
const Register = () => {
    // --- HOOKS ---
    const { register } = useAuth();
    const { settings, loading } = useSettings();
    const navigate = useNavigate();

    // --- LOCAL STATE MANAGEMENT ---
    const [step, setStep] = useState(1); 
    const totalSteps = 3;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        password: '',
        confirmPassword: ''
    });
    
    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [error, setError] = useState('');
    
    // Password Strength Indicators
    const [passStrength, setPassStrength] = useState({
        length: false, uppercase: false, number: false, special: false
    });

    // --- AGE VALIDATION HELPER ---
    /**
     * Checks if the user is 18 years or older based on the date of birth.
     */
    const isOver18 = (dob) => {
        if (!dob) return false;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        // If birthday month hasn't passed, or if it's the same month but the day hasn't passed, subtract 1 from age
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    };


    // --- EFFECTS ---
    
    useEffect(() => {
        const { password } = formData;
        setPassStrength({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    }, [formData.password]);

    // --- HANDLERS ---

    const handleChange = (e) => {
        // Clear age error message if DOB field is changed
        if (e.target.name === 'dob') {
            setError(''); 
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- VALIDATION LOGIC FOR STEPS ---
    const isAdult = isOver18(formData.dob);
    // Step 1 now REQUIRES the user to be an adult
    const isStep1Valid = formData.name && formData.dob && formData.gender && isAdult;
    const isStep2Valid = formData.email && formData.phone;
    const isStrongPassword = Object.values(passStrength).every(Boolean);
    const passwordsMatch = formData.password && formData.password === formData.confirmPassword;
    const isStep3Valid = isStrongPassword && passwordsMatch;

    // --- NAVIGATION HANDLERS ---
    
    const handleNext = () => {
        setError(''); // Clear previous error

        // Specific Age Gate Check on Step 1
        if (step === 1) {
            if (!formData.dob) {
                setError("Please enter your date of birth.");
                return;
            }
            if (!isAdult) {
                setError("Registration requires you to be 18 years or older.");
                return;
            }
        }

        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    // --- FINAL SUBMISSION ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const result = await register(formData);

            if (result.success) {
                navigate('/account'); 
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
        
        setIsSubmitting(false);
    };

    const ValidationItem = ({ fulfilled, text }) => (
        <div className={`d-flex align-items-center small mb-1 ${fulfilled ? 'text-success' : 'text-muted'}`}>
            {fulfilled ? <Check size={14} className="me-2" /> : <X size={14} className="me-2" />}
            <span style={{ opacity: fulfilled ? 1 : 0.7 }}>{text}</span>
        </div>
    );

    // --- SYSTEM CHECK: IS REGISTRATION ALLOWED? ---
    if (!loading && settings.allowRegistration === false) {
        return (
            <div className="auth-page d-flex align-items-center justify-content-center bg-light" style={{minHeight: '100vh'}}>
                <div className="text-center p-5 bg-white shadow-sm rounded-4 border" style={{maxWidth: '500px'}}>
                    <div className="mb-3 text-secondary bg-light rounded-circle d-inline-flex p-3">
                        <UserX size={40} />
                    </div>
                    <h2 className="fw-bold mb-3">Registration Closed</h2>
                    <p className="text-muted mb-4">
                        We are currently not accepting new user registrations at this time. 
                        If you already have an account, please log in.
                    </p>
                    <div className="d-grid gap-2">
                        <Link to="/login" className="btn btn-primary rounded-pill fw-bold">
                            Go to Login
                        </Link>
                        <Link to="/" className="btn btn-outline-dark rounded-pill fw-bold">
                            Back to Store
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <Row className="g-0">
                <Col md={6} className="d-none d-md-block order-md-2">
                    <div 
                        className="auth-image-side"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop)' }}
                    >
                        <div className="auth-image-text-overlay">
                            <h2 className="display-5 fw-bold mb-2">Join the Club</h2>
                            <p className="lead mb-0 fw-medium">Step {step} of {totalSteps}: {step === 1 ? 'Personal Info' : step === 2 ? 'Contact Details' : 'Security'}</p>
                        </div>
                    </div>
                </Col>

                <Col md={6} className="auth-form-side order-md-1">
                    <div className="auth-container">
                        <Link to="/" className="auth-brand">HAPPY CART</Link>

                        <div className="mb-4">
                            <h1 className="auth-title display-5">Create Account</h1>
                            <p className="auth-subtitle">Let's get you set up in 3 easy steps.</p>
                        </div>

                        <div className="mb-4">
                            <ProgressBar now={(step / totalSteps) * 100} variant="dark" style={{height: '5px'}} />
                            <div className="d-flex justify-content-between mt-2 small text-muted fw-bold text-uppercase">
                                <span className={step >= 1 ? 'text-primary' : ''}>1. Personal</span>
                                <span className={step >= 2 ? 'text-primary' : ''}>2. Contact</span>
                                <span className={step >= 3 ? 'text-primary' : ''}>3. Security</span>
                            </div>
                        </div>

                        {/* Show Error Alert */}
                        {error && <Alert variant="danger" className="rounded-3 border-0 shadow-sm mb-4">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: '#fff5f7' }}>
                                
                                {/* --- STEP 1: PERSONAL INFO --- */}
                                {step === 1 && (
                                    <div className="animate-fade-in">
                                        <div className="d-flex align-items-center mb-3 text-primary">
                                            <User size={20} className="me-2"/> <h6 className="mb-0 fw-bold">Personal Information</h6>
                                        </div>
                                        
                                        <FloatingLabel controlId="floatingName" label="Full Name" className="mb-3">
                                            <Form.Control type="text" name="name" className="auth-input rounded-pill" placeholder="John Doe" value={formData.name} onChange={handleChange} autoFocus />
                                        </FloatingLabel>

                                        <Row className="g-2">
                                            <Col xs={6}>
                                                <FloatingLabel controlId="floatingDob" label="Date of Birth">
                                                    <Form.Control type="date" name="dob" className="auth-input rounded-pill" value={formData.dob} onChange={handleChange} />
                                                </FloatingLabel>
                                            </Col>
                                            <Col xs={6}>
                                                <FloatingLabel controlId="floatingGender" label="Gender">
                                                    <Form.Select name="gender" className="auth-input rounded-pill" value={formData.gender} onChange={handleChange}>
                                                        <option value="">Select...</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </Form.Select>
                                                </FloatingLabel>
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                {/* --- STEP 2: CONTACT INFO --- */}
                                {step === 2 && (
                                    <div className="animate-fade-in">
                                        <div className="d-flex align-items-center mb-3 text-primary">
                                            <Mail size={20} className="me-2"/> <h6 className="mb-0 fw-bold">Contact Details</h6>
                                        </div>

                                        <FloatingLabel controlId="floatingEmail" label="Email Address" className="mb-3">
                                            <Form.Control type="email" name="email" className="auth-input rounded-pill" placeholder="name@example.com" value={formData.email} onChange={handleChange} autoFocus />
                                        </FloatingLabel>

                                        <FloatingLabel controlId="floatingPhone" label="Phone Number" className="mb-3">
                                            <Form.Control type="tel" name="phone" className="auth-input rounded-pill" placeholder="0912..." value={formData.phone} onChange={handleChange} />
                                        </FloatingLabel>
                                    </div>
                                )}

                                {/* --- STEP 3: SECURITY (Password) --- */}
                                {step === 3 && (
                                    <div className="animate-fade-in">
                                        <div className="d-flex align-items-center mb-3 text-primary">
                                            <Lock size={20} className="me-2"/> <h6 className="mb-0 fw-bold">Security Setup</h6>
                                        </div>

                                        <div className="position-relative mb-3">
                                            <FloatingLabel controlId="floatingPass" label="Password">
                                                <Form.Control type={showPassword ? "text" : "password"} name="password" className="auth-input rounded-pill pe-5" placeholder="Password" value={formData.password} onChange={handleChange} autoFocus />
                                            </FloatingLabel>
                                            <button type="button" className="btn border-0 p-0 position-absolute top-50 end-0 translate-middle-y me-3 text-muted" onClick={() => setShowPassword(!showPassword)} style={{ zIndex: 5 }}>
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

                                        <FloatingLabel controlId="floatingConfirm" label="Confirm Password">
                                            <Form.Control type="password" name="confirmPassword" className="auth-input rounded-pill" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
                                        </FloatingLabel>

                                        {formData.confirmPassword && (
                                            <div className="mt-2 ps-2">
                                                <ValidationItem fulfilled={passwordsMatch} text="Passwords match" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* --- NAVIGATION BUTTONS --- */}
                            <div className="d-flex gap-2 mb-4">
                                {step > 1 && (
                                    <Button variant="light" className="rounded-pill px-4 fw-bold" onClick={handleBack}>
                                        <ArrowLeft size={18} className="me-2"/> Back
                                    </Button>
                                )}

                                {step < 3 ? (
                                    <Button 
                                        variant="dark" 
                                        type="button" 
                                        className={`rounded-pill w-100 fw-bold 
                                            ${step === 1 ? (!isStep1Valid && 'btn-muted-disabled') : 
                                              (step === 2 && !isStep2Valid && 'btn-muted-disabled')}`
                                        }
                                        onClick={handleNext}
                                        disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                                    >
                                        Next Step <ArrowRight size={18} className="ms-2"/>
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        className={`rounded-pill w-100 fw-bold shadow-sm 
                                            ${!isStep3Valid && 'btn-muted-disabled'}`
                                        }
                                        disabled={!isStep3Valid || isSubmitting}
                                    >
                                        {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
                                    </Button>
                                )}
                            </div>

                            {step === 1 && (
                                <div className="d-flex gap-3 mb-4">
                                    <Button variant="outline-light" className="btn-social w-100"><Chrome size={18} className="me-2 text-danger" /> Google</Button>
                                    <Button variant="outline-light" className="btn-social w-100"><Facebook size={18} className="me-2 text-primary" /> Facebook</Button>
                                </div>
                            )}
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