import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext'; 
import { useReviews } from '../context/ReviewContext'; 
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../components/account/ProfileSidebar';
import OrdersTab from '../components/account/OrdersTab';
import AddressTab from '../components/account/AddressTab';
import AdminDashboard from '../components/admin/AdminDashboard'; 
import './styles/Account.css';

/**
 * Account Component
 * * The central hub for user profile management.
 */
const Account = () => {
    // --- CONTEXT HOOKS ---
    const { user, loading } = useAuth();
    
    // Fetch global data to calculate personal stats
    const { orders } = useOrders(); 
    const { reviews } = useReviews(); 

    // --- LOCAL STATE ---
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders'); // Toggles between Order History and Address Book
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    // --- AUTHENTICATION PROTECTION ---
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!user) return null;

    // --- DATA AGGREGATION & LOGIC ---
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
        // 💡 STYLE FIX: Added inline style to force a whitish/light-gray background
        // and minHeight to ensure the whole page is covered.
        <div className="account-page py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Container>
                <Row className="g-5">
                    
                    {/* LEFT SIDEBAR: User Profile & Stats */}
                    <Col lg={4}>
                        <ProfileSidebar 
                            showNotification={showNotification} 
                            orderCount={orderCount} 
                            totalSpent={totalSpent}
                            reviewCount={reviewCount}
                            memberTier={memberTier}
                        />
                    </Col>

                    {/* RIGHT CONTENT: Tabs for Orders & Addresses */}
                    <Col lg={8}>
                        {/* Tab Navigation Buttons (White Inactive Style Preserved) */}
                        <div className="d-flex gap-3 mb-4 border-bottom pb-3">
                            <Button 
                                variant={activeTab === 'orders' ? 'primary' : 'light'}
                                className={`rounded-pill px-4 fw-bold ${
                                    activeTab === 'orders' 
                                        ? 'tab-active shadow' 
                                        : 'bg-white text-secondary border-0 shadow-sm'
                                }`}
                                onClick={() => setActiveTab('orders')}
                            >
                                Order History
                            </Button>
                            
                            <Button 
                                variant={activeTab === 'addresses' ? 'primary' : 'light'}
                                className={`rounded-pill px-4 fw-bold ${
                                    activeTab === 'addresses' 
                                        ? 'tab-active shadow' 
                                        : 'bg-white text-secondary border-0 shadow-sm'
                                }`}
                                onClick={() => setActiveTab('addresses')}
                            >
                                My Addresses
                            </Button>
                        </div>

                        {/* Conditional Rendering of Tab Content */}
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