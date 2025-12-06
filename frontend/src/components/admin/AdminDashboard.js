import React, { useState, useEffect } from 'react';
import { Container, Nav, Row, Col, Card, Tab, Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, ShoppingBag, Users, Settings, FileText, CreditCard } from 'lucide-react';

// 💡 IMPORT CONTEXTS (Data Sources)
import { useOrders } from '../../context/OrderContext';
import { useUsers } from '../../context/UserContext';
import { useTransactions } from '../../context/TransactionContext';

// 💡 IMPORT SUB-COMPONENTS (Tabs)
import AdminInventory from './AdminInventory';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import AdminTransactions from './AdminTransactions';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';

/**
 * AdminDashboard Component
 * * The central hub for administrators.
 * * Aggregates data from all contexts to display high-level KPIs.
 * * Manages the "Active Tab" state to switch between different management views.
 */
const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // 1. Consume Data
    // We pull raw data from our contexts to calculate statistics on the fly.
    const { orders } = useOrders();
    const { users } = useUsers();
    const { transactions } = useTransactions();

    const [activeTab, setActiveTab] = useState('orders'); 
    
    // Global Toast Notification for all child tabs
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    // Dashboard Statistics State
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeOrders: 0,
        totalCustomers: 0,
        refundsProcessed: 0
    });

    /**
     * 2. Dynamic Metric Calculation
     * * This runs automatically whenever orders, users, or transactions change.
     * * It ensures the "cards" at the top always show real-time numbers.
     */
    useEffect(() => {
        // A. Calculate Total Revenue (Sum of all 'Paid' transactions)
        const revenue = transactions
            .filter(t => t.status === 'Paid')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        // B. Calculate Active Orders (Everything NOT Delivered/Cancelled)
        const active = orders.filter(o => 
            ['Pending', 'Processing', 'Shipped', 'Placed'].includes(o.status)
        ).length;

        // C. Calculate Total Customers
        const customerCount = users.filter(u => u.role === 'Customer').length;

        // D. Calculate Refunds (Lost Revenue)
        const refunds = transactions
            .filter(t => t.status === 'Refunded')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        // Update UI
        setStats({
            totalRevenue: revenue,
            activeOrders: active,
            totalCustomers: customerCount,
            refundsProcessed: refunds
        });

    }, [orders, users, transactions]); 

    const handleLogout = () => {
        if(window.confirm("Are you sure you want to log out?")) {
            logout();
            navigate('/');
        }
    };

    // Helper passed down to child components so they can trigger alerts
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
                </div>

                {/* ======================================================== */}
                {/* KPI STATS ROW (The "Heads Up Display") */}
                {/* ======================================================== */}
                <Row className="g-4 mb-5">
                    {/* Revenue Card */}
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
                    
                    {/* Active Orders Card */}
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

                    {/* Customers Card */}
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

                    {/* Refunds Card */}
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

                {/* ======================================================== */}
                {/* MAIN CONTENT AREA (Tabbed Interface) */}
                {/* ======================================================== */}
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    <Row>
                        {/* SIDEBAR NAVIGATION */}
                        <Col md={2} className="mb-4">
                            {/* Sticky Sidebar: Keeps nav in view while scrolling long lists */}
                            <div style={{ position: 'sticky', top: '100px', zIndex: 10 }}>
                                <Nav variant="pills" className="flex-column bg-white p-3 rounded-4 shadow-sm border">
                                    <Nav.Item className="mb-1">
                                        <Nav.Link eventKey="orders" className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'orders' ? 'text-white' : 'text-dark'}`}>
                                            <ShoppingBag size={18} className="me-3"/> Orders
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className="mb-1">
                                        <Nav.Link eventKey="inventory" className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'inventory' ? 'text-white' : 'text-dark'}`}>
                                            <Package size={18} className="me-3"/> Inventory
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className="mb-1">
                                        <Nav.Link eventKey="users" className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'users' ? 'text-white' : 'text-dark'}`}>
                                            <Users size={18} className="me-3"/> Customers
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className="mb-1">
                                        <Nav.Link eventKey="transactions" className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'transactions' ? 'text-white' : 'text-dark'}`}>
                                            <CreditCard size={18} className="me-3"/> Transactions
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className="mb-1">
                                        <Nav.Link eventKey="reports" className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'reports' ? 'text-white' : 'text-dark'}`}>
                                            <FileText size={18} className="me-3"/> Reports
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="settings" className={`fw-bold py-3 d-flex align-items-center rounded-3 ${activeTab === 'settings' ? 'text-white' : 'text-dark'}`}>
                                            <Settings size={18} className="me-3"/> Settings
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </div>
                        </Col>

                        {/* CONTENT PANELS */}
                        <Col md={10}>
                            <Tab.Content>
                                {/* We pass 'showNotification' down so children can trigger Toasts */}
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

                {/* Global Toast Container */}
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