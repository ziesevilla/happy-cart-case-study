import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge, Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Settings, Plus, Trash2, Edit2, User, MapPin, Home, Briefcase, X, Camera, Search, Check, CheckCircle, Clock, Truck, ShoppingBag } from 'lucide-react';
import './Account.css';

// ... (Keep MOCK_ORDERS as is) ...
const MOCK_ORDERS = [
    { 
        id: 'ORD-001', 
        date: 'Oct 12, 2023', 
        itemsCount: 2, 
        total: 1299.00, 
        status: 'Delivered',
        details: [
            { name: 'Floral Summer Dress', price: 899.00, qty: 1, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=100' },
            { name: 'Gold Layered Necklace', price: 400.00, qty: 1, image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=100' }
        ]
    },
    { 
        id: 'ORD-002', 
        date: 'Nov 05, 2023', 
        itemsCount: 1, 
        total: 599.50, 
        status: 'Shipped',
        details: [
            { name: 'White Leather Sneakers', price: 599.50, qty: 1, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=100' }
        ]
    },
    { 
        id: 'ORD-003', 
        date: 'Nov 20, 2023', 
        itemsCount: 3, 
        total: 2100.00, 
        status: 'Processing',
        details: [
            { name: 'High-Waist Mom Jeans', price: 700.00, qty: 2, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=100' },
            { name: 'Cropped Knit Sweater', price: 700.00, qty: 1, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=100' }
        ]
    }
];

const Account = () => {
    // Get address data/funcs from Context
    const { user, login, logout, addresses, addAddress, deleteAddress } = useAuth();
    const navigate = useNavigate();

    // --- NOTIFICATION STATE ---
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
    
    const showNotification = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    // --- CUSTOMER STATE ---
    const [activeTab, setActiveTab] = useState('orders'); 
    const [profileImage, setProfileImage] = useState(null);
    
    // Modal States
    const [showAddressModal, setShowAddressModal] = useState(false);
    // Updated to support first/last name
    const [newAddress, setNewAddress] = useState({ label: 'Home', firstName: '', lastName: '', street: '', city: '', zip: '', phone: '' });
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', dob: '', gender: '' });
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

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
        navigate('/login');
        return null;
    }

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

    const getStatusStep = (status) => {
        switch(status) {
            case 'Placed': return 0;
            case 'Processing': return 1;
            case 'Shipped': return 2;
            case 'Delivered': return 3;
            default: return 0;
        }
    };

    // --- CUSTOMER ACTIONS ---
    const handleAddAddressSubmit = (e) => {
        e.preventDefault();
        addAddress(newAddress); // Use context function
        setShowAddressModal(false);
        setNewAddress({ label: 'Home', firstName: '', lastName: '', street: '', city: '', zip: '', phone: '' });
        showNotification("New address added!");
    };

    const handleDeleteAddressClick = (id) => {
        if (window.confirm("Delete this address?")) {
            deleteAddress(id); // Use context function
            showNotification("Address deleted.", "secondary");
        }
    };

    const handleOpenProfileModal = () => {
        setProfileData({ 
            name: user.name, email: user.email,
            phone: user.phone || '0912 345 6789', 
            dob: user.dob || '1995-08-15', gender: user.gender || 'Male'
        });
        setShowProfileModal(true);
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        login({ ...user, ...profileData });
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

    const getStatusClass = (status) => {
        switch(status) {
            case 'Delivered': return 'status-delivered';
            case 'Shipped': return 'status-shipped';
            default: return 'status-processing';
        }
    };

    // -----------------------
    //    ADMIN VIEW
    // -----------------------
    if (user.role === 'admin') {
        // ... (Keep existing Admin view code exactly as is) ...
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

                    {/* Inventory Table with Search */}
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
                    
                    {/* Add Product Modal */}
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
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
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

                        <Card className="border-0 shadow-sm rounded-4 p-4">
                            <h6 className="fw-bold text-muted mb-3 text-uppercase small">Account Details</h6>
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-light p-2 rounded-circle me-3"><User size={20} className="text-primary"/></div>
                                <div>
                                    <small className="d-block text-muted">Member Since</small>
                                    <strong>October 2023</strong>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="bg-light p-2 rounded-circle me-3"><Package size={20} className="text-primary"/></div>
                                <div>
                                    <small className="d-block text-muted">Total Orders</small>
                                    <strong>{MOCK_ORDERS.length} Orders</strong>
                                </div>
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
                                {MOCK_ORDERS.length > 0 ? MOCK_ORDERS.map((order, idx) => (
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
                                {addresses.length > 0 ? (
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
                                                        {/* Updated Address Display */}
                                                        <h6 className="fw-bold mb-1">{addr.firstName} {addr.lastName}</h6>
                                                        <p className="text-muted small mb-3">
                                                            {addr.street}<br/>
                                                            {addr.city}, {addr.zip}<br/>
                                                            {addr.phone}
                                                        </p>
                                                        <div className="d-flex gap-2">
                                                            <Button variant="outline-secondary" size="sm" className="rounded-pill px-3">Edit</Button>
                                                            <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={() => handleDeleteAddressClick(addr.id)}>Delete</Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <div className="empty-state">
                                        <MapPin size={48} className="mb-3 opacity-25" />
                                        <h5>No addresses saved</h5>
                                        <p className="small">Add an address to speed up your checkout.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </Col>
                </Row>

                {/* --- MODALS (Profile & Address) --- */}
                {/* Profile Modal (Same as before) */}
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

                {/* UPDATED ADDRESS MODAL */}
                <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="fw-bold">Add New Address</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleAddAddressSubmit}>
                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Label</Form.Label>
                                        <Form.Select 
                                            value={newAddress.label} 
                                            onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                                            className="rounded-pill"
                                        >
                                            <option value="Home">Home</option>
                                            <option value="Office">Office</option>
                                            <option value="Other">Other</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control 
                                            required 
                                            placeholder="John"
                                            value={newAddress.firstName} 
                                            onChange={(e) => setNewAddress({...newAddress, firstName: e.target.value})} 
                                            className="rounded-pill" 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control 
                                            required 
                                            placeholder="Doe"
                                            value={newAddress.lastName} 
                                            onChange={(e) => setNewAddress({...newAddress, lastName: e.target.value})} 
                                            className="rounded-pill" 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Street Address</Form.Label>
                                        <Form.Control 
                                            required 
                                            placeholder="Unit, Building, Street"
                                            value={newAddress.street} 
                                            onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} 
                                            className="rounded-pill" 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>City</Form.Label>
                                        <Form.Control 
                                            required 
                                            value={newAddress.city} 
                                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} 
                                            className="rounded-pill" 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Zip Code</Form.Label>
                                        <Form.Control 
                                            required 
                                            value={newAddress.zip} 
                                            onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})} 
                                            className="rounded-pill" 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Phone Number</Form.Label>
                                        <Form.Control 
                                            required 
                                            value={newAddress.phone} 
                                            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} 
                                            className="rounded-pill" 
                                            placeholder="0912 345 6789"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-grid">
                                <Button variant="primary" type="submit" className="rounded-pill fw-bold">Save Address</Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* --- MODAL: ORDER DETAILS --- */}
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
                        {/* (Content same as before) */}
                        {selectedOrder && (
                            <>
                                <div className="timeline">
                                    {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                                        const currentStep = getStatusStep(selectedOrder.status);
                                        let statusClass = '';
                                        if (i < currentStep) statusClass = 'completed';
                                        else if (i === currentStep) statusClass = 'active';
                                        
                                        return (
                                            <div key={step} className={`timeline-step ${statusClass}`}>
                                                <div className="timeline-icon">
                                                    {i < currentStep ? <Check size={16} /> : 
                                                     i === 0 ? <ShoppingBag size={16} /> :
                                                     i === 1 ? <Clock size={16} /> :
                                                     i === 2 ? <Truck size={16} /> :
                                                     <CheckCircle size={16} />
                                                    }
                                                </div>
                                                <span className="timeline-label">{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="bg-light p-3 rounded-4 mb-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <small className="text-muted d-block">Order Date</small>
                                            <strong>{selectedOrder.date}</strong>
                                        </div>
                                        <div className="text-end">
                                            <small className="text-muted d-block">Status</small>
                                            <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
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
                                    <h5 className="mb-0">Total Amount</h5>
                                    <h4 className="fw-bold text-primary mb-0">₱{selectedOrder.total.toLocaleString()}</h4>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                </Modal>

                {/* Toast Container */}
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