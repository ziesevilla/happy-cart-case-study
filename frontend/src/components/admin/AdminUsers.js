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
 * * Features: User list with search & pagination, detailed profile view.
 */
const AdminUsers = ({ showNotification }) => {
    // --- CONTEXT HOOKS ---
    const { users, updateUserStatus, loading, resetUserPassword } = useUsers();
    const { orders } = useOrders();
    const { transactions } = useTransactions();
    // Note: We access addresses directly from selectedUser now, but keeping the hook is fine if needed later.
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

    // --- FILTERING LOGIC ---
    const filteredUsers = users.filter(u => {
        // 1. EXCLUDE ADMINS: Check if the role is 'Admin' (case-insensitive)
        if (u.role && u.role.toLowerCase() === 'admin') {
            return false;
        }

        // 2. SEARCH FILTER: Match Name or Email
        const searchLower = searchTerm.toLowerCase();
        return (
            (u.name || '').toLowerCase().includes(searchLower) ||
            (u.email || '').toLowerCase().includes(searchLower)
        );
    });

    // --- PAGINATION LOGIC ---
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
    const renderPaginationItems = () => {
        let items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
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
    
    // 1. Filter and sort orders for the selected user
    const userOrders = selectedUser 
        ? orders.filter(o => o.email === selectedUser.email).sort((a,b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
        : [];

    // 2. Filter transactions linked to those orders
    // 💡 FIX: We create a list of valid Order Numbers specifically for this user
    // This connects the Transaction "orderId" (string) to the Order "order_number" (string)
    const validOrderNumbers = userOrders.map(o => o.order_number).filter(Boolean);
    
    const userTransactions = selectedUser 
        ? transactions.filter(t => validOrderNumbers.includes(t.orderId))
        : [];

    // 3. Calculate total lifetime spend (excluding cancelled/refunded)
    const totalSpent = userOrders
        .filter(o => !['Cancelled', 'Refunded'].includes(o.status))
        .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    // 4. Fetch addresses
    // 💡 FIX: We read directly from selectedUser.addresses because we updated the Controller to include them.
    const userAddresses = selectedUser?.addresses || [];

    // --- ACTION HANDLERS ---
    const handleExportUser = () => {
        if (!selectedUser) return;
        
        // 1. Prepare CSV Data Rows
        const csvRows = [];

        // --- SECTION 1: USER INFO ---
        csvRows.push(['--- USER PROFILE ---']);
        csvRows.push(['User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Joined Date']);
        csvRows.push([
            selectedUser.id,
            `"${selectedUser.name}"`, 
            selectedUser.email,
            `'${selectedUser.phone || 'N/A'}'`, 
            selectedUser.role,
            selectedUser.status,
            new Date(selectedUser.created_at).toLocaleDateString()
        ]);
        csvRows.push([]); // Empty row for spacing

        // --- SECTION 2: ADDRESSES ---
        csvRows.push(['--- SAVED ADDRESSES ---']);
        csvRows.push(['Label', 'Recipient', 'Full Address', 'Phone', 'Is Default']);
        if (userAddresses.length > 0) {
            userAddresses.forEach(addr => {
                csvRows.push([
                    addr.label,
                    `"${addr.firstName || addr.first_name} ${addr.lastName || addr.last_name}"`,
                    `"${addr.street}, ${addr.city} ${addr.zip}"`,
                    `'${addr.phone}'`,
                    addr.default ? 'Yes' : 'No'
                ]);
            });
        } else {
            csvRows.push(['No addresses found']);
        }
        csvRows.push([]);

        // --- SECTION 3: ORDERS ---
        csvRows.push(['--- ORDER HISTORY ---']);
        csvRows.push(['Order ID', 'Date', 'Status', 'Item Count', 'Total Amount']);
        if (userOrders.length > 0) {
            userOrders.forEach(order => {
                csvRows.push([
                    order.order_number || order.id,
                    order.date_formatted || new Date(order.created_at).toLocaleDateString(),
                    order.status,
                    order.items ? order.items.length : 'N/A',
                    `"${parseFloat(order.total).toFixed(2)}"`
                ]);
            });
        } else {
            csvRows.push(['No orders found']);
        }
        csvRows.push([]);

        // --- SECTION 4: TRANSACTIONS (NEW) ---
        csvRows.push(['--- TRANSACTION HISTORY ---']);
        csvRows.push(['Transaction ID', 'Order Link', 'Method', 'Amount', 'Status', 'Date']);
        if (userTransactions.length > 0) {
            userTransactions.forEach(trx => {
                csvRows.push([
                    trx.id || trx.transaction_number, // ID (e.g., TRX-001)
                    trx.orderId,                      // Linked Order
                    trx.method || trx.payment_method, // e.g., GCash
                    `"${parseFloat(trx.amount).toFixed(2)}"`,
                    trx.status,
                    new Date(trx.created_at || trx.date).toLocaleDateString()
                ]);
            });
        } else {
            csvRows.push(['No transactions found']);
        }

        // 2. Convert Array to CSV String
        const csvContent = "data:text/csv;charset=utf-8," 
            + csvRows.map(e => e.join(",")).join("\n");

        // 3. Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `User_Export_${selectedUser.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification("Export downloaded successfully!", "success");
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

    const confirmReset = async () => {
        if (!userToReset) return;

        setIsResetting(true);
        try {
            // This calls the backend to invalidate the password
            await resetUserPassword(userToReset.id);
            
            showNotification(`Password reset link sent to ${userToReset.email}`, 'success');
            setShowResetModal(false);
            setUserToReset(null);
        } catch (error) {
            console.error("Reset failed", error);
            showNotification("Failed to send reset email.", "error");
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="animate-fade-in h-100">
            <Row className="h-100 g-4">
                
                {/* --- LEFT COLUMN: USER LIST --- */}
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

                {/* --- RIGHT COLUMN: PROFILE DETAILS --- */}
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
                                                                    <td className="ps-4 fw-bold text-primary small">{order.order_number || order.id}</td>
                                                                    <td className="small">{order.date_formatted || new Date(order.created_at).toLocaleDateString()}</td>
                                                                    <td className="fw-bold small">₱{parseFloat(order.total).toLocaleString()}</td>
                                                                    <td><Badge bg={order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'warning'} className="fw-normal rounded-pill" style={{fontSize: '0.7rem'}}>{order.status}</Badge></td>
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

                                            {/* TRANSACTIONS TAB (FIXED) */}
                                            <Tab.Pane eventKey="transactions">
                                                {userTransactions.length > 0 ? (
                                                    <Table hover responsive className="mb-0 align-middle">
                                                        <thead className="bg-light sticky-top">
                                                            <tr>
                                                                <th className="ps-4 text-muted small">TRX ID</th>
                                                                <th className="text-muted small">Order Link</th>
                                                                <th className="text-muted small">Method</th>
                                                                <th className="text-muted small">Amount</th>
                                                                <th className="text-muted small">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {userTransactions.map(trx => (
                                                                <tr key={trx.id || trx.dbId}>
                                                                    <td className="ps-4 font-monospace small">{trx.id}</td>
                                                                    <td className="text-primary small">{trx.orderId}</td>
                                                                    <td className="small text-uppercase">{trx.method}</td>
                                                                    <td className="fw-bold small">₱{parseFloat(trx.amount).toLocaleString()}</td>
                                                                    <td><Badge bg={trx.status === 'Paid' ? 'success' : trx.status === 'Refunded' ? 'warning' : 'danger'} className="fw-normal rounded-pill" style={{fontSize: '0.7rem'}}>{trx.status}</Badge></td>
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

                                            {/* ADDRESS TAB (NEW TABLE DESIGN) */}
                                            <Tab.Pane eventKey="addresses">
                                                {userAddresses.length > 0 ? (
                                                    <Table hover responsive className="mb-0 align-middle">
                                                        <thead className="bg-light sticky-top">
                                                            <tr>
                                                                <th className="ps-4 text-muted small">Label</th>
                                                                <th className="text-muted small">Recipient</th>
                                                                <th className="text-muted small">Details</th>
                                                                <th className="text-muted small">Contact</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {userAddresses.map(addr => (
                                                                <tr key={addr.id}>
                                                                    <td className="ps-4 fw-bold text-dark small">
                                                                        <MapPin size={14} className="me-1 text-primary"/> {addr.label}
                                                                    </td>
                                                                    <td className="small">{addr.first_name || addr.firstName} {addr.last_name || addr.lastName}</td>
                                                                    <td className="small text-muted" style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                                        {addr.street}, {addr.city} {addr.zip}
                                                                    </td>
                                                                    <td className="small">{addr.phone}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                ) : (
                                                    <div className="text-center py-5 text-muted">
                                                        <MapPin size={32} className="mb-2 opacity-50"/>
                                                        <p>No addresses found for this user.</p>
                                                    </div>
                                                )}
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </div>
                                </Tab.Container>
                            </div>
                        </Card>
                    </Col>
                )}
            </Row>

            {/* ... MODALS ... */}
            
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
                    <p className="text-muted mb-0">This will invalidate the current password for <strong>{userToReset?.name}</strong>.<br/><span className="text-dark fw-bold">{userToReset?.email}</span></p>
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