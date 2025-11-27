import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge, Toast, ToastContainer, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Settings, Plus, Trash2, Edit2, User, MapPin, Home, Briefcase, X, Camera, Search, Check, CheckCircle, Clock, Truck, ShoppingBag, RotateCcw, AlertCircle, Info, XCircle, AlertTriangle, UploadCloud } from 'lucide-react';
import './Account.css';

// --- INITIAL DATA ---
const INITIAL_ORDERS = [
    { 
        id: 'ORD-004', 
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
        itemsCount: 1, 
        total: 15449.00, 
        status: 'Placed', 
        details: [
            { id: 401, name: 'Classic Trench Coat', price: 4999.00, qty: 1, image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=100' }
        ]
    },
    { 
        id: 'ORD-001', 
        date: 'Oct 12, 2023', 
        itemsCount: 2, 
        total: 1299.00, 
        status: 'Delivered',
        details: [
            { id: 101, name: 'Floral Summer Dress', price: 899.00, qty: 1, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=100' },
            { id: 102, name: 'Gold Layered Necklace', price: 400.00, qty: 1, image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=100' }
        ]
    },
    { 
        id: 'ORD-002', 
        date: 'Nov 05, 2023', 
        itemsCount: 1, 
        total: 599.50, 
        status: 'Shipped',
        details: [
            { id: 201, name: 'White Leather Sneakers', price: 599.50, qty: 1, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=100' }
        ]
    },
    { 
        id: 'ORD-003', 
        date: 'Nov 20, 2023', 
        itemsCount: 3, 
        total: 2100.00, 
        status: 'Processing',
        details: [
            { id: 301, name: 'High-Waist Mom Jeans', price: 700.00, qty: 2, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=100' },
            { id: 302, name: 'Cropped Knit Sweater', price: 700.00, qty: 1, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=100' }
        ]
    }
];

const Account = () => {
    const { user, login, logout, addresses, addAddress, deleteAddress } = useAuth();
    const navigate = useNavigate();

    // --- STATE ---
    const [orders, setOrders] = useState(INITIAL_ORDERS); 
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
    const [activeTab, setActiveTab] = useState('orders'); 
    const [profileImage, setProfileImage] = useState(null);
    
    // Modal States
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({ label: 'Home', firstName: '', lastName: '', street: '', city: '', zip: '', phone: '' });
    
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', dob: '', gender: '' });
    
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // --- CANCEL CONFIRMATION STATE ---
    const [showCancelModal, setShowCancelModal] = useState(false);

    // --- RETURN FEATURE STATE ---
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [returnDescription, setReturnDescription] = useState(''); // Renamed for clarity
    const [returnProof, setReturnProof] = useState(null); // New: File state
    const [selectedReturnItems, setSelectedReturnItems] = useState({});

    // --- ADMIN STATE ---
    const [products, setProducts] = useState([
        { id: 1, name: 'Floral Summer Dress', price: 1299.00, stock: 50 },
        { id: 2, name: 'Oversized Beige Blazer', price: 2499.00, stock: 20 },
        { id: 3, name: 'High-Waist Mom Jeans', price: 1499.00, stock: 100 },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });

    if (!user) {
        return null; 
    }

    const showNotification = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // --- HELPERS ---
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
                showNotification("Profile picture updated successfully!");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReturnProofUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReturnProof(file.name); // Just store name for demo
        }
    };

    const getStatusStep = (status) => {
        switch(status) {
            case 'Placed': return 0;
            case 'Processing': return 1;
            case 'Shipped': return 2;
            case 'Delivered': return 3;
            case 'Return Requested': return 4;
            case 'Cancelled': return -1;
            default: return 0;
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'Delivered': return 'status-delivered';
            case 'Shipped': return 'status-shipped';
            case 'Return Requested': return 'status-return';
            case 'Cancelled': return 'status-cancelled';
            default: return 'status-processing';
        }
    };

    // --- CANCEL ORDER ACTIONS ---
    const handleCancelClick = () => {
        setShowCancelModal(true);
    };

    const handleConfirmCancel = () => {
        const updatedOrders = orders.map(order => {
            if (order.id === selectedOrder.id) {
                return { ...order, status: 'Cancelled' };
            }
            return order;
        });
        setOrders(updatedOrders);
        setShowCancelModal(false);
        setShowOrderModal(false);
        showNotification("Order has been cancelled.", "secondary");
    };

    // --- RETURN ACTIONS ---
    const handleOpenReturn = () => {
        setSelectedReturnItems({});
        setReturnReason('');
        setReturnDescription('');
        setReturnProof(null);
        setShowOrderModal(false);
        setShowReturnModal(true);
    };

    const toggleReturnItem = (itemId) => {
        setSelectedReturnItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleSubmitReturn = (e) => {
        e.preventDefault();
        
        const hasItems = Object.values(selectedReturnItems).some(val => val === true);
        if (!hasItems) {
            alert("Please select at least one item to return.");
            return;
        }

        const updatedOrders = orders.map(order => {
            if (order.id === selectedOrder.id) {
                return { ...order, status: 'Return Requested' };
            }
            return order;
        });

        setOrders(updatedOrders);
        setShowReturnModal(false);
        showNotification("Return request submitted! Check your email for updates.");
    };

    // --- CUSTOMER ACTIONS ---
    const handleAddAddressSubmit = (e) => {
        e.preventDefault();
        addAddress(newAddress);
        setShowAddressModal(false);
        setNewAddress({ label: 'Home', firstName: '', lastName: '', street: '', city: '', zip: '', phone: '' });
        showNotification("New address added!");
    };

    const handleDeleteAddressClick = (id) => {
        if (window.confirm("Delete this address?")) {
            deleteAddress(id);
            showNotification("Address deleted.", "secondary");
        }
    };

    // RESTORED: EDIT PROFILE LOGIC
    const handleOpenProfileModal = () => {
        setProfileData({ 
            name: user.name, 
            email: user.email,
            phone: user.phone || '0912 345 6789', 
            dob: user.dob || '1995-08-15', 
            gender: user.gender || 'Male'
        });
        setShowProfileModal(true);
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        login({ ...user, ...profileData }); // Updates AuthContext
        setShowProfileModal(false);
        showNotification("Profile updated successfully!");
    };

    // --- ADMIN ACTIONS ---
    const handleAddProduct = (e) => {
        e.preventDefault();
        const product = {
            id: products.length + 1,
            name: newProduct.name,
            price: parseFloat(newProduct.price),
            stock: parseInt(newProduct.stock)
        };
        setProducts([...products, product]);
        setShowAddModal(false);
        setNewProduct({ name: '', price: '', stock: '' });
        showNotification("Product added to inventory.");
    };

    const handleDeleteProduct = (id) => {
        if (window.confirm("Delete this product?")) {
            setProducts(products.filter(p => p.id !== id));
            showNotification("Product removed.", "danger");
        }
    };

    // -----------------------
    //    ADMIN VIEW
    // -----------------------
    if (user.role === 'admin') {
        const filteredInventory = products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.id.toString().includes(searchTerm)
        );
        return (
            <div className="account-page py-5">
                <Container>
                    <div className="d-flex justify-content-between align-items-center mb-5">
                        <div>
                            <h2 className="fw-bold mb-1">Admin Dashboard</h2>
                            <p className="text-muted">Manage your inventory and overview.</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="primary" className="rounded-pill" onClick={() => setShowAddModal(true)}>
                                <Plus size={18} className="me-2" /> Add Product
                            </Button>
                            <Button variant="outline-danger" className="rounded-pill" onClick={handleLogout}>
                                <LogOut size={18} className="me-2" /> Logout
                            </Button>
                        </div>
                    </div>

                    <Row className="g-4 mb-5">
                        {[
                            { label: 'Total Products', val: products.length, bg: 'bg-primary' },
                            { label: 'Pending Orders', val: '12', bg: 'bg-success' },
                            { label: 'Total Revenue', val: '₱125,000', bg: 'bg-info' }
                        ].map((stat, idx) => (
                            <Col md={4} key={idx}>
                                <Card className={`stat-card ${stat.bg} shadow-sm`}>
                                    <Card.Body className="p-4">
                                        <h3 className="fw-bold">{stat.val}</h3>
                                        <div className="opacity-75">{stat.label}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Current Inventory</h5>
                            <div className="position-relative" style={{ width: '300px' }}>
                                <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                <Form.Control 
                                    placeholder="Search products..." 
                                    className="rounded-pill ps-5 bg-light border-0"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <Table responsive hover className="mb-0 admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product Name</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventory.length > 0 ? filteredInventory.map(p => (
                                    <tr key={p.id}>
                                        <td className="text-muted">#{p.id}</td>
                                        <td className="fw-bold">{p.name}</td>
                                        <td>₱{p.price.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${p.stock < 30 ? 'bg-warning' : 'bg-light text-dark'}`}>
                                                {p.stock} units
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <Button variant="link" className="text-primary p-0 me-3"><Edit2 size={16}/></Button>
                                            <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteProduct(p.id)}>
                                                <Trash2 size={16}/>
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            No products found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                    
                    <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                        <Modal.Header closeButton className="border-0">
                            <Modal.Title className="fw-bold">Add New Product</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleAddProduct}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product Name</Form.Label>
                                    <Form.Control required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="rounded-pill" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price (₱)</Form.Label>
                                    <Form.Control type="number" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="rounded-pill" />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label>Stock Quantity</Form.Label>
                                    <Form.Control type="number" required value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="rounded-pill" />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="primary" type="submit" className="rounded-pill fw-bold">Save Product</Button>
                                </div>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </Container>
                
                <ToastContainer className="toast-container">
                    <Toast onClose={() => setToast({...toast, show: false})} show={toast.show} delay={3000} autohide bg={toast.variant}>
                        <Toast.Body className="text-white fw-bold">{toast.message}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </div>
        );
    }

    // -----------------------
    //    CUSTOMER VIEW
    // -----------------------
    return (
        <div className="account-page py-5">
            <Container>
                <Row className="g-5">
                    {/* LEFT SIDEBAR: PROFILE */}
                    <Col lg={4}>
                        <Card className="profile-card text-center mb-4">
                            <div className="profile-header"></div>
                            <div className="profile-avatar-container">
                                <div className="profile-avatar">
                                    {profileImage ? <img src={profileImage} alt="Profile" /> : user.name.charAt(0).toUpperCase()}
                                </div>
                                <label className="profile-upload-overlay">
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                    <Camera size={24} />
                                </label>
                            </div>
                            <Card.Body className="pt-0 pb-4">
                                <h4 className="fw-bold mb-1">{user.name}</h4>
                                <p className="text-muted small mb-1">{user.email}</p>
                                <p className="text-muted small mb-4">{user.phone || '0912 345 6789'}</p>
                                <div className="d-grid gap-2 px-4">
                                    <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={handleOpenProfileModal}>
                                        <Settings size={16} className="me-2"/> Edit Profile
                                    </Button>
                                    <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={handleLogout}>
                                        <LogOut size={16} className="me-2"/> Logout
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                        
                        {/* Account Summary Card (kept for completeness) */}
                        <Card className="border-0 shadow-sm rounded-4 p-4">
                             <h6 className="fw-bold text-muted mb-3 text-uppercase small">Account Details</h6>
                             <div className="d-flex align-items-center mb-3">
                                <div className="bg-light p-2 rounded-circle me-3"><User size={20} className="text-primary"/></div>
                                <div><small className="d-block text-muted">Member Since</small><strong>October 2023</strong></div>
                             </div>
                             <div className="d-flex align-items-center">
                                <div className="bg-light p-2 rounded-circle me-3"><Package size={20} className="text-primary"/></div>
                                <div><small className="d-block text-muted">Total Orders</small><strong>{orders.length} Orders</strong></div>
                             </div>
                        </Card>
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
                            <div className="d-flex flex-column gap-3 animate-fade-in">
                                {orders.length > 0 ? orders.map((order, idx) => (
                                    <div key={idx} className="order-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-4 mb-3 mb-md-0">
                                            <div className="bg-light p-3 rounded-3">
                                                <Package size={24} className="text-muted"/>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Order #{order.id}</h6>
                                                <small className="text-muted">{order.date} • {order.itemsCount} Items</small>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-4">
                                            <div className="text-end me-3">
                                                <div className="fw-bold">₱{order.total.toLocaleString()}</div>
                                                <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <Button variant="outline-dark" size="sm" className="rounded-pill px-3" onClick={() => {setSelectedOrder(order); setShowOrderModal(true);}}>
                                                Details
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state">
                                        <ShoppingBag size={48} className="mb-3 opacity-25" />
                                        <h5>No orders yet</h5>
                                        <p className="small mb-3">Looks like you haven't made your first purchase.</p>
                                        <Button variant="primary" size="sm" className="rounded-pill" onClick={() => navigate('/products')}>Start Shopping</Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="mb-0 fw-bold">Saved Addresses</h5>
                                    <Button variant="primary" size="sm" className="rounded-pill" onClick={() => setShowAddressModal(true)}>
                                        <Plus size={16} className="me-2"/> Add New
                                    </Button>
                                </div>
                                <Row className="g-3">
                                    {addresses.map(addr => (
                                        <Col md={6} key={addr.id}>
                                            <Card className="h-100 border-0 shadow-sm rounded-4 p-2">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <div className="d-flex align-items-center gap-2 text-primary">
                                                            {addr.label === 'Home' ? <Home size={18}/> : <Briefcase size={18}/>}
                                                            <span className="fw-bold small text-uppercase">{addr.label}</span>
                                                        </div>
                                                        {addr.default && <span className="badge bg-primary-subtle text-primary rounded-pill">Default</span>}
                                                    </div>
                                                    <h6 className="fw-bold mb-1">{addr.firstName} {addr.lastName}</h6>
                                                    <p className="text-muted small mb-3">{addr.street}<br/>{addr.city}, {addr.zip}</p>
                                                    <div className="d-flex gap-2">
                                                        <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={() => handleDeleteAddressClick(addr.id)}>Delete</Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        )}
                    </Col>
                </Row>

                {/* --- MODALS --- */}
                
                {/* RESTORED: EDIT PROFILE MODAL */}
                <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold">Edit Profile</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSaveProfile}>
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    className="rounded-pill"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    className="rounded-pill"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control 
                                    type="tel" 
                                    className="rounded-pill"
                                    placeholder="0912 345 6789"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Date of Birth</Form.Label>
                                        <Form.Control 
                                            type="date" 
                                            className="rounded-pill"
                                            value={profileData.dob}
                                            onChange={(e) => setProfileData({...profileData, dob: e.target.value})}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Gender</Form.Label>
                                        <Form.Select 
                                            className="rounded-pill"
                                            value={profileData.gender}
                                            onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-grid">
                                <Button variant="primary" type="submit" className="rounded-pill fw-bold">Save Changes</Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Address Modal */}
                <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
                    <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Add New Address</Modal.Title></Modal.Header>
                    <Modal.Body><Form onSubmit={handleAddAddressSubmit}><div className="d-grid"><Button variant="primary" type="submit" className="rounded-pill fw-bold">Save Address</Button></div></Form></Modal.Body>
                </Modal>

                {/* ORDER DETAILS MODAL */}
                <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} centered size="lg">
                    <Modal.Header className="border-0 pb-0">
                        <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                            <Modal.Title className="fw-bold">
                                Order Details <span className="text-muted small ms-2">#{selectedOrder?.id}</span>
                            </Modal.Title>
                            <button className="btn-close" onClick={() => setShowOrderModal(false)}></button>
                        </div>
                    </Modal.Header>
                    <Modal.Body className="pt-2">
                        {selectedOrder && (
                            <>
                                <div className="timeline">
                                    {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                                        const currentStep = getStatusStep(selectedOrder.status);
                                        let statusClass = '';
                                        if (selectedOrder.status === 'Cancelled') statusClass = '';
                                        else if (selectedOrder.status === 'Return Requested') statusClass = 'completed';
                                        else if (i < currentStep) statusClass = 'completed';
                                        else if (i === currentStep) statusClass = 'active';
                                        
                                        return (
                                            <div key={step} className={`timeline-step ${statusClass}`}>
                                                <div className="timeline-icon">
                                                    {i < currentStep ? <Check size={16} /> : <CheckCircle size={16} />}
                                                </div>
                                                <span className="timeline-label">{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className={`p-3 rounded-4 mb-4 d-flex justify-content-between align-items-center ${selectedOrder.status === 'Cancelled' ? 'bg-danger-subtle text-danger' : 'bg-light'}`}>
                                    <div>
                                        <small className="d-block opacity-75">Order Date</small>
                                        <strong>{selectedOrder.date}</strong>
                                    </div>
                                    <div className="text-end">
                                        <small className="d-block opacity-75">Status</small>
                                        <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                </div>

                                <h6 className="fw-bold mb-3">Items Ordered</h6>
                                <div className="d-flex flex-column gap-3 mb-4">
                                    {selectedOrder.details.map((item, idx) => (
                                        <div key={idx} className="d-flex align-items-center justify-content-between order-detail-item p-3 rounded-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <img src={item.image} alt={item.name} className="rounded-3" style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                                                <div>
                                                    <h6 className="mb-0 fw-bold small">{item.name}</h6>
                                                    <small className="text-muted">Qty: {item.qty}</small>
                                                </div>
                                            </div>
                                            <div className="fw-bold">₱{item.price.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                                    {/* ACTION BUTTONS */}
                                    <div>
                                        {selectedOrder.status === 'Placed' && (
                                            <Button variant="danger" size="sm" className="rounded-pill fw-bold" onClick={handleCancelClick}>
                                                <XCircle size={16} className="me-2" /> Cancel Order
                                            </Button>
                                        )}
                                        {selectedOrder.status === 'Delivered' && (
                                            <Button variant="outline-danger" size="sm" className="rounded-pill fw-bold" onClick={handleOpenReturn}>
                                                <RotateCcw size={16} className="me-2" /> Return / Exchange
                                            </Button>
                                        )}
                                    </div>
                                    <div className="text-end">
                                        <span className="text-muted me-2">Total:</span>
                                        <span className="fw-bold text-primary fs-5">₱{selectedOrder.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                </Modal>

                {/* CANCEL CONFIRM MODAL */}
                <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered size="sm">
                    <Modal.Body className="text-center p-4">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}>
                            <AlertTriangle size={24} className="text-danger" />
                        </div>
                        <h5 className="fw-bold mb-2">Cancel Order?</h5>
                        <p className="text-muted small mb-4">Are you sure? This action cannot be undone.</p>
                        <div className="d-grid gap-2">
                            <Button variant="danger" onClick={handleConfirmCancel} className="rounded-pill fw-bold">Yes, Cancel Order</Button>
                            <Button variant="link" onClick={() => setShowCancelModal(false)} className="text-muted text-decoration-none">No, Keep Order</Button>
                        </div>
                    </Modal.Body>
                </Modal>

                {/* UPDATED: RETURN REQUEST MODAL WITH IMAGE UPLOAD */}
                <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered size="lg">
                    <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Request Return / Exchange</Modal.Title></Modal.Header>
                    <Modal.Body className="px-4 pb-4">
                        <Alert variant="info" className="mb-4 small border-0 rounded-4">
                            <h6 className="fw-bold mb-2 d-flex align-items-center"><Info size={16} className="me-2"/> Return Policy Eligibility</h6>
                            <ul className="mb-0 ps-3">
                                <li>Items must be returned within <strong>30 days</strong> of delivery.</li>
                                <li>Items must be <strong>unused, unworn, and unwashed</strong>.</li>
                            </ul>
                        </Alert>
                        <Form onSubmit={handleSubmitReturn}>
                            <h6 className="fw-bold mb-3 small text-muted text-uppercase">1. Choose items to return</h6>
                            <div className="mb-4">
                                {selectedOrder?.details.map((item) => (
                                    <div key={item.id} className={`d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 border ${selectedReturnItems[item.id] ? 'border-primary bg-primary-subtle' : 'border-light bg-white'}`} style={{cursor: 'pointer', transition: 'all 0.2s'}} onClick={() => toggleReturnItem(item.id)}>
                                        <div className="d-flex align-items-center gap-3">
                                            <Form.Check type="checkbox" checked={!!selectedReturnItems[item.id]} onChange={() => {}} className="pointer-events-none"/>
                                            <img src={item.image} alt={item.name} className="rounded-3" style={{width: '40px', height: '40px', objectFit: 'cover'}} />
                                            <div><h6 className="mb-0 small fw-bold">{item.name}</h6><small className="text-muted">₱{item.price.toLocaleString()}</small></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h6 className="fw-bold mb-3 small text-muted text-uppercase">2. Return Details</h6>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">REASON FOR RETURN</Form.Label>
                                <Form.Select className="rounded-pill bg-light border-0 py-2" value={returnReason} onChange={(e) => setReturnReason(e.target.value)} required>
                                    <option value="">Select a reason...</option>
                                    <option value="size">Size doesn't fit</option>
                                    <option value="damaged">Item damaged/defective</option>
                                    <option value="wrong">Received wrong item</option>
                                    <option value="mind">Changed my mind</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">DESCRIPTION OF THE PROBLEM</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3} 
                                    className="rounded-4 bg-light border-0"
                                    placeholder="Please provide more details about the issue..."
                                    value={returnDescription}
                                    onChange={(e) => setReturnDescription(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            
                            {/* NEW: IMAGE/VIDEO PROOF UPLOAD */}
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-muted">IMAGE/VIDEO PROOF</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Form.Control 
                                        type="file" 
                                        className="d-none" 
                                        id="return-proof-upload"
                                        accept="image/*,video/*"
                                        onChange={handleReturnProofUpload}
                                    />
                                    <label htmlFor="return-proof-upload" className="btn btn-outline-secondary rounded-pill d-flex align-items-center">
                                        <UploadCloud size={18} className="me-2" /> 
                                        {returnProof ? returnProof : "Upload Photo or Video"}
                                    </label>
                                </div>
                                <Form.Text className="text-muted small">
                                    Please upload clear evidence of the damage or issue.
                                </Form.Text>
                            </Form.Group>

                            <div className="d-grid gap-2">
                                <Button variant="primary" type="submit" className="rounded-pill fw-bold py-2" disabled={!Object.values(selectedReturnItems).some(Boolean)}>Submit Request</Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

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