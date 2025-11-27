import React from 'react';
import { Container, Accordion } from 'react-bootstrap';

// Reusable styling wrapper for consistency
const InfoPageLayout = ({ title, children }) => (
    <div className="min-vh-100 bg-white py-5 animate-fade-in">
        <Container>
            <div className="text-center mb-5">
                <h1 className="fw-bold display-4 text-dark">{title}</h1>
                <div className="mx-auto mt-3" style={{ width: '60px', height: '4px', background: 'linear-gradient(to right, #ff9a9e, #ff6b8b)' }}></div>
            </div>
            <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1rem', color: '#4a5568', lineHeight: '1.8' }}>
                {children}
            </div>
        </Container>
    </div>
);

export const About = () => (
    <InfoPageLayout title="About Happy Cart">
        <h4 className="fw-bold mb-3 text-dark">Our Story</h4>
        <p className="mb-4">
            Welcome to <strong>Happy Cart</strong>, your ultimate destination for fashion that feels as good as it looks. 
            Founded in 2023 in the vibrant heart of Manila, we started with a simple mission: to bridge the gap between high-end trends and everyday accessibility.
        </p>
        <p className="mb-5">
            We believe that style is a form of self-expression that shouldn't come with a hefty price tag. From our humble beginnings as a small online boutique, 
            we've grown into a community-driven brand that celebrates diversity, body positivity, and the joy of finding that <em>perfect</em> outfit.
        </p>

        <h4 className="fw-bold mb-3 text-dark">Our Values</h4>
        <ul className="mb-5">
            <li className="mb-2"><strong>Inclusivity First:</strong> We design for every body type, offering a wide range of sizes because style knows no number.</li>
            <li className="mb-2"><strong>Quality You Can Trust:</strong> We partner with ethical manufacturers to ensure every stitch holds up to your busy lifestyle.</li>
            <li className="mb-2"><strong>Customer Happiness:</strong> Hence our name! Your satisfaction is our north star. If you're not happy, neither are we.</li>
        </ul>

        <h4 className="fw-bold mb-3 text-dark">Sustainability Commitment</h4>
        <p>
            Fashion shouldn't cost the earth. We are actively working towards 100% compostable packaging by 2025 and are constantly refining our supply chain to minimize waste. 
            When you shop with Happy Cart, you're supporting a journey towards a greener future.
        </p>
    </InfoPageLayout>
);

export const Shipping = () => (
    <InfoPageLayout title="Shipping & Delivery">
        <p className="lead mb-4">We ship nationwide across the Philippines! Here is everything you need to know about getting your Happy Cart haul.</p>

        <h5 className="fw-bold mt-4 text-dark">Processing Time</h5>
        <p>
            Orders are processed within <strong>24-48 hours</strong> after payment confirmation. Orders placed on weekends or holidays will be processed the next business day.
        </p>

        <h5 className="fw-bold mt-4 text-dark">Shipping Rates & Times</h5>
        <div className="table-responsive mb-4">
            <table className="table table-bordered">
                <thead className="bg-light">
                    <tr>
                        <th>Region</th>
                        <th>Estimated Time</th>
                        <th>Standard Rate</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Metro Manila</td>
                        <td>2-3 Business Days</td>
                        <td>₱80 (Free over ₱1,500)</td>
                    </tr>
                    <tr>
                        <td>Luzon (Provincial)</td>
                        <td>3-5 Business Days</td>
                        <td>₱150 (Free over ₱5,000)</td>
                    </tr>
                    <tr>
                        <td>Visayas & Mindanao</td>
                        <td>5-7 Business Days</td>
                        <td>₱200</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h5 className="fw-bold mt-4 text-dark">Same-Day Delivery</h5>
        <p>
            Available for Metro Manila addresses only via Grab or Lalamove. Orders must be placed before 2:00 PM. Rates vary based on distance and are paid directly to the rider.
        </p>

        <h5 className="fw-bold mt-4 text-dark">Order Tracking</h5>
        <p>
            Once your order ships, you will receive an email with your tracking number. You can also track your order status directly from your Account Dashboard.
        </p>
    </InfoPageLayout>
);

export const Returns = () => (
    <InfoPageLayout title="Returns & Exchanges">
        <p className="mb-4">
            We want you to love what you ordered! If something isn't right, let us know. We offer free returns and exchanges within <strong>30 days</strong> of delivery.
        </p>

        <h5 className="fw-bold mt-4 text-dark">Eligibility</h5>
        <p>To be eligible for a return, your item must be:</p>
        <ul className="mb-4">
            <li>Unused, unworn, and unwashed.</li>
            <li>In the original packaging with all original tags attached.</li>
            <li>Accompanied by the receipt or proof of purchase.</li>
        </ul>

        <h5 className="fw-bold mt-4 text-dark">Non-Returnable Items</h5>
        <p>For hygiene reasons, the following items cannot be returned:</p>
        <ul className="mb-4">
            <li>Swimwear and Lingerie</li>
            <li>Earrings and Body Jewelry</li>
            <li>Beauty Products (if opened)</li>
            <li>Sale or Clearance items</li>
        </ul>

        <h5 className="fw-bold mt-4 text-dark">How to Start a Return</h5>
        <ol className="mb-4">
            <li className="mb-2">Log in to your account and go to "Order History".</li>
            <li className="mb-2">Select the order and click "Request Return".</li>
            <li className="mb-2">Choose the items you want to return and the reason.</li>
            <li className="mb-2">Print the prepaid shipping label sent to your email.</li>
            <li className="mb-2">Drop off the package at any authorized courier branch.</li>
        </ol>

        <p>
            <em>Please allow 5-7 business days for your refund to be processed after we receive your item.</em>
        </p>
    </InfoPageLayout>
);

export const Privacy = () => (
    <InfoPageLayout title="Privacy Policy">
        <p className="text-muted small mb-4">Last Updated: October 2023</p>

        <h5 className="fw-bold mt-4 text-dark">1. Information We Collect</h5>
        <p>We collect information you provide directly to us, such as when you create an account, make a purchase, sign up for our newsletter, or contact us for support. This may include your name, email, phone number, shipping address, and payment information.</p>

        <h5 className="fw-bold mt-4 text-dark">2. How We Use Your Information</h5>
        <p>We use the information we collect to:</p>
        <ul className="mb-4">
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
    <InfoPageLayout title="Terms of Service">
        <p className="text-muted small mb-4">Last Updated: October 2023</p>

        <h5 className="fw-bold mt-4 text-dark">1. Acceptance of Terms</h5>
        <p>By accessing the website at Happy Cart, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

        <h5 className="fw-bold mt-4 text-dark">2. Use License</h5>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Happy Cart's website for personal, non-commercial transitory viewing only. You may not:</p>
        <ul className="mb-4">
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose;</li>
            <li>Attempt to decompile or reverse engineer any software contained on Happy Cart's website.</li>
        </ul>

        <h5 className="fw-bold mt-4 text-dark">3. Accuracy of Materials</h5>
        <p>The materials appearing on Happy Cart's website could include technical, typographical, or photographic errors. Happy Cart does not warrant that any of the materials on its website are accurate, complete, or current.</p>

        <h5 className="fw-bold mt-4 text-dark">4. Limitations</h5>
        <p>In no event shall Happy Cart or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials on Happy Cart's website.</p>
    </InfoPageLayout>
);

export const HelpCenter = () => (
    <InfoPageLayout title="Help Center">
        <p className="text-center mb-5">Have a question? We're here to help! Browse our frequently asked questions below.</p>

        <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
                <Accordion.Header><strong>How do I track my order?</strong></Accordion.Header>
                <Accordion.Body>
                    You can track your order by logging into your account and visiting the <a href="/account">Order History</a> page. Alternatively, use the tracking number sent to your email on the courier's website.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
                <Accordion.Header><strong>What payment methods do you accept?</strong></Accordion.Header>
                <Accordion.Body>
                    We accept all major Credit/Debit cards (Visa, Mastercard), GCash, Maya, and Cash on Delivery (COD) for nationwide orders.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
                <Accordion.Header><strong>Can I change or cancel my order?</strong></Accordion.Header>
                <Accordion.Body>
                    We process orders quickly! You can request a cancellation within <strong>1 hour</strong> of placing your order by contacting support. Once the order status is "Processing" or "Shipped," we cannot make changes.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
                <Accordion.Header><strong>Do you ship internationally?</strong></Accordion.Header>
                <Accordion.Body>
                    Currently, we only ship within the Philippines. We are working on expanding to international markets soon! Join our newsletter to stay updated.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4">
                <Accordion.Header><strong>I received a damaged item. What do I do?</strong></Accordion.Header>
                <Accordion.Body>
                    We're so sorry about that! Please take a photo of the damaged item and email it to <a href="mailto:support@happycart.com">support@happycart.com</a> within 48 hours of delivery. We will arrange a replacement or refund immediately.
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>

        <div className="text-center mt-5 pt-4 border-top">
            <h5>Still need help?</h5>
            <p className="text-muted">Our team is available Monday to Friday, 9am - 6pm.</p>
            <a href="mailto:support@happycart.com" className="btn btn-primary rounded-pill px-4">Contact Support</a>
        </div>
    </InfoPageLayout>
);