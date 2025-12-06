import React, { useState } from 'react';
import { Table, Button, Form, InputGroup, Row, Col, Card, Badge, Tab, Nav, Modal, Spinner, Pagination } from 'react-bootstrap';
import { Search, User, Mail, Calendar, ShoppingBag, CreditCard, ChevronRight, X, MapPin, Download, AlertTriangle, Key, Lock, UserX, Phone } from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { useOrders } from '../../context/OrderContext';
import { useTransactions } from '../../context/TransactionContext';
import { useAddress } from '../../context/AddressContext'; 

/**
 * AdminUsers Component
 * * A comprehensive dashboard view for managing customer accounts.
 * * Features: User list with search & pagination, detailed profile view (Orders/Transactions/Address),
 * * and administrative actions (Suspend/Activate, Password Reset).
 */
const AdminUsers = ({ showNotification }) => {
    // --- CONTEXT HOOKS ---
    // Fetch global state for users, orders, transactions, and addresses
    const { users, updateUserStatus, loading } = useUsers();
    const { orders } = useOrders();
    const { transactions } = useTransactions();
    const { getUserAddresses } = useAddress(); 

    // --- LOCAL STATE MANAGEMENT ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null); // Stores the full object of the currently viewed user
    const [activeDetailTab, setActiveDetailTab] = useState('history'); // Controls the Tabs in the detail view

    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; 

    // MODAL STATES
    // State for the "Suspend/Activate" confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToToggle, setUserToToggle] = useState(null);
    
    // State for the "Reset Password" modal
    const [showResetModal, setShowResetModal] = useState(false);
    const [userToReset, setUserToReset] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

    // Early return for loading state to prevent rendering empty tables
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    // --- FILTERING ---
    // Filters users based on name or email (case-insensitive)
    const filteredUsers = users.filter(u => 
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- PAGINATION LOGIC ---
    // Calculate indices to slice the filtered user array
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    // Handles page switching and resets selected user view
    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        setSelectedUser(null);
    };

    // --- PAGINATION RENDERING HELPER ---
    // Generates the array of pagination items (Numbers, Ellipsis, Prev/Next buttons)
    const renderPaginationItems = () => {
        let items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust startPage if we are near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        items.push(<Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />);
        items.push(<Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />);

        if (startPage > 1) items.push(<Pagination.Ellipsis key="start-ellipsis" />);

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>
            );
        }

        if (endPage < totalPages) items.push(<Pagination.Ellipsis key="end-ellipsis" />);
        
        items.push(<Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />);
        items.push(<Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />);

        return items;
    };

    // --- DATA AGGREGATION FOR SELECTED USER ---
    // Only runs when a user is selected to populate the detail tabs
    
    // 1. Filter and sort orders for the selected user
    const userOrders = selectedUser 
        ? orders.filter(o => o.email === selectedUser.email).sort((a,b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
        : [];

    // 2. Filter transactions linked to those orders
    const userOrderIds = userOrders.map(o => o.id);
    const userTransactions = selectedUser 
        ? transactions.filter(t => userOrderIds.includes(t.orderId))
        : [];

    // 3. Calculate total lifetime spend (excluding cancelled/refunded)
    const totalSpent = userOrders
        .filter(o => !['Cancelled', 'Refunded'].includes(o.status))
        .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    // 4. Fetch addresses using the context helper
    const userAddresses = selectedUser ? getUserAddresses(selectedUser.id) : [];

    // --- ACTION HANDLERS ---

    const handleExportUser = () => {
        if (!selectedUser) return;
        showNotification("Download started...", "info");
    };

    // Prepares the user for status toggling (Suspend/Activate)
    const handleStatusToggle = (user) => {
        setUserToToggle(user);
        setShowConfirmModal(true);
    };

    // Executes the status update via Context
    const confirmAction = () => {
        if (!userToToggle) return;
        const newStatus = userToToggle.status === 'Active' ? 'Suspended' : 'Active';
        updateUserStatus(userToToggle.id, newStatus);
        
        // Update local selected state if the modified user is currently being viewed
        if (selectedUser && selectedUser.id === userToToggle.id) {
            setSelectedUser({ ...userToToggle, status: newStatus });
        }
        
        showNotification(`User ${newStatus === 'Active' ? 'activated' : 'suspended'} successfully`);
        setShowConfirmModal(false);
        setUserToToggle(null);
    };

    // Prepares user for password reset
    const handleResetPassword = () => {
        if (!selectedUser) return;
        setUserToReset(selectedUser);
        setShowResetModal(true);
    };

    // Simulates an API call for password reset
    const confirmReset = () => {
        setIsResetting(true);
        setTimeout(() => {
            setIsResetting(false);
            setShowResetModal(false);
            showNotification(`Password reset link sent to ${userToReset.email}`, 'success');
            setUserToReset(null);
        }, 1500);
    };

    return (
        <div className="animate-fade-in h-100">
            <Row className="h-100 g-4">
                
                {/* LEFT COLUMN: USER LIST */}
                {/* On mobile: Hides this column if a user is selected to show details instead */}
                <Col md={selectedUser ? 5 : 12} className={`d-flex flex-column ${selectedUser ? 'd-none d-md-flex' : ''}`}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center mb-4">
                            <div className="bg-white p-2 rounded-circle shadow-sm me-3 border">
                                <User size={24} className="text-primary"/>
                            </div>
                            <div>
                                <h4 className="fw-bold mb-0">Customers</h4>
                                <p className="text-muted small mb-0">Manage customer accounts</p>
                            </div>
                        </div>
                        <div style={{ width: '300px'}}>
                            <InputGroup size="sm" className="border rounded-pill bg-white overflow-hidden">
                                <InputGroup.Text className="bg-white border-0 pe-0">
                                    <Search size={16} className="text-muted"/>
                                </InputGroup.Text>
                                {/* Search Input: Resets to page 1 on change */}
                                <Form.Control 
                                    placeholder="Search customer..." 
                                    className="border-0 shadow-none ps-2" 
                                    value={searchTerm}
                                    onChange={(e) => { 
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); 
                                    }}
                                />
                            </InputGroup>
                        </div>
                    </div>

                    <Card className="border-0 shadow-sm flex-grow-1 overflow-hidden">
                        <div>
                            <Table hover className="mb-0 align-middle table-borderless">
                                <thead className="bg-light sticky-top" style={{zIndex: 1}}>
                                    <tr>
                                        <th className="ps-4 text-muted small">Name</th>
                                        <th className="text-muted small">Status</th>
                                        <th className="text-end pe-4 text-muted small">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.length > 0 ? (
                                        currentUsers.map(user => (
                                            <tr 
                                                key={user.id} 
                                                onClick={() => setSelectedUser(user)}
                                                style={{ cursor: 'pointer', backgroundColor: selectedUser?.id === user.id ? '#f0f9ff' : 'transparent' }}
                                                className="border-bottom"
                                            >
                                                <td className="ps-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        {/* Avatar Initials */}
                                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width: '35px', height: '35px', fontSize: '0.9rem'}}>
                                                            {(user.name || '?').charAt(0)}
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
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="text-center py-5 text-muted">No customers found.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                        
                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <Card.Footer className="bg-white border-top d-flex justify-content-between align-items-center py-3 px-4">
                                <div className="small text-muted">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
                                </div>
                                <Pagination size="sm" className="mb-0">
                                    {renderPaginationItems()}
                                </Pagination>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>

                {/* RIGHT COLUMN: PROFILE DETAILS */}
                {/* Shows detailed view when a user is selected */}
                {selectedUser && (
                    <Col md={7} className="h-100 animate-slide-in-right">
                        <Card className="border-0 shadow-sm h-100 overflow-hidden">
                            {/* Profile Header Section */}
                            <div className="p-4 border-bottom bg-light">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-primary text-white rounded-4 d-flex align-items-center justify-content-center fw-bold display-6" style={{width: '70px', height: '70px'}}>
                                            {(selectedUser.name || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="fw-bold mb-0">{selectedUser.name}</h3>
                                            <div className="d-flex align-items-center gap-2 text-muted mt-1">
                                                <Mail size={14}/> {selectedUser.email}
                                            </div>
                                            <div className="d-flex align-items-center gap-3 mt-1 text-muted small">
                                                {selectedUser.phone && (
                                                    <span><Phone size={14} className="me-1"/>{selectedUser.phone}</span>
                                                )}
                                                {selectedUser.gender && (
                                                    <span><User size={14} className="me-1"/>{selectedUser.gender}</span>
                                                )}
                                                {selectedUser.dob && (
                                                    <span><Calendar size={14} className="me-1"/>{selectedUser.dob}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Close Button for Details View */}
                                    <Button variant="light" size="sm" className="rounded-circle p-2" onClick={() => setSelectedUser(null)}>
                                        <X size={20} />
                                    </Button>
                                </div>

                                {/* Stats Summary */}
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

                                {/* User Action Buttons */}
                                <div className="mt-4 d-flex flex-wrap gap-2">
                                    <Button 
                                        variant={selectedUser.status === 'Active' ? 'outline-danger' : 'outline-success'} 
                                        size="sm" 
                                        className="rounded-pill px-4 fw-bold"
                                        onClick={() => handleStatusToggle(selectedUser)}
                                    >
                                        <UserX size={16} className="me-2"/> {selectedUser.status === 'Active' ? 'Suspend User' : 'Activate User'}
                                    </Button>
                                    <Button variant="outline-primary" size="sm" className="rounded-pill px-4 fw-bold" onClick={handleExportUser}>
                                        <Download size={16} className="me-2"/> Export Data
                                    </Button>
                                    <Button variant="outline-dark" size="sm" className="rounded-pill px-4 fw-bold" onClick={handleResetPassword}>
                                        <Key size={16} className="me-2"/> Reset Password
                                    </Button>
                                </div>
                            </div>

                            {/* Detail Tabs (History, Transactions, Addresses) */}
                            <div className="flex-grow-1 overflow-hidden d-flex flex-column">
                                <Tab.Container activeKey={activeDetailTab} onSelect={(k) => setActiveDetailTab(k)}>
                                    <div className="px-4 pt-3 border-bottom">
                                        <Nav variant="tabs" className="border-bottom-0">
                                            <Nav.Item><Nav.Link eventKey="history" className="text-dark fw-bold small text-uppercase"><ShoppingBag size={14} className="me-2 mb-1"/>Order History</Nav.Link></Nav.Item>
                                            <Nav.Item><Nav.Link eventKey="transactions" className="text-dark fw-bold small text-uppercase"><CreditCard size={14} className="me-2 mb-1"/>Transactions</Nav.Link></Nav.Item>
                                            <Nav.Item><Nav.Link eventKey="addresses" className="text-dark fw-bold small text-uppercase"><MapPin size={14} className="me-2 mb-1"/>Addresses</Nav.Link></Nav.Item>
                                        </Nav>
                                    </div>

                                    <div className="p-0 overflow-auto flex-grow-1 bg-white">
                                        <Tab.Content>
                                            
                                            {/* 💡 FIX: ORDER HISTORY TAB */}
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
                                                                    {/* 💡 Use order_number (API) or fallback to id */}
                                                                    <td className="ps-4 fw-bold text-primary small">{order.order_number || order.id}</td>
                                                                    {/* 💡 Use date_formatted (API) or fallback to date */}
                                                                    <td className="small">{order.date_formatted || order.date}</td>
                                                                    <td className="fw-bold small">₱{parseFloat(order.total).toLocaleString()}</td>
                                                                    <td>
                                                                        <Badge bg={order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'warning'} className="fw-normal rounded-pill" style={{fontSize: '0.7rem'}}>
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

                                            {/* TRANSACTIONS TAB (Static for now) */}
                                            <Tab.Pane eventKey="transactions">
                                                {userTransactions.length > 0 ? (
                                                    <Table hover responsive className="mb-0 align-middle">
                                                        {/* ... Transaction Content ... */}
                                                    </Table>
                                                ) : (
                                                    <div className="text-center py-5 text-muted">
                                                        <CreditCard size={32} className="mb-2 opacity-50"/>
                                                        <p>No transactions found for this user.</p>
                                                    </div>
                                                )}
                                            </Tab.Pane>

                                            {/* ADDRESS TAB CONTENT */}
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
                                                                            <div className="text-dark fw-bold">{addr.firstName || addr.first_name} {addr.lastName || addr.last_name}</div>
                                                                            <div>{addr.street}</div>
                                                                            <div>{addr.city}, {addr.zip}</div>
                                                                            <div className="mt-1"> {addr.phone}</div>
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

            {/* ... MODALS (Keep unchanged) ... */}
            
            {/* Status Confirmation Modal (Suspend/Activate) */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold text-dark">
                        {userToToggle?.status === 'Active' ? 'Suspend User' : 'Activate User'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <AlertTriangle size={48} className={`mb-3 ${userToToggle?.status === 'Active' ? 'text-danger' : 'text-success'}`} />
                    <h5 className="fw-bold">Are you sure?</h5>
                    <p className="text-muted mb-0">
                        {userToToggle?.status === 'Active' 
                            ? `This will prevent ${userToToggle?.name} from logging in and placing orders.`
                            : `This will restore access for ${userToToggle?.name}.`
                        }
                    </p>
                </Modal.Body>
                <Modal.Footer className="border-0 justify-content-center pb-4">
                    <Button variant="light" className="rounded-pill px-4" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                    <Button variant={userToToggle?.status === 'Active' ? 'danger' : 'success'} className="rounded-pill px-4 fw-bold" onClick={confirmAction}>
                        {userToToggle?.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Password Reset Modal */}
            <Modal show={showResetModal} onHide={() => !isResetting && setShowResetModal(false)} centered>
                <Modal.Header closeButton={!isResetting} className="border-0"><Modal.Title className="fw-bold text-dark">Reset Password</Modal.Title></Modal.Header>
                <Modal.Body className="text-center py-4">
                    <div className="bg-light rounded-circle d-inline-flex p-3 mb-3"><Lock size={32} className="text-primary"/></div>
                    <h5 className="fw-bold">Confirm Password Reset</h5>
                    <p className="text-muted mb-0">This will invalidate the current password for *{userToReset?.name}*.<br/><span className="text-dark fw-bold">{userToReset?.email}</span></p>
                </Modal.Body>
                <Modal.Footer className="border-0 justify-content-center pb-4">
                    <Button variant="light" className="rounded-pill px-4" onClick={() => setShowResetModal(false)} disabled={isResetting}>Cancel</Button>
                    <Button variant="dark" className="rounded-pill px-4 fw-bold" onClick={confirmReset} disabled={isResetting}>{isResetting ? <><Spinner animation="border" size="sm" className="me-2"/> Sending...</> : 'Send Recovery Email'}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminUsers;