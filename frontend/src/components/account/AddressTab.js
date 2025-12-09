import React, { useState } from 'react';
import { Row, Col, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { Plus, Home, Briefcase, MapPin, CheckCircle, Trash2, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAddress } from '../../context/AddressContext'; 

/**
 * AddressTab Component
 * * Manages the user's saved addresses.
 */
const AddressTab = () => {
    // --- CONTEXT HOOKS ---
    const { user } = useAuth(); 
    const { getUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddress();

    // Fetch addresses ONLY for this user
    const myAddresses = user ? getUserAddresses(user.id) : [];
    
    // --- LOCAL STATE MANAGEMENT ---
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [addressToDelete, setAddressToDelete] = useState(null);
    
    const [isCustomLabel, setIsCustomLabel] = useState(false);
    const initialFormState = { label: 'Home', firstName: '', lastName: '', street: '', city: '', zip: '', phone: '' };
    const [formData, setFormData] = useState(initialFormState);

    // --- MODAL HANDLERS ---
    const openAddModal = () => {
        setIsEditing(false);
        setFormData(initialFormState);
        setIsCustomLabel(false);
        setShowFormModal(true);
    };

    const openEditModal = (address) => {
        setIsEditing(true);
        setCurrentId(address.id);
        setFormData({
            label: address.label,
            firstName: address.firstName,
            lastName: address.lastName,
            street: address.street,
            city: address.city,
            zip: address.zip,
            phone: address.phone
        });

        if (!['Home', 'Office'].includes(address.label)) {
            setIsCustomLabel(true);
        } else {
            setIsCustomLabel(false);
        }
        setShowFormModal(true);
    };

    // --- FORM SUBMISSION HANDLERS ---
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            setShowUpdateConfirmModal(true);
        } else {
            if (user) addAddress(user.id, formData);
            setShowFormModal(false);
        }
    };

    const confirmUpdate = () => {
        updateAddress(currentId, formData);
        setShowUpdateConfirmModal(false);
        setShowFormModal(false);
    };

    // --- DELETE HANDLERS ---
    const handleDeleteClick = (id) => {
        setAddressToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (addressToDelete) deleteAddress(addressToDelete);
        setShowDeleteModal(false);
        setAddressToDelete(null);
    };

    // --- UTILITY HANDLERS ---
    const handleSetDefault = (id) => {
        if (user) setDefaultAddress(user.id, id); 
    };

    const handleLabelSelect = (e) => {
        const val = e.target.value;
        if (val === 'Custom') {
            setIsCustomLabel(true);
            setFormData({ ...formData, label: '' }); 
        } else {
            setIsCustomLabel(false);
            setFormData({ ...formData, label: val });
        }
    };

    const getLabelIcon = (label) => {
        if (label === 'Home') return <Home size={18}/>;
        if (label === 'Office') return <Briefcase size={18}/>;
        return <MapPin size={18}/>;
    };

    return (
        <div className="animate-fade-in">            
            {/* Address Grid Render */}
            {myAddresses.length > 0 ? (
                <Row className="g-3">
                    {myAddresses.map(addr => (
                        <Col md={6} key={addr.id}>
                            <Card className={`h-100 border-0 shadow-sm rounded-4 p-2 ${addr.default ? 'border border-primary bg-primary-subtle' : ''}`}>
                                <Card.Body>
                                    {/* Card Header */}
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center gap-2 text-primary">
                                            {getLabelIcon(addr.label)}
                                            <span className="fw-bold small text-uppercase">{addr.label}</span>
                                        </div>
                                        {addr.default ? (
                                            <Badge bg="primary" className="rounded-pill d-flex align-items-center">
                                                <CheckCircle size={12} className="me-1"/> Default
                                            </Badge>
                                        ) : (
                                            <Button variant="light" size="sm" className="rounded-pill text-muted py-0 px-2" style={{fontSize: '0.75rem'}} onClick={() => handleSetDefault(addr.id)}>
                                                Set as Default
                                            </Button>
                                        )}
                                    </div>

                                    {/* Address Details */}
                                    <h6 className="fw-bold mb-1">{addr.firstName} {addr.lastName}</h6>
                                    <p className="text-muted small mb-3">
                                        {addr.street}<br/>
                                        {addr.city}, {addr.zip}<br/>
                                        {addr.phone}
                                    </p>
                                    
                                    {/* Action Buttons */}
                                    <div className="d-flex gap-2">
                                        <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" onClick={() => openEditModal(addr)}>Edit</Button>
                                        {!addr.default && (
                                            <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={() => handleDeleteClick(addr.id)}>Delete</Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                /* Empty State */
                // 💡 UPDATED: Added style={{ borderStyle: 'dashed' }} to create the dashed line effect
                <div className="empty-state text-center py-5">
                    <Home size={48} className="mb-3 opacity-25"/>
                    <h5>No saved addresses yet.</h5>
                    <p className="text-muted">Looks like you haven't created any addresses yet.</p>
                    <Button variant="primary" size="sm" className="rounded-pill" onClick={openAddModal}>
                        <Plus size={16} className="me-2"/> Add New
                    </Button>
                </div>
            )}

            {/* --- MODALS SECTION --- */}

            {/* 1. FORM MODAL (Add / Edit) */}
            <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">{isEditing ? 'Edit Address' : 'Add New Address'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Address Label</Form.Label>
                                    <div className="d-flex gap-2">
                                        <Form.Select value={isCustomLabel ? 'Custom' : formData.label} onChange={handleLabelSelect} className="rounded-pill" style={{ width: isCustomLabel ? '40%' : '100%' }}>
                                            <option value="Home">Home</option>
                                            <option value="Office">Office</option>
                                            <option value="Custom">Custom...</option>
                                        </Form.Select>
                                        {isCustomLabel && (
                                            <Form.Control placeholder="E.g. Mom's House" value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})} className="rounded-pill animate-fade-in" required autoFocus />
                                        )}
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>First Name</Form.Label><Form.Control required placeholder="John" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="rounded-pill" /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Last Name</Form.Label><Form.Control required placeholder="Doe" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="rounded-pill" /></Form.Group></Col>
                            <Col xs={12}><Form.Group className="mb-3"><Form.Label>Street Address</Form.Label><Form.Control required placeholder="Unit, Building, Street" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} className="rounded-pill" /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>City</Form.Label><Form.Control required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="rounded-pill" /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Zip Code</Form.Label><Form.Control required value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} className="rounded-pill" /></Form.Group></Col>
                            <Col md={12}><Form.Group className="mb-4"><Form.Label>Phone Number</Form.Label><Form.Control required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="rounded-pill" placeholder="0912 345 6789" /></Form.Group></Col>
                        </Row>
                        <div className="d-grid"><Button variant="primary" type="submit" className="rounded-pill fw-bold">{isEditing ? 'Update Address' : 'Save Address'}</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* 2. DELETE CONFIRMATION MODAL */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
                <Modal.Body className="text-center p-4">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}><Trash2 size={24} className="text-danger" /></div>
                    <h5 className="fw-bold mb-2">Delete Address?</h5>
                    <p className="text-muted small mb-4">Are you sure you want to remove this address?</p>
                    <div className="d-grid gap-2">
                        <Button variant="danger" onClick={confirmDelete} className="rounded-pill fw-bold">Yes, Delete</Button>
                        <Button variant="link" onClick={() => setShowDeleteModal(false)} className="text-muted text-decoration-none">Cancel</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* 3. UPDATE CONFIRMATION MODAL */}
            <Modal show={showUpdateConfirmModal} onHide={() => setShowUpdateConfirmModal(false)} centered size="sm">
                <Modal.Body className="text-center p-4">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}><Save size={24} className="text-primary" /></div>
                    <h5 className="fw-bold mb-2">Save Changes?</h5>
                    <p className="text-muted small mb-4">Are you sure you want to update this address?</p>
                    <div className="d-grid gap-2">
                        <Button variant="primary" onClick={confirmUpdate} className="rounded-pill fw-bold">Yes, Save Changes</Button>
                        <Button variant="link" onClick={() => setShowUpdateConfirmModal(false)} className="text-muted text-decoration-none">Cancel</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AddressTab;