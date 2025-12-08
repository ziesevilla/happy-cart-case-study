import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Badge, InputGroup, Modal } from 'react-bootstrap'; 
import { Plus, X, Save, RefreshCw, ShieldAlert, Settings as SettingsIcon, Tag, ToggleLeft, Store, Truck, Bell, Mail, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext'; 

/**
 * AdminSettings Component
 */
const AdminSettings = ({ showNotification }) => {
    
    // 1. Access Global Contexts
    const { 
        categories, 
        addCategory, 
        deleteCategory, 
        settings, 
        toggleSetting, 
        factoryReset, 
        storeInfo,        
        updateStoreInfo 
    } = useSettings();

    // 2. Local State
    const [newCategory, setNewCategory] = useState('');
    const [localStoreInfo, setLocalStoreInfo] = useState(storeInfo);

    // --- MODAL STATES ---
    
    // Category Deletion
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Factory Reset (Secure)
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetConfirmationText, setResetConfirmationText] = useState(''); // Stores what user types
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        setLocalStoreInfo(storeInfo);
    }, [storeInfo]);

    // --- HANDLERS ---

    const handleAddCategory = (e) => {
        e.preventDefault();
        const catName = newCategory.trim();
        if (catName) {
            const success = addCategory(catName); 
            if (success) {
                setNewCategory('');
                showNotification(`Category "${catName}" added!`, "success");
            } else {
                showNotification(`"${catName}" already exists.`, "warning");
            }
        }
    };

    const handleDeleteClick = (cat) => {
        setCategoryToDelete(cat);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true); 
        const result = await deleteCategory(categoryToDelete);
        setIsDeleting(false); 
        setShowDeleteModal(false); 
        if (result.success) {
            showNotification(result.message, "success");
        } else {
            showNotification(result.message, "danger");
        }
    };

    const handleSaveStoreInfo = (e) => {
        e.preventDefault();
        updateStoreInfo(localStoreInfo);
        showNotification("Store settings saved!");
    };

    // --- SECURE RESET HANDLERS ---

    // 1. Open the Secure Modal
    const handleTriggerReset = () => {
        setResetConfirmationText(''); // Clear previous input
        setShowResetModal(true);
    };

    // 2. Execute the Reset (Only if text matches)
    const handleConfirmReset = async () => {
        if (resetConfirmationText !== 'DELETE') return;

        setIsResetting(true);
        await factoryReset(); 
        // Note: Page reloads automatically on success, so we don't need to close modal
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="d-flex align-items-center mb-4">
                <div className="bg-white p-2 rounded-circle shadow-sm me-3 border">
                    <SettingsIcon size={24} className="text-primary"/>
                </div>
                <div>
                    <h4 className="fw-bold mb-0">System Configuration</h4>
                    <p className="text-muted small mb-0">Manage general settings, store preferences, and system defaults</p>
                </div>
            </div>
            
            <Row className="g-4">
                {/* LEFT COLUMN */}
                <Col md={8}>
                    {/* Store Info */}
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4"><Store size={20} className="text-primary me-2" /><h5 className="fw-bold mb-0">General Store Information</h5></div>
                            <Form onSubmit={handleSaveStoreInfo}>
                                <Row className="g-3">
                                    <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">STORE NAME</Form.Label><InputGroup className="border rounded-pill overflow-hidden bg-light"><InputGroup.Text className="bg-transparent border-0 pe-0 text-muted"><Store size={18}/></InputGroup.Text><Form.Control className="bg-transparent border-0 shadow-none ps-2" value={localStoreInfo.name} onChange={(e) => setLocalStoreInfo({...localStoreInfo, name: e.target.value})}/></InputGroup></Form.Group></Col>
                                    <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">SUPPORT EMAIL</Form.Label><InputGroup className="border rounded-pill overflow-hidden bg-light"><InputGroup.Text className="bg-transparent border-0 pe-0 text-muted"><Mail size={18}/></InputGroup.Text><Form.Control className="bg-transparent border-0 shadow-none ps-2" value={localStoreInfo.email} onChange={(e) => setLocalStoreInfo({...localStoreInfo, email: e.target.value})}/></InputGroup></Form.Group></Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Shipping */}
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4"><Truck size={20} className="text-primary me-2" /><h5 className="fw-bold mb-0">Shipping & Financials</h5></div>
                            <Row className="g-3">
                                <Col md={4}><Form.Group><Form.Label className="small fw-bold text-muted">SHIPPING FEE</Form.Label><InputGroup className="border rounded-pill overflow-hidden bg-light"><InputGroup.Text className="bg-transparent border-0 pe-2 text-muted fw-bold">₱</InputGroup.Text><Form.Control type="number" className="bg-transparent border-0 shadow-none ps-0" value={localStoreInfo.shippingFee} onChange={(e) => setLocalStoreInfo({...localStoreInfo, shippingFee: e.target.value})} /></InputGroup></Form.Group></Col>
                                <Col md={4}><Form.Group><Form.Label className="small fw-bold text-muted">FREE SHIPPING</Form.Label><InputGroup className="border rounded-pill overflow-hidden bg-light"><InputGroup.Text className="bg-transparent border-0 pe-2 text-muted fw-bold">₱</InputGroup.Text><Form.Control type="number" className="bg-transparent border-0 shadow-none ps-0" value={localStoreInfo.freeShippingThreshold} onChange={(e) => setLocalStoreInfo({...localStoreInfo, freeShippingThreshold: e.target.value})} /></InputGroup></Form.Group></Col>
                                <Col md={4}><Form.Group><Form.Label className="small fw-bold text-muted">TAX RATE</Form.Label><InputGroup className="border rounded-pill overflow-hidden bg-light"><InputGroup.Text className="bg-transparent border-0 pe-2 text-muted fw-bold">%</InputGroup.Text><Form.Control type="number" className="bg-transparent border-0 shadow-none ps-0" value={localStoreInfo.taxRate} onChange={(e) => setLocalStoreInfo({...localStoreInfo, taxRate: e.target.value})} /></InputGroup></Form.Group></Col>
                            </Row>
                            <div className="mt-4 text-end"><Button variant="primary" className="rounded-pill fw-bold px-4" onClick={handleSaveStoreInfo}><Save size={16} className="me-2"/> Save Changes</Button></div>
                        </Card.Body>
                    </Card>

                    {/* Category Management */}
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4"><Tag size={20} className="text-primary me-2" /><h5 className="fw-bold mb-0">Product Categories</h5></div>
                            <p className="small text-muted mb-3"><strong className="text-dark">Note:</strong> Adding a category here will automatically create a link in the Customer Navbar.</p>
                            <Form onSubmit={handleAddCategory} className="d-flex gap-2 mb-4">
                                <Form.Control placeholder="e.g. Gaming, Furniture, Sports..." className="rounded-pill bg-light border-0" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                                <Button type="submit" variant="outline-primary" className="rounded-pill px-4 d-flex align-items-center"><Plus size={18} className="me-1"/> Add</Button>
                            </Form>
                            <div className="d-flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <Badge key={cat} bg="light" text="dark" className="border px-3 py-2 d-flex align-items-center gap-2 rounded-pill">
                                        {cat}
                                        <X size={14} className="text-muted cursor-pointer hover-danger" style={{cursor:'pointer'}} onClick={() => handleDeleteClick(cat)} />
                                    </Badge>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* RIGHT COLUMN */}
                <Col md={4}>
                    {/* Toggles */}
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4"><ToggleLeft size={20} className="text-primary me-2" /><h5 className="fw-bold mb-0">System Toggles</h5></div>
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3 border-dashed"><div><div className="fw-bold">Maintenance</div><small className="text-muted">Disable user access</small></div><Form.Check type="switch" checked={settings.maintenanceMode} onChange={() => toggleSetting('maintenanceMode')} /></div>
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3 border-dashed"><div><div className="fw-bold">Sign Ups</div><small className="text-muted">Allow registrations</small></div><Form.Check type="switch" checked={settings.allowRegistration} onChange={() => toggleSetting('allowRegistration')} /></div>
                            <div className="d-flex justify-content-between align-items-center mb-2"><div><div className="fw-bold">Reviews</div><small className="text-muted">Enable comments</small></div><Form.Check type="switch" checked={settings.enableReviews} onChange={() => toggleSetting('enableReviews')} /></div>
                        </Card.Body>
                    </Card>

                    {/* Notifications */}
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4"><Bell size={20} className="text-primary me-2" /><h5 className="fw-bold mb-0">Notifications</h5></div>
                            <Form.Check type="checkbox" label="Email on new order" defaultChecked className="mb-2 text-muted small" />
                            <Form.Check type="checkbox" label="Email on low stock" defaultChecked className="mb-2 text-muted small" />
                            <Form.Check type="checkbox" label="Email on new user signup" className="text-muted small" />
                        </Card.Body>
                    </Card>

                    {/* DANGER ZONE (Trigger) */}
                    <Card className="border-danger shadow-sm rounded-4 bg-white">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center gap-2 text-danger mb-3">
                                <ShieldAlert size={20} />
                                <h5 className="fw-bold mb-0">Danger Zone</h5>
                            </div>
                            <p className="small text-muted mb-3">
                                Resetting the system will delete all custom products, orders, and users, restoring default inventory.
                            </p>
                            <Button 
                                variant="outline-danger" 
                                className="w-100 rounded-pill fw-bold py-2" 
                                onClick={handleTriggerReset} // <--- Opens the secure modal
                            >
                                <RefreshCw size={16} className="me-2"/> Factory Reset
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ========================================================== */}
            {/* DELETE CATEGORY MODAL */}
            {/* ========================================================== */}
            <Modal show={showDeleteModal} onHide={() => !isDeleting && setShowDeleteModal(false)} centered>
                <Modal.Body className="text-center p-4">
                    <div className="bg-warning-subtle rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}>
                        <AlertTriangle size={30} className="text-warning" />
                    </div>
                    <h4 className="fw-bold mb-2">Delete Category?</h4>
                    <p className="text-muted mb-4">
                        Are you sure you want to delete <strong className="text-dark">"{categoryToDelete}"</strong>?
                        <br/>
                        <span className="small">This will disappear from the Customer Navbar immediately.</span>
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Button variant="light" className="rounded-pill px-4 fw-bold" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</Button>
                        <Button variant="danger" className="rounded-pill px-4 fw-bold" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Yes, Delete"}</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* ========================================================== */}
            {/* SECURE FACTORY RESET MODAL */}
            {/* ========================================================== */}
            <Modal show={showResetModal} onHide={() => !isResetting && setShowResetModal(false)} centered backdrop="static" keyboard={false}>
                <Modal.Body className="text-center p-4">
                    <div className="bg-danger-subtle rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'70px', height:'70px'}}>
                        <AlertOctagon size={36} className="text-danger" />
                    </div>
                    <h3 className="fw-bold text-danger mb-2">Factory Reset</h3>
                    <p className="text-muted mb-4">
                        This action is <strong>irreversible</strong>. All orders, users, and custom products will be permanently deleted.
                    </p>
                    
                    <div className="mb-4 text-start bg-light p-3 rounded-3 border">
                        <Form.Label className="small fw-bold text-dark">Type "DELETE" to confirm:</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="DELETE"
                            className="border-danger fw-bold"
                            value={resetConfirmationText}
                            onChange={(e) => setResetConfirmationText(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="d-flex gap-2 justify-content-center">
                        <Button 
                            variant="light" 
                            className="rounded-pill px-4 fw-bold"
                            onClick={() => setShowResetModal(false)}
                            disabled={isResetting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="danger" 
                            className="rounded-pill px-4 fw-bold"
                            onClick={handleConfirmReset}
                            // Button is DISABLED unless the user types exactly "DELETE"
                            disabled={resetConfirmationText !== 'DELETE' || isResetting}
                        >
                            {isResetting ? (
                                <span><RefreshCw size={16} className="me-2 animate-spin"/> Wiping Data...</span>
                            ) : (
                                "Confirm Reset"
                            )}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

        </div>
    );
};

export default AdminSettings;