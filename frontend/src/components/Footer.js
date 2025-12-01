import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone, CreditCard, Lock, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 
import './FootNav.css';

const Footer = () => {
    const { user } = useAuth(); 

    const getAuthLink = (path) => {
        return user ? path : '/login';
    };

    return (
        <footer className="custom-footer">
            <Container>
                {/* 1. NEWSLETTER */}
                <div className="footer-newsletter">
                    <h4 className="fw-bold mb-2">STAY IN THE LOOP</h4>
                    <p className="text-muted">Subscribe to get special offers, free giveaways, and exclusive deals.</p>
                    <div className="newsletter-input-group">
                        <input type="email" placeholder="Enter your email address" className="newsletter-input" />
                        <button className="btn-subscribe">SUBSCRIBE</button>
                    </div>
                </div>

                {/* 2. LINKS GRID */}
                <div className="footer-grid">
                    <div className="footer-col">
                        <h6>SHOP</h6>
                        <ul>
                            {/* 💡 UPDATED LINKS HERE */}
                            <li><Link to="/products?collection=New">New Arrivals</Link></li>
                            <li><Link to="/products?collection=Clothing">Clothing</Link></li>
                            <li><Link to="/products?collection=Shoes">Shoes</Link></li>
                            <li><Link to="/products?collection=Accessories">Accessories</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h6>CUSTOMER SERVICE</h6>
                        <ul>
                            <li><Link to="/help">Help Center</Link></li>
                            <li><Link to="/shipping">Shipping & Delivery</Link></li>
                            <li><Link to="/returns">Returns & Exchanges</Link></li>
                            <li><Link to="/account">Track Your Order</Link></li> 
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h6>COMPANY</h6>
                        <ul>
                            <li><Link to="/about">About Happy Cart</Link></li>
                            <li><Link to="/about">Sustainability</Link></li> 
                            <li><Link to="/about">Press & Media</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h6>MY ACCOUNT</h6>
                        <ul>
                            <li><Link to={getAuthLink('/account')}>My Profile</Link></li>
                            <li><Link to={getAuthLink('/account')}>Order History</Link></li>
                            <li><Link to="/cart">My Shopping Bag</Link></li> 
                            {!user && <li><Link to="/login">Login / Register</Link></li>}
                        </ul>
                    </div>

                    <div className="footer-col footer-contact-col">
                        <h6>CONTACT US</h6>
                        <div className="contact-item">
                            <Phone size={16} /> <span>+63 912 345 6789</span>
                        </div>
                        <div className="contact-item">
                            <Mail size={16} /> <span>support@happycart.com</span>
                        </div>
                        <div className="contact-item">
                            <MapPin size={16} /> <span>123 Fashion St, Manila, PH</span>
                        </div>

                        <h6 className="mt-3 mb-0" style={{fontSize: '0.75rem'}}>FOLLOW US</h6>
                        <div className="social-icons">
                            <a href="#" className="social-icon-circle"><Facebook size={18}/></a>
                            <a href="#" className="social-icon-circle"><Instagram size={18}/></a>
                            <a href="#" className="social-icon-circle"><Twitter size={18}/></a>
                            <a href="#" className="social-icon-circle"><Youtube size={18}/></a>
                        </div>
                    </div>
                </div>

                {/* 3. BOTTOM BAR */}
                <div className="footer-bottom">
                    <div className="d-flex flex-column gap-2">
                        <div className="payment-icons d-flex align-items-center gap-3">
                            <span className="small fw-bold me-2">We Accept:</span>
                            <CreditCard size={20} />
                            <Smartphone size={20} title="GCash" />
                        </div>
                        <small className="text-muted opacity-75">
                            &copy; 2025 HAPPY CART. ALL RIGHTS RESERVED.
                        </small>
                    </div>

                    <div className="d-flex flex-column align-items-end gap-2">
                        <div className="d-flex align-items-center gap-3 text-muted small">
                            <span className="d-flex align-items-center gap-1"><Lock size={14}/> Secure Payment</span>
                            <span className="d-flex align-items-center gap-1"><Lock size={14}/> SSL Encrypted</span>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;