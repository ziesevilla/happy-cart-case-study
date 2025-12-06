import React from 'react';
import { Container, Accordion, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
    Truck, RotateCcw, Shield, HelpCircle, Heart, 
    Users, Leaf, MapPin, Mail, FileText, 
    Clock, Globe, DollarSign, Check, Package, Megaphone
} from 'lucide-react';

// --- HELPER COMPONENTS ---

/**
 * InfoNavigation Component
 * * A sub-navigation bar displayed at the top of all informational pages.
 * * Uses 'useLocation' to determine the active tab and style it accordingly.
 */
const InfoNavigation = () => {
    const location = useLocation();
    
    // 💡 REMOVED 'Track Order' from this list
    const links = [
        { name: 'About', path: '/about', icon: Users },
        { name: 'Sustainability', path: '/sustainability', icon: Leaf },
        { name: 'Press', path: '/press', icon: Megaphone },
        { name: 'Shipping', path: '/shipping', icon: Truck },
        { name: 'Returns', path: '/returns', icon: RotateCcw },
        { name: 'FAQ', path: '/help', icon: HelpCircle },
    ];

    return (
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
            {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                    <Button 
                        key={link.name}
                        as={Link} 
                        to={link.path} 
                        variant={isActive ? "primary" : "outline-secondary"}
                        className={`rounded-pill px-3 py-2 d-flex align-items-center small ${isActive ? 'fw-bold shadow-sm' : 'border-0 bg-light text-muted'}`}
                    >
                        <link.icon size={14} className="me-2"/> {link.name}
                    </Button>
                );
            })}
        </div>
    );
};

/**
 * InfoPageLayout Component (Wrapper)
 * * A Higher-Order Component (HOC) pattern used to ensure consistent spacing, 
 * * typography, and footer structure across all static pages.
 * @param {string} title - The main heading of the page
 * @param {Icon} icon - Lucide icon component to display
 * @param {string} lastUpdated - Optional date string for legal pages
 * @param {ReactNode} children - The unique content of the specific page
 */
const InfoPageLayout = ({ title, icon: Icon, children, lastUpdated }) => (
    <div className="min-vh-100 bg-white py-5 animate-fade-in">
        <Container style={{ maxWidth: '900px' }}>
            {/* Render the sub-navigation menu */}
            <InfoNavigation />
            
            {/* Shared Header Section */}
            <div className="text-center mb-5">
                <div className="d-inline-flex align-items-center justify-content-center p-3 bg-primary-subtle rounded-circle mb-3 text-primary">
                    {Icon && <Icon size={32} />}
                </div>
                <h1 className="fw-bold display-5 text-dark mb-2">{title}</h1>
                {lastUpdated && <p className="text-muted small">Last Updated: {lastUpdated}</p>}
                <div className="mx-auto mt-3" style={{ width: '60px', height: '4px', background: 'linear-gradient(to right, #ff9a9e, #ff6b8b)' }}></div>
            </div>

            {/* Page Specific Content */}
            <div style={{ fontSize: '1.05rem', color: '#4a5568', lineHeight: '1.8' }}>
                {children}
            </div>

            {/* Global Contact Footer - Appears on every info page */}
            <div className="mt-5 pt-5 border-top text-center">
                <h5 className="fw-bold">Still have questions?</h5>
                <p className="text-muted mb-3">We're happy to help! Our team replies within 24 hours.</p>
                <a href="mailto:support@happycart.com" className="btn btn-outline-dark rounded-pill px-4 fw-bold">
                    <Mail size={18} className="me-2"/> Contact Support
                </a>
            </div>
        </Container>
    </div>
);

// --- 1. COMPANY PAGES ---

export const About = () => (
    <InfoPageLayout title="About Happy Cart" icon={Heart}>
        <div className="text-center mb-5">
            <p className="lead">
                Welcome to <strong>Happy Cart</strong>, your ultimate destination for fashion that feels as good as it looks. 
                Bridging the gap between high-end trends and everyday accessibility since 2023.
            </p>
        </div>

        {/* Mission Statement Grid */}
        <Row className="g-4 mb-5">
            <Col md={6}>
                <div className="p-4 bg-light rounded-4 h-100">
                    <h4 className="fw-bold text-dark mb-3">Our Story</h4>
                    <p className="mb-0">
                        We believe that style is a form of self-expression that shouldn't come with a hefty price tag. From our humble beginnings as a small online boutique in the heart of Manila, 
                        we've grown into a community-driven brand that celebrates diversity, body positivity, and the joy of finding that <em>perfect</em> outfit.
                    </p>
                </div>
            </Col>
            <Col md={6}>
                <div className="p-4 bg-success-subtle rounded-4 h-100">
                    <h4 className="fw-bold text-success-emphasis mb-3 d-flex align-items-center"><Leaf size={24} className="me-2"/> Our Mission</h4>
                    <p className="mb-0 text-success-emphasis">
                        To empower individuals through accessible fashion while maintaining a commitment to ethical practices. We aren't just selling clothes; we're building a movement of confidence and kindness.
                    </p>
                </div>
            </Col>
        </Row>

        {/* Core Values Section */}
        <h4 className="fw-bold mb-4 text-center">Our Core Values</h4>
        <Row className="g-4">
            {[
                { title: "Inclusivity First", icon: Users, text: "We design for every body type, offering a wide range of sizes because style knows no number." },
                { title: "Quality You Can Trust", icon: Shield, text: "We partner with ethical manufacturers to ensure every stitch holds up to your busy lifestyle." },
                { title: "Customer Happiness", icon: Heart, text: "Hence our name! Your satisfaction is our north star. If you're not happy, neither are we." }
            ].map((val, idx) => (
                <Col md={4} key={idx}>
                    <Card className="h-100 border-0 shadow-sm text-center p-3">
                        <Card.Body>
                            <div className="mx-auto mb-3 text-primary"><val.icon size={32}/></div>
                            <h6 className="fw-bold">{val.title}</h6>
                            <p className="small text-muted mb-0">{val.text}</p>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    </InfoPageLayout>
);

export const Sustainability = () => (
    <InfoPageLayout title="Sustainability" icon={Leaf}>
        <div className="text-center mb-5">
            <p className="lead">Fashion shouldn't cost the earth. We are committed to reducing our footprint one step at a time.</p>
        </div>

        <Row className="g-4 mb-5">
            <Col md={4}>
                <div className="text-center p-4 border rounded-4 h-100">
                    <div className="text-success mb-3"><Package size={40}/></div>
                    <h5 className="fw-bold">Eco-Packaging</h5>
                    <p className="text-muted small">By 2025, 100% of our packaging will be compostable or made from recycled materials.</p>
                </div>
            </Col>
            <Col md={4}>
                <div className="text-center p-4 border rounded-4 h-100">
                    <div className="text-success mb-3"><Users size={40}/></div>
                    <h5 className="fw-bold">Ethical Labor</h5>
                    <p className="text-muted small">We only work with factories that pay fair wages and provide safe working conditions.</p>
                </div>
            </Col>
            <Col md={4}>
                <div className="text-center p-4 border rounded-4 h-100">
                    <div className="text-success mb-3"><RotateCcw size={40}/></div>
                    <h5 className="fw-bold">Circular Fashion</h5>
                    <p className="text-muted small">We are launching a pre-loved program soon to extend the lifecycle of your garments.</p>
                </div>
            </Col>
        </Row>

        <Alert variant="success" className="border-0 rounded-4">
            <h5 className="fw-bold mb-2">Our 2025 Pledge</h5>
            <p className="mb-0">We pledge to reduce our carbon emissions by 30% and eliminate single-use plastics from our entire supply chain within the next two years.</p>
        </Alert>
    </InfoPageLayout>
);

export const Press = () => (
    <InfoPageLayout title="Press & Media" icon={Megaphone}>
        <p className="lead text-center mb-5">Read what others are saying about Happy Cart.</p>

        <div className="mb-5">
            <h4 className="fw-bold mb-4">Featured In</h4>
            <Row className="g-4">
                {['Vogue PH', 'Mega Magazine', 'Preview', 'CNN Philippines'].map((media, idx) => (
                    <Col md={3} xs={6} key={idx}>
                        <div className="bg-light rounded-3 py-4 text-center fw-bold text-muted h-100 d-flex align-items-center justify-content-center">
                            {media}
                        </div>
                    </Col>
                ))}
            </Row>
        </div>

        <div className="bg-light p-5 rounded-4 text-center">
            <h4 className="fw-bold mb-3">Media Inquiries</h4>
            <p className="text-muted mb-4">For press kits, interview requests, or high-res assets, please contact our PR team.</p>
            <a href="mailto:press@happycart.com" className="btn btn-primary rounded-pill px-5 fw-bold">Email Press Team</a>
        </div>
    </InfoPageLayout>
);

// --- 2. CUSTOMER SERVICE PAGES ---

export const Shipping = () => (
    <InfoPageLayout title="Shipping & Delivery" icon={Truck}>
        <Alert variant="primary" className="mb-5 border-0 rounded-4 d-flex align-items-center">
            <Clock size={24} className="me-3" />
            <div>
                <strong>Standard Processing Time:</strong> Orders are processed within 24-48 hours. Orders placed on weekends ship the next business day.
            </div>
        </Alert>

        <h4 className="fw-bold mb-4">Shipping Rates</h4>
        <div className="card border-0 shadow-sm overflow-hidden mb-5 rounded-4">
            <div className="table-responsive">
                {/* Shipping Rate Table */}
                <table className="table table-hover mb-0" style={{ verticalAlign: 'middle' }}>
                    <thead className="bg-light">
                        <tr>
                            <th className="py-3 ps-4">Region</th>
                            <th className="py-3">Estimated Time</th>
                            <th className="py-3 pe-4 text-end">Standard Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="ps-4 fw-bold"><MapPin size={16} className="me-2 text-danger"/>Metro Manila</td>
                            <td>2-3 Business Days</td>
                            <td className="pe-4 text-end">₱80 <Badge bg="success" className="ms-2">Free over ₱1,500</Badge></td>
                        </tr>
                        <tr>
                            <td className="ps-4 fw-bold"><MapPin size={16} className="me-2 text-warning"/>Luzon (Provincial)</td>
                            <td>3-5 Business Days</td>
                            <td className="pe-4 text-end">₱150 <Badge bg="success" className="ms-2">Free over ₱5,000</Badge></td>
                        </tr>
                        <tr>
                            <td className="ps-4 fw-bold"><MapPin size={16} className="me-2 text-info"/>Visayas & Mindanao</td>
                            <td>5-7 Business Days</td>
                            <td className="pe-4 text-end">₱200</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <Row className="g-4">
            <Col md={6}>
                <h5 className="fw-bold mb-3">Same-Day Delivery</h5>
                <p className="text-muted">
                    Available for Metro Manila addresses only via Grab or Lalamove. Orders must be placed before <strong>2:00 PM</strong>. Rates vary based on distance and are paid directly to the rider.
                </p>
            </Col>
            <Col md={6}>
                <h5 className="fw-bold mb-3">Order Tracking</h5>
                <p className="text-muted">
                    Once your order ships, you will receive an email with your tracking number. You can also track your order status directly from your <Link to="/account" className="text-primary fw-bold">Account Dashboard</Link>.
                </p>
            </Col>
        </Row>
    </InfoPageLayout>
);

export const Returns = () => (
    <InfoPageLayout title="Returns & Exchanges" icon={RotateCcw}>
        <div className="text-center mb-5">
            <p className="lead">
                We want you to love what you ordered! If something isn't right, let us know. We offer free returns and exchanges within <strong>30 days</strong> of delivery.
            </p>
        </div>

        <h4 className="fw-bold mb-4">How to Return</h4>
        <div className="d-flex flex-column gap-3 mb-5">
            {[
                "Log in to your account and go to 'Order History'.",
                "Select the order and click 'Request Return'.",
                "Choose the items you want to return and the reason.",
                "Wait for approval, then print the prepaid shipping label sent to your email.",
                "Drop off the package at any authorized courier branch."
            ].map((step, idx) => (
                <div key={idx} className="d-flex align-items-center bg-light p-3 rounded-4">
                    <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center fw-bold text-primary me-3" style={{width:'40px', height:'40px', minWidth: '40px'}}>
                        {idx + 1}
                    </div>
                    <span>{step}</span>
                </div>
            ))}
        </div>

        <Row>
            <Col md={6} className="mb-4">
                <h5 className="fw-bold mb-3 text-success">What can be returned?</h5>
                <ul className="list-unstyled">
                    <li className="mb-2"><Check size={18} className="text-success me-2"/> Unused, unworn, and unwashed items.</li>
                    <li className="mb-2"><Check size={18} className="text-success me-2"/> Original packaging with tags attached.</li>
                    <li className="mb-2"><Check size={18} className="text-success me-2"/> Accompanied by receipt or order ID.</li>
                </ul>
            </Col>
            <Col md={6} className="mb-4">
                <h5 className="fw-bold mb-3 text-danger">Non-Returnable Items</h5>
                <ul className="list-unstyled">
                    <li className="mb-2"><Shield size={18} className="text-danger me-2"/> Swimwear and Lingerie (Hygiene)</li>
                    <li className="mb-2"><Shield size={18} className="text-danger me-2"/> Earrings and Body Jewelry</li>
                    <li className="mb-2"><Shield size={18} className="text-danger me-2"/> Sale or Clearance items</li>
                </ul>
            </Col>
        </Row>
    </InfoPageLayout>
);

// --- 3. LEGAL PAGES ---

export const Privacy = () => (
    <InfoPageLayout title="Privacy Policy" icon={Shield} lastUpdated="October 2023">
        <h5 className="fw-bold mt-4 text-dark">1. Information We Collect</h5>
        <p>We collect information you provide directly to us, such as when you create an account, make a purchase, sign up for our newsletter, or contact us for support. This may include your name, email, phone number, shipping address, and payment information.</p>

        <h5 className="fw-bold mt-4 text-dark">2. How We Use Your Information</h5>
        <p>We use the information we collect to:</p>
        <ul className="mb-4 text-muted">
            <li>Process your orders and manage your account.</li>
            <li>Send you updates, security alerts, and support messages.</li>
            <li>Personalize your shopping experience and recommend products.</li>
            <li>Detect and prevent fraudulent transactions.</li>
        </ul>

        <h5 className="fw-bold mt-4 text-dark">3. Sharing of Information</h5>
        <p>We do not sell your personal data. We only share information with third parties necessary to provide our services, such as payment processors (Stripe/GCash) and logistics partners (couriers).</p>

        <h5 className="fw-bold mt-4 text-dark">4. Cookies</h5>
        <p>We use cookies to improve your experience on our site. These small data files help us remember your cart items and preferences. You can disable cookies in your browser settings, but some site features may not function properly.</p>
    </InfoPageLayout>
);

export const Terms = () => (
    <InfoPageLayout title="Terms of Service" icon={FileText} lastUpdated="October 2023">
        <h5 className="fw-bold mt-4 text-dark">1. Acceptance of Terms</h5>
        <p>By accessing the website at Happy Cart, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

        <h5 className="fw-bold mt-4 text-dark">2. Use License</h5>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Happy Cart's website for personal, non-commercial transitory viewing only.</p>

        <h5 className="fw-bold mt-4 text-dark">3. Accuracy of Materials</h5>
        <p>The materials appearing on Happy Cart's website could include technical, typographical, or photographic errors. Happy Cart does not warrant that any of the materials on its website are accurate, complete, or current.</p>

        <h5 className="fw-bold mt-4 text-dark">4. Limitations</h5>
        <p>In no event shall Happy Cart or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials on Happy Cart's website.</p>
    </InfoPageLayout>
);

export const HelpCenter = () => (
    <InfoPageLayout title="Help Center" icon={HelpCircle}>
        <p className="text-center mb-5 lead">
            Have a question? We're here to help! Browse our frequently asked questions below.
        </p>

        {/* FAQ Accordion */}
        <Accordion defaultActiveKey="0" className="custom-accordion">
            <Accordion.Item eventKey="0" className="border-0 mb-3 shadow-sm rounded-4 overflow-hidden">
                <Accordion.Header><Globe size={20} className="me-2 text-primary"/> How do I track my order?</Accordion.Header>
                <Accordion.Body className="bg-light text-muted">
                    You can track your order by logging into your account and visiting the <Link to="/account">Order History</Link> page. Alternatively, use the tracking number sent to your email on the courier's website.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1" className="border-0 mb-3 shadow-sm rounded-4 overflow-hidden">
                <Accordion.Header><DollarSign size={20} className="me-2 text-primary"/> What payment methods do you accept?</Accordion.Header>
                <Accordion.Body className="bg-light text-muted">
                    We accept all major Credit/Debit cards (Visa, Mastercard), GCash, Maya, and Cash on Delivery (COD) for nationwide orders.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2" className="border-0 mb-3 shadow-sm rounded-4 overflow-hidden">
                <Accordion.Header><RotateCcw size={20} className="me-2 text-primary"/> Can I change or cancel my order?</Accordion.Header>
                <Accordion.Body className="bg-light text-muted">
                    We process orders quickly! You can request a cancellation within <strong>1 hour</strong> of placing your order by contacting support. Once the order status is "Processing" or "Shipped," we cannot make changes.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3" className="border-0 mb-3 shadow-sm rounded-4 overflow-hidden">
                <Accordion.Header><Globe size={20} className="me-2 text-primary"/> Do you ship internationally?</Accordion.Header>
                <Accordion.Body className="bg-light text-muted">
                    Currently, we only ship within the Philippines. We are working on expanding to international markets soon! Join our newsletter to stay updated.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4" className="border-0 mb-3 shadow-sm rounded-4 overflow-hidden">
                <Accordion.Header><Shield size={20} className="me-2 text-primary"/> I received a damaged item. What do I do?</Accordion.Header>
                <Accordion.Body className="bg-light text-muted">
                    We're so sorry about that! Please take a photo of the damaged item and email it to <a href="mailto:support@happycart.com">support@happycart.com</a> within 48 hours of delivery. We will arrange a replacement or refund immediately.
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    </InfoPageLayout>
);