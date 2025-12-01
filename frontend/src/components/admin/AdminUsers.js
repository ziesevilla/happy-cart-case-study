import React, { useState } from 'react';
import { Table, Button, Form, InputGroup, Row, Col, Card, Badge, Tab, Nav } from 'react-bootstrap';
import { Search, User, Mail, Calendar, DollarSign, ShoppingBag, CreditCard, ChevronRight, X, MapPin } from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { useOrders } from '../../context/OrderContext';
import { useTransactions } from '../../context/TransactionContext';
import { useAddress } from '../../context/AddressContext'; // 💡 1. NEW IMPORT

const AdminUsers = ({ showNotification }) => {
    // CONSUME CONTEXTS
    const { users, updateUserStatus } = useUsers();
    const { orders } = useOrders();
    const { transactions } = useTransactions();
    const { getUserAddresses } = useAddress(); // 💡 2. CONSUME ADDRESS HOOK

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null); 
    const [activeDetailTab, setActiveDetailTab] = useState('history'); 

    // --- FILTER USERS LIST ---
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- DATA LOGIC FOR SELECTED USER ---
    
    // 1. Get User Orders
    const userOrders = selectedUser 
        ? orders.filter(o => o.email === selectedUser.email).sort((a,b) => new Date(b.date) - new Date(a.date))
        : [];

    // 2. Get User Transactions
    const userOrderIds = userOrders.map(o => o.id);
    const userTransactions = selectedUser 
        ? transactions.filter(t => userOrderIds.includes(t.orderId)).sort((a,b) => new Date(b.date) - new Date(a.date))
        : [];

    // 3. Get User Spending
    const totalSpent = userOrders
        .filter(o => !['Cancelled', 'Refunded'].includes(o.status))
        .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    // 💡 4. GET USER ADDRESSES (Fixes the error)
    const userAddresses = selectedUser ? getUserAddresses(selectedUser.id) : [];

    const handleStatusToggle = (user) => {
        const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
        if(window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            updateUserStatus(user.id, newStatus);
            setSelectedUser({...user, status: newStatus});
            showNotification(`User ${newStatus === 'Active' ? 'activated' : 'suspended'} successfully`);
        }
    };

    return (
        <div className="animate-fade-in h-100">
            <Row className="h-100 g-4">
                
                {/* --- LEFT COLUMN: USER LIST --- */}
                <Col md={selectedUser ? 5 : 12} className={`d-flex flex-column ${selectedUser ? 'd-none d-md-flex' : ''}`}>
                    
                    {/* Header & Search */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold mb-0">Users</h4>
                        <div style={{ width: '200px' }}>
                            <InputGroup size="sm">
                                <InputGroup.Text className="bg-white border-end-0"><Search size={16} className="text-muted"/></InputGroup.Text>
                                <Form.Control 
                                    placeholder="Search users..." 
                                    className="border-start-0 ps-0 shadow-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                    </div>

                    {/* Scrollable User List */}
                    <Card className="border-0 shadow-sm flex-grow-1 overflow-hidden">
                        <div className="overflow-auto h-100">
                            <Table hover className="mb-0 align-middle table-borderless">
                                <thead className="bg-light sticky-top" style={{zIndex: 1}}>
                                    <tr>
                                        <th className="ps-4 text-muted small">Name</th>
                                        <th className="text-muted small">Status</th>
                                        <th className="text-end pe-4 text-muted small">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr 
                                            key={user.id} 
                                            onClick={() => setSelectedUser(user)}
                                            style={{ cursor: 'pointer', backgroundColor: selectedUser?.id === user.id ? '#f0f9ff' : 'transparent' }}
                                            className="border-bottom"
                                        >
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width: '35px', height: '35px', fontSize: '0.9rem'}}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{user.name}</div>
                                                        <small className="text-muted">{user.role}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={user.status === 'Active' ? 'success' : 'danger'} className="fw-normal rounded-pill px-3">
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                <ChevronRight size={16} className="text-muted" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </Col>

                {/* --- RIGHT COLUMN: DETAILED PROFILE --- */}
                {selectedUser && (
                    <Col md={7} className="h-100 animate-slide-in-right">
                        <Card className="border-0 shadow-sm h-100 overflow-hidden">
                            
                            {/* Profile Header */}
                            <div className="p-4 border-bottom bg-light">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-primary text-white rounded-4 d-flex align-items-center justify-content-center fw-bold display-6" style={{width: '70px', height: '70px'}}>
                                            {selectedUser.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="fw-bold mb-0">{selectedUser.name}</h3>
                                            <div className="d-flex align-items-center gap-2 text-muted mt-1">
                                                <Mail size={14}/> {selectedUser.email}
                                            </div>
                                            <div className="d-flex align-items-center gap-2 text-muted mt-1">
                                                <Calendar size={14}/> Joined: {selectedUser.joined}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="light" size="sm" className="rounded-circle p-2" onClick={() => setSelectedUser(null)}>
                                        <X size={20} />
                                    </Button>
                                </div>

                                <Row className="g-3 mt-2">
                                    <Col xs={6}>
                                        <div className="bg-white p-3 rounded-3 border">
                                            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Total Spent</small>
                                            <h4 className="fw-bold text-primary mb-0 mt-1">₱{totalSpent.toLocaleString()}</h4>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="bg-white p-3 rounded-3 border">
                                            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Total Orders</small>
                                            <h4 className="fw-bold text-dark mb-0 mt-1">{userOrders.length}</h4>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="mt-4 d-flex gap-2">
                                    <Button 
                                        variant={selectedUser.status === 'Active' ? 'outline-danger' : 'outline-success'} 
                                        size="sm" 
                                        className="rounded-pill px-4 fw-bold"
                                        onClick={() => handleStatusToggle(selectedUser)}
                                    >
                                        {selectedUser.status === 'Active' ? 'Suspend User' : 'Activate User'}
                                    </Button>
                                    <Button variant="outline-dark" size="sm" className="rounded-pill px-4 fw-bold">
                                        Reset Password
                                    </Button>
                                </div>
                            </div>

                            {/* DETAILED TABS */}
                            <div className="flex-grow-1 overflow-hidden d-flex flex-column">
                                <Tab.Container activeKey={activeDetailTab} onSelect={(k) => setActiveDetailTab(k)}>
                                    <div className="px-4 pt-3 border-bottom">
                                        <Nav variant="tabs" className="border-bottom-0">
                                            <Nav.Item>
                                                <Nav.Link eventKey="history" className="text-dark fw-bold small text-uppercase">
                                                    <ShoppingBag size={14} className="me-2 mb-1"/>Order History
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="transactions" className="text-dark fw-bold small text-uppercase">
                                                    <CreditCard size={14} className="me-2 mb-1"/>Transactions
                                                </Nav.Link>
                                            </Nav.Item>
                                            {/* 💡 3. ADDRESS TAB */}
                                            <Nav.Item>
                                                <Nav.Link eventKey="addresses" className="text-dark fw-bold small text-uppercase">
                                                    <MapPin size={14} className="me-2 mb-1"/>Addresses
                                                </Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </div>

                                    <div className="p-0 overflow-auto flex-grow-1 bg-white">
                                        <Tab.Content>
                                            {/* ORDER HISTORY TAB */}
                                            <Tab.Pane eventKey="history">
                                                {userOrders.length > 0 ? (
                                                    <Table hover responsive className="mb-0 align-middle">
                                                        <thead className="bg-light sticky-top">
                                                            <tr>
                                                                <th className="ps-4 text-muted small">Order ID</th>
                                                                <th className="text-muted small">Date</th>
                                                                <th className="text-muted small">Total</th>
                                                                <th className="text-muted small">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {userOrders.map(order => (
                                                                <tr key={order.id}>
                                                                    <td className="ps-4 fw-bold text-primary small">{order.id}</td>
                                                                    <td className="small">{order.date}</td>
                                                                    <td className="fw-bold small">₱{order.total.toLocaleString()}</td>
                                                                    <td>
                                                                        <Badge bg={
                                                                            order.status === 'Delivered' ? 'success' : 
                                                                            order.status === 'Cancelled' ? 'danger' : 'warning'
                                                                        } className="fw-normal rounded-pill" style={{fontSize: '0.7rem'}}>
                                                                            {order.status}
                                                                        </Badge>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                ) : (
                                                    <div className="text-center py-5 text-muted">
                                                        <ShoppingBag size={32} className="mb-2 opacity-50"/>
                                                        <p>No orders found for this user.</p>
                                                    </div>
                                                )}
                                            </Tab.Pane>

                                            {/* TRANSACTIONS TAB */}
                                            <Tab.Pane eventKey="transactions">
                                                {userTransactions.length > 0 ? (
                                                    <Table hover responsive className="mb-0 align-middle">
                                                        <thead className="bg-light sticky-top">
                                                            <tr>
                                                                <th className="ps-4 text-muted small">Trans ID</th>
                                                                <th className="text-muted small">Order Ref</th>
                                                                <th className="text-muted small">Method</th>
                                                                <th className="text-muted small">Amount</th>
                                                                <th className="text-muted small">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {userTransactions.map(trx => (
                                                                <tr key={trx.id}>
                                                                    <td className="ps-4 text-muted small">{trx.id}</td>
                                                                    <td className="text-primary small fw-bold">{trx.orderId}</td>
                                                                    <td className="small">{trx.method}</td>
                                                                    <td className="fw-bold small">₱{trx.amount.toLocaleString()}</td>
                                                                    <td>
                                                                        <span className={`small fw-bold ${trx.status === 'Paid' ? 'text-success' : 'text-danger'}`}>
                                                                            {trx.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                ) : (
                                                    <div className="text-center py-5 text-muted">
                                                        <CreditCard size={32} className="mb-2 opacity-50"/>
                                                        <p>No transactions found for this user.</p>
                                                    </div>
                                                )}
                                            </Tab.Pane>

                                            {/* 💡 4. ADDRESS TAB CONTENT */}
                                            <Tab.Pane eventKey="addresses">
                                                <div className="p-4">
                                                    {userAddresses.length > 0 ? (
                                                        <Row className="g-3">
                                                            {userAddresses.map(addr => (
                                                                <Col xs={12} key={addr.id}>
                                                                    <div className="p-3 border rounded-3 bg-light position-relative">
                                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <MapPin size={16} className="text-primary"/>
                                                                                <span className="fw-bold">{addr.label}</span>
                                                                                {addr.default && <Badge bg="primary" style={{fontSize: '0.6rem'}}>Default</Badge>}
                                                                            </div>
                                                                        </div>
                                                                        <div className="small text-muted ps-4">
                                                                            <div className="text-dark fw-bold">{addr.firstName} {addr.lastName}</div>
                                                                            <div>{addr.street}</div>
                                                                            <div>{addr.city}, {addr.zip}</div>
                                                                            <div className="mt-1">📞 {addr.phone}</div>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            ))}
                                                        </Row>
                                                    ) : (
                                                        <div className="text-center py-5 text-muted">
                                                            <MapPin size={32} className="mb-2 opacity-50"/>
                                                            <p>No addresses found for this user.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Tab.Pane>

                                        </Tab.Content>
                                    </div>
                                </Tab.Container>
                            </div>
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default AdminUsers;