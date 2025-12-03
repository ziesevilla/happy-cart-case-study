import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Toast, ToastContainer, Spinner } from 'react-bootstrap'; // 💡 Added Spinner
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext'; 
import { useReviews } from '../context/ReviewContext'; 
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../components/account/ProfileSidebar';
import OrdersTab from '../components/account/OrdersTab';
import AddressTab from '../components/account/AddressTab';
import AdminDashboard from '../components/admin/AdminDashboard'; 
import './styles/Account.css';

const Account = () => {
    // 💡 FIX 1: Get 'loading' state from AuthContext
    const { user, loading } = useAuth();
    
    const { orders } = useOrders(); 
    const { reviews } = useReviews(); 

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders'); 
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    // 💡 FIX 2: Handle the Redirect Logic correctly
    useEffect(() => {
        // Only redirect if we are DONE loading and there is NO user
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // 💡 FIX 3: Show a Loading Spinner while checking the token
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    // If not loading and no user, return null (waiting for redirect)
    if (!user) return null;

    // --- CALCULATION LOGIC ---
    const userOrders = orders.filter(order => order.email === user.email);
    const orderCount = userOrders.length;
    const totalSpent = userOrders.reduce((acc, order) => acc + order.total, 0);
    const reviewCount = reviews.filter(r => r.user === user.name).length;

    let memberTier = 'Bronze';
    if (totalSpent > 50000) memberTier = 'Platinum';
    else if (totalSpent > 20000) memberTier = 'Gold';
    else if (totalSpent > 5000) memberTier = 'Silver';

    const showNotification = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    // --- ADMIN VIEW ---
    if (user.role && user.role.toLowerCase() === 'admin') {
        return <AdminDashboard />;
    }

    // --- CUSTOMER VIEW ---
    return (
        <div className="account-page py-5">
            <Container>
                <Row className="g-5">
                    {/* LEFT SIDEBAR */}
                    <Col lg={4}>
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