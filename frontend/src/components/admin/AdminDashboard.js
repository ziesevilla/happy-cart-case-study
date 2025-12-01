import React, { useState, useEffect } from 'react';
import { Container, Button, Tab, Nav, Row, Col, Card, Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, ShoppingBag, Users, TrendingUp, Settings, FileText, CreditCard } from 'lucide-react';

// 💡 IMPORT CONTEXTS
import { useOrders } from '../../context/OrderContext';
import { useUsers } from '../../context/UserContext';
import { useTransactions } from '../../context/TransactionContext';

import AdminInventory from './AdminInventory';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import AdminTransactions from './AdminTransactions';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    // 💡 CONSUME DATA FROM CONTEXTS
    const { orders } = useOrders();
    const { users } = useUsers();
    const { transactions } = useTransactions();

    const [activeTab, setActiveTab] = useState('orders'); 
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    // 💡 STATE FOR DASHBOARD STATS
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeOrders: 0,
        totalCustomers: 0,
        refundsProcessed: 0
    });

    // 💡 CALCULATE STATS DYNAMICALLY
    useEffect(() => {
        // 1. Calculate Total Revenue (Sum of 'Paid' transactions)
        // Alternatively, you could sum order totals where status != Cancelled
        const revenue = transactions
            .filter(t => t.status === 'Paid')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        // 2. Calculate Active Orders (Pending, Processing, Shipped)
        const active = orders.filter(o => 
            ['Pending', 'Processing', 'Shipped', 'Placed'].includes(o.status)
        ).length;

        // 3. Calculate Total Customers
        const customerCount = users.filter(u => u.role === 'Customer').length;

        // 4. Calculate Refunds (Sum of 'Refunded' transactions)
        const refunds = transactions
            .filter(t => t.status === 'Refunded')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        // 5. Update State
        setStats({
            totalRevenue: revenue,
            activeOrders: active,
            totalCustomers: customerCount,
            refundsProcessed: refunds
        });

    }, [orders, users, transactions]); // Re-run whenever context data changes

    const handleLogout = () => {
        if(window.confirm("Are you sure you want to log out?")) {
            logout();
            navigate('/');
        }
    };

    const showNotification = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    return (
        <div className="account-page py-5" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <Container fluid className="px-5">
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-bold mb-1 text-dark">Admin Portal</h2>
                        <p className="text-muted">Overview and Management</p>
                    </div>
                    <Button variant="danger" className="rounded-pill px-4 d-flex align-items-center" onClick={handleLogout}>
                        <LogOut size={18} className="me-2" /> Logout
                    </Button>
                </div>

                {/* KPI STATS ROW (DYNAMIC DATA) */}
                <Row className="g-4 mb-5">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm rounded-4 bg-primary text-white h-100">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="bg-white bg-opacity-25 p-2 rounded-3"><ShoppingBag size={24}/></div>
                                </div>
                                <h3 className="fw-bold mb-0 text-white">₱{stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                                <small className="opacity-75">Total Revenue (Paid)</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="bg-light p-2 rounded-3 text-success"><Package size={24}/></div>
                                </div>
                                <h3 className="fw-bold mb-0">{stats.activeOrders}</h3>
                                <small className="text-muted">Active Orders</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="bg-light p-2 rounded-3 text-warning"><Users size={24}/></div>
                                </div>
                                <h3 className="fw-bold mb-0">{stats.totalCustomers.toLocaleString()}</h3>
                                <small className="text-muted">Total Customers</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="bg-light p-2 rounded-3 text-info"><CreditCard size={24}/></div>
                                </div>
                                <h3 className="fw-bold mb-0">₱{stats.refundsProcessed.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                                <small className="text-muted">Refunds Processed</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* MAIN CONTENT TABS */}
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    <Row>
                        <Col md={2} className="mb-4">
                            {/* STICKY SIDEBAR */}
                            <div style={{ position: 'sticky', top: '100px', zIndex: 10 }}>
                                <Nav variant="pills" className="flex-column bg-white p-3 rounded-4 shadow-sm border">
                                    <Nav.Item className="mb-1">
                                        <Nav.Link 
                                            eventKey="orders" 
                                            className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'orders' ? 'text-white' : 'text-dark'}`}
                                        >
                                            <ShoppingBag size={18} className="me-3"/> Orders
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className="mb-1">
                                        <Nav.Link 
                                            eventKey="inventory" 
                                            className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'inventory' ? 'text-white' : 'text-dark'}`}
                                        >
                                            <Package size={18} className="me-3"/> Inventory
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className="mb-1">
                                        <Nav.Link 
                                            eventKey="users" 
                                            className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'users' ? 'text-white' : 'text-dark'}`}
                                        >
                                            <Users size={18} className="me-3"/> Users
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className="mb-1">
                                        <Nav.Link 
                                            eventKey="transactions" 
                                            className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'transactions' ? 'text-white' : 'text-dark'}`}
                                        >
                                            <CreditCard size={18} className="me-3"/> Transactions
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className="mb-1">
                                        <Nav.Link 
                                            eventKey="reports" 
                                            className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'reports' ? 'text-white' : 'text-dark'}`}
                                        >
                                            <FileText size={18} className="me-3"/> Reports
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link 
                                            eventKey="settings" 
                                            className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'settings' ? 'text-white' : 'text-dark'}`}
                                        >
                                            <Settings size={18} className="me-3"/> Settings
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </div>
                        </Col>

                        <Col md={10}>
                            <Tab.Content>
                                <Tab.Pane eventKey="orders"><AdminOrders showNotification={showNotification} /></Tab.Pane>
                                <Tab.Pane eventKey="inventory"><AdminInventory showNotification={showNotification} /></Tab.Pane>
                                <Tab.Pane eventKey="users"><AdminUsers showNotification={showNotification} /></Tab.Pane>
                                <Tab.Pane eventKey="transactions"><AdminTransactions showNotification={showNotification} /></Tab.Pane>
                                <Tab.Pane eventKey="reports"><AdminReports showNotification={showNotification} /></Tab.Pane>
                                <Tab.Pane eventKey="settings"><AdminSettings showNotification={showNotification} /></Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>

                <ToastContainer position="bottom-end" className="p-3 position-fixed">
                    <Toast onClose={() => setToast({...toast, show: false})} show={toast.show} delay={3000} autohide bg={toast.variant}>
                        <Toast.Body className="text-white fw-bold">{toast.message}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </Container>
        </div>
    );
};

export default AdminDashboard;