import React, { useState } from 'react';
import { Container, Row, Col, Button, Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext'; 
import { useReviews } from '../context/ReviewContext'; // 💡 1. Import Review Context
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../components/account/ProfileSidebar';
import OrdersTab from '../components/account/OrdersTab';
import AddressTab from '../components/account/AddressTab';
import AdminDashboard from '../components/admin/AdminDashboard'; 
import './styles/Account.css';

const Account = () => {
    const { user } = useAuth();
    const { orders } = useOrders(); 
    const { reviews } = useReviews(); // 💡 2. Get reviews

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders'); 
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    if (!user) {
        navigate('/login');
        return null;
    }

    // --- CALCULATION LOGIC ---
    
    // 1. Get User Orders
    const userOrders = orders.filter(order => order.email === user.email);
    const orderCount = userOrders.length;

    // 2. Calculate Total Spent
    const totalSpent = userOrders.reduce((acc, order) => acc + order.total, 0);

    // 3. Calculate Reviews Written 
    // (Matching by user name, as reviews usually store the name)
    const reviewCount = reviews.filter(r => r.user === user.name).length;

    // 4. Calculate Loyalty Tier
    let memberTier = 'Bronze';
    if (totalSpent > 50000) memberTier = 'Platinum';
    else if (totalSpent > 20000) memberTier = 'Gold';
    else if (totalSpent > 5000) memberTier = 'Silver';

    const showNotification = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    // --- ADMIN VIEW ---
    if (user.role === 'admin') {
        return <AdminDashboard />;
    }

    // --- CUSTOMER VIEW ---
    return (
        <div className="account-page py-5">
            <Container>
                <Row className="g-5">
                    {/* LEFT SIDEBAR */}
                    <Col lg={4}>
                        {/* 💡 PASS ALL CALCULATED PROPS */}
                        <ProfileSidebar 
                            showNotification={showNotification} 
                            orderCount={orderCount} 
                            totalSpent={totalSpent}
                            reviewCount={reviewCount}
                            memberTier={memberTier}
                        />
                    </Col>

                    {/* RIGHT CONTENT */}
                    <Col lg={8}>
                        <div className="d-flex gap-3 mb-4 border-bottom pb-3">
                            <Button 
                                className={`rounded-pill px-4 fw-bold ${activeTab === 'orders' ? 'tab-active' : 'tab-inactive'}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                Order History
                            </Button>
                            <Button 
                                className={`rounded-pill px-4 fw-bold ${activeTab === 'addresses' ? 'tab-active' : 'tab-inactive'}`}
                                onClick={() => setActiveTab('addresses')}
                            >
                                My Addresses
                            </Button>
                        </div>

                        {activeTab === 'orders' ? (
                            <OrdersTab showNotification={showNotification} />
                        ) : (
                            <AddressTab />
                        )}
                    </Col>
                </Row>

                <ToastContainer className="toast-container">
                    <Toast onClose={() => setToast({...toast, show: false})} show={toast.show} delay={3000} autohide bg={toast.variant}>
                        <Toast.Body className="text-white fw-bold">{toast.message}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </Container>
        </div>
    );
};

export default Account;