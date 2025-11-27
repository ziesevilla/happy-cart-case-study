import React, { useState } from 'react';
import { Container, Row, Col, Button, Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../components/account/ProfileSidebar';
import OrdersTab from '../components/account/OrdersTab';
import AddressTab from '../components/account/AddressTab';
import AdminDashboard from '../components/admin/AdminDashboard'; // NEW IMPORT
import './Account.css';

const Account = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders'); 
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    if (!user) {
        // Ideally handled by a ProtectedRoute wrapper, but fine for now
        navigate('/login');
        return null;
    }

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
                        <ProfileSidebar showNotification={showNotification} />
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