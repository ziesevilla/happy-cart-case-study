import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, ListGroup, Alert, InputGroup, Badge } from 'react-bootstrap';
import { Plus, X, Save, RefreshCw, ShieldAlert, Settings as SettingsIcon, Tag, ToggleLeft, Store, Truck, Bell, Mail } from 'lucide-react';
import { useProducts } from '../../context/ProductContext'; 
import { useSettings } from '../../context/SettingsContext'; 

/**
 * AdminSettings Component
 * * Allows configuration of global application variables.
 * * Features: Store Info editing, Category Management, System Toggles, and Factory Reset.
 */
const AdminSettings = ({ showNotification }) => {
    // 1. Access Global Contexts
    const { resetData } = useProducts(); // Used for "Factory Reset"
    
    const { 
        categories, 
        addCategory, 
        deleteCategory, 
        settings, 
        toggleSetting, 
        resetSettings,
        storeInfo,       
        updateStoreInfo 
    } = useSettings();

    // 2. Local State (The Buffer)
    // We use local state for the form inputs to prevent excessive global re-renders.
    // The global 'storeInfo' is only updated when the user clicks "Save".
    const [newCategory, setNewCategory] = useState('');
    const [localStoreInfo, setLocalStoreInfo] = useState(storeInfo);

    // Sync: If global storeInfo changes (e.g., after a reset), update our local buffer.
    useEffect(() => {
        setLocalStoreInfo(storeInfo);
    }, [storeInfo]);

    // --- HANDLERS ---

    /**
     * Add a new product category.
     */
    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategory.trim()) {
            const success = addCategory(newCategory.trim());
            if (success) {
                setNewCategory('');
                showNotification("Category added successfully!");
            } else {
                showNotification("Category already exists.", "warning");
            }
        }
    };

    const handleDeleteCategory = (cat) => {
        if(window.confirm(`Delete category "${cat}"?`)) {
            deleteCategory(cat);
            showNotification("Category deleted.");
        }
    };

    /**
     * Commit changes from Local Buffer -> Global Context
     */
    const handleSaveStoreInfo = (e) => {
        e.preventDefault();
        updateStoreInfo(localStoreInfo);
        showNotification("Store settings saved successfully!");
    };

    /**
     * Factory Reset
     * * Wipes all data to restore the demo state.
     * * Critical action requiring confirmation.
     */
    const handleSystemReset = () => {
        if (window.confirm("CRITICAL WARNING: This will wipe ALL data (Products, Orders, Settings). Are you sure?")) {
            resetData();     // Reset Products
            resetSettings(); // Reset Configs
            showNotification("System reset to factory defaults.", "danger");
        }
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
                
                {/* ======================================================== */}
                {/* LEFT COLUMN: STORE INFO & CATEGORIES */}
                {/* ======================================================== */}
                <Col md={8}>
                    
                    {/* 1. GENERAL STORE SETTINGS FORM */}
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4">
                                <Store size={20} className="text-primary me-2" />
                                <h5 className="fw-bold mb-0">General Store Information</h5>
                            </div>
                            
                            <Form onSubmit={handleSaveStoreInfo}>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">STORE NAME</Form.Label>
                                            <InputGroup className="border rounded-pill overflow-hidden bg-light">
                                                <InputGroup.Text className="bg-transparent border-0 pe-0 text-muted">
                                                    <Store size={18}/>
                                                </InputGroup.Text>
                                                <Form.Control 
                                                    className="bg-transparent border-0 shadow-none ps-2" 
                                                    value={localStoreInfo.name} 
                                                    onChange={(e) => setLocalStoreInfo({...localStoreInfo, name: e.target.value})}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">SUPPORT EMAIL</Form.Label>
                                            <InputGroup className="border rounded-pill overflow-hidden bg-light">
                                                <InputGroup.Text className="bg-transparent border-0 pe-0 text-muted">
                                                    <Mail size={18}/>
                                                </InputGroup.Text>
                                                <Form.Control 
                                                    className="bg-transparent border-0 shadow-none ps-2" 
                                                    value={localStoreInfo.email} 
                                                    onChange={(e) => setLocalStoreInfo({...localStoreInfo, email: e.target.value})}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* 2. SHIPPING & FINANCIALS FORM */}
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4">
                                <Truck size={20} className="text-primary me-2" />
                                <h5 className="fw-bold mb-0">Shipping & Financials</h5>
                            </div>
                            
                            <Row className="g-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted">SHIPPING FEE</Form.Label>
                                        <InputGroup className="border rounded-pill overflow-hidden bg-light">
                                            <InputGroup.Text className="bg-transparent border-0 pe-2 text-muted fw-bold">₱</InputGroup.Text>
                                            <Form.Control 
                                                type="number" 
                                                className="bg-transparent border-0 shadow-none ps-0" 
                                                value={localStoreInfo.shippingFee} 
                                                onChange={(e) => setLocalStoreInfo({...localStoreInfo, shippingFee: e.target.value})} 
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted">FREE SHIPPING AT</Form.Label>
                                        <InputGroup className="border rounded-pill overflow-hidden bg-light">
                                            <InputGroup.Text className="bg-transparent border-0 pe-2 text-muted fw-bold">₱</InputGroup.Text>
                                            <Form.Control 
                                                type="number" 
                                                className="bg-transparent border-0 shadow-none ps-0" 
                                                value={localStoreInfo.freeShippingThreshold} 
                                                onChange={(e) => setLocalStoreInfo({...localStoreInfo, freeShippingThreshold: e.target.value})} 
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted">TAX RATE</Form.Label>
                                        <InputGroup className="border rounded-pill overflow-hidden bg-light">
                                            <InputGroup.Text className="bg-transparent border-0 pe-2 text-muted fw-bold">%</InputGroup.Text>
                                            <Form.Control 
                                                type="number" 
                                                className="bg-transparent border-0 shadow-none ps-0" 
                                                value={localStoreInfo.taxRate} 
                                                onChange={(e) => setLocalStoreInfo({...localStoreInfo, taxRate: e.target.value})} 
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="mt-4 text-end">
                                <Button variant="primary" className="rounded-pill fw-bold px-4" onClick={handleSaveStoreInfo}>
                                    <Save size={16} className="me-2"/> Save Changes
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* 3. CATEGORY MANAGEMENT */}
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4">
                                <Tag size={20} className="text-primary me-2" />
                                <h5 className="fw-bold mb-0">Product Categories</h5>
                            </div>
                            
                            <Form onSubmit={handleAddCategory} className="d-flex gap-2 mb-4">
                                <Form.Control 
                                    placeholder="New Category Name" 
                                    className="rounded-pill bg-light border-0"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                />
                                <Button type="submit" variant="outline-primary" className="rounded-pill px-4 d-flex align-items-center">
                                    <Plus size={18} className="me-1"/> Add
                                </Button>
                            </Form>
                            
                            <div className="d-flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <Badge key={cat} bg="light" text="dark" className="border px-3 py-2 d-flex align-items-center gap-2 rounded-pill">
                                        {cat}
                                        <X size={14} className="text-muted cursor-pointer" style={{cursor:'pointer'}} onClick={() => handleDeleteCategory(cat)}/>
                                    </Badge>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* ======================================================== */}
                {/* RIGHT COLUMN: TOGGLES & ACTIONS */}
                {/* ======================================================== */}
                <Col md={4}>
                    
                    {/* SYSTEM TOGGLES (Feature Flags) */}
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4">
                                <ToggleLeft size={20} className="text-primary me-2" />
                                <h5 className="fw-bold mb-0">System Toggles</h5>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3 border-dashed">
                                <div>
                                    <div className="fw-bold">Maintenance</div>
                                    <small className="text-muted">Disable user access</small>
                                </div>
                                <Form.Check type="switch" checked={settings.maintenanceMode} onChange={() => toggleSetting('maintenanceMode')} />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3 border-dashed">
                                <div>
                                    <div className="fw-bold">Sign Ups</div>
                                    <small className="text-muted">Allow registrations</small>
                                </div>
                                <Form.Check type="switch" checked={settings.allowRegistration} onChange={() => toggleSetting('allowRegistration')} />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <div className="fw-bold">Reviews</div>
                                    <small className="text-muted">Enable comments</small>
                                </div>
                                <Form.Check type="switch" checked={settings.enableReviews} onChange={() => toggleSetting('enableReviews')} />
                            </div>
                        </Card.Body>
                    </Card>

                    {/* NOTIFICATIONS (Visual Only) */}
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4">
                                <Bell size={20} className="text-primary me-2" />
                                <h5 className="fw-bold mb-0">Notifications</h5>
                            </div>
                            <Form.Check type="checkbox" label="Email on new order" defaultChecked className="mb-2 text-muted small" />
                            <Form.Check type="checkbox" label="Email on low stock" defaultChecked className="mb-2 text-muted small" />
                            <Form.Check type="checkbox" label="Email on new user signup" className="text-muted small" />
                        </Card.Body>
                    </Card>

                    {/* DANGER ZONE (Factory Reset) */}
                    <Card className="border-danger shadow-sm rounded-4 bg-white">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center gap-2 text-danger mb-3">
                                <ShieldAlert size={20} />
                                <h5 className="fw-bold mb-0">Danger Zone</h5>
                            </div>
                            <p className="small text-muted mb-3">
                                Resetting the system will delete all custom products and restore default inventory.
                            </p>
                            <Button variant="outline-danger" className="w-100 rounded-pill fw-bold py-2" onClick={handleSystemReset}>
                                <RefreshCw size={16} className="me-2"/> Factory Reset
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminSettings;