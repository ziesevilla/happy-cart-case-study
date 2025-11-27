import React, { useState } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { Package, Check, CheckCircle, Clock, Truck, ShoppingBag, RotateCcw, XCircle, AlertTriangle, Info, UploadCloud, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import context

const OrdersTab = ({ showNotification }) => {
    // Consuming global orders and updateOrder from AuthContext
    const { orders, updateOrder } = useAuth(); 
    
    // Local UI state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [sortOption, setSortOption] = useState('date-desc'); 
    
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [returnDescription, setReturnDescription] = useState('');
    const [returnProof, setReturnProof] = useState(null);
    const [selectedReturnItems, setSelectedReturnItems] = useState({});

    const getStatusClass = (status) => {
        switch(status) {
            case 'Delivered': return 'status-delivered';
            case 'Shipped': return 'status-shipped';
            case 'Return Requested': return 'status-return';
            case 'Cancelled': return 'status-cancelled';
            default: return 'status-processing';
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

    const handleReturnProofUpload = (e) => {
        const file = e.target.files[0];
        if (file) { setReturnProof(file.name); }
    };

    const handleCancelClick = () => setShowCancelModal(true);
    
    const handleConfirmCancel = () => {
        // Use updateOrder from context
        updateOrder(selectedOrder.id, 'Cancelled');
        setShowCancelModal(false);
        setShowOrderModal(false);
        showNotification("Order cancelled successfully", "secondary");
    };

    const handleOpenReturn = () => {
        setSelectedReturnItems({});
        setReturnReason('');
        setShowOrderModal(false);
        setShowReturnModal(true);
    };

    const handleSubmitReturn = (e) => {
        e.preventDefault();
        // Use updateOrder from context
        updateOrder(selectedOrder.id, 'Return Requested');
        setShowReturnModal(false);
        showNotification("Return request submitted!");
    };

    const toggleReturnItem = (itemId) => {
        setSelectedReturnItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    // Sorting Logic using the context orders
    const sortedOrders = [...orders].sort((a, b) => {
        switch (sortOption) {
            case 'date-desc': return new Date(b.date) - new Date(a.date);
            case 'date-asc': return new Date(a.date) - new Date(b.date);
            case 'total-high': return b.total - a.total;
            case 'total-low': return a.total - b.total;
            case 'status': return a.status.localeCompare(b.status);
            default: return 0;
        }
    });

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-end mb-3">
                <div className="d-flex align-items-center gap-2">
                    <ArrowUpDown size={16} className="text-muted" />
                    <Form.Select 
                        size="sm" 
                        className="rounded-pill border-0 bg-light" 
                        style={{width: 'auto', minWidth: '150px'}}
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="date-desc">Date: Newest First</option>
                        <option value="date-asc">Date: Oldest First</option>
                        <option value="total-high">Total: High to Low</option>
                        <option value="total-low">Total: Low to High</option>
                        <option value="status">Status</option>
                    </Form.Select>
                </div>
            </div>

            <div className="d-flex flex-column gap-3">
                {sortedOrders.length > 0 ? sortedOrders.map((order, idx) => (
                    <div key={idx} className="order-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-4 mb-3 mb-md-0">
                            <div className="bg-light p-3 rounded-3"><Package size={24} className="text-muted"/></div>
                            <div>
                                <h6 className="fw-bold mb-1">Order #{order.id}</h6>
                                <small className="text-muted">{order.date} • {order.itemsCount} Items</small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                            <div className="text-end me-3">
                                <div className="fw-bold">₱{order.total.toLocaleString()}</div>
                                <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span>
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
                    </div>
                )}
            </div>

            {/* ORDER DETAILS MODAL */}
            <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} centered size="lg">
                <Modal.Header className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Order Details #{selectedOrder?.id}</Modal.Title>
                    <button className="btn-close" onClick={() => setShowOrderModal(false)}></button>
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
                                            <div className="timeline-icon">{i < currentStep ? <Check size={16}/> : <CheckCircle size={16}/>}</div>
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
                                            <div><h6 className="mb-0 fw-bold small">{item.name}</h6><small className="text-muted">Qty: {item.qty}</small></div>
                                        </div>
                                        <div className="fw-bold">₱{item.price.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                                <div>
                                    {selectedOrder.status === 'Placed' && <Button variant="danger" size="sm" className="rounded-pill fw-bold" onClick={handleCancelClick}><XCircle size={16} className="me-2" /> Cancel Order</Button>}
                                    {selectedOrder.status === 'Delivered' && <Button variant="outline-danger" size="sm" className="rounded-pill fw-bold" onClick={handleOpenReturn}><RotateCcw size={16} className="me-2" /> Return / Exchange</Button>}
                                </div>
                                <div className="text-end">
                                    <span className="text-muted me-2">Total:</span><span className="fw-bold text-primary fs-5">₱{selectedOrder.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* CANCEL CONFIRMATION MODAL */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered size="sm">
                <Modal.Body className="text-center p-4">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}><AlertTriangle size={24} className="text-danger" /></div>
                    <h5 className="fw-bold mb-2">Cancel Order?</h5>
                    <p className="text-muted small mb-4">This action cannot be undone.</p>
                    <div className="d-grid gap-2">
                        <Button variant="danger" onClick={handleConfirmCancel} className="rounded-pill fw-bold">Yes, Cancel Order</Button>
                        <Button variant="link" onClick={() => setShowCancelModal(false)} className="text-muted text-decoration-none">No, Keep Order</Button>
                    </div>
                </Modal.Body>
            </Modal>
            
            {/* RETURN MODAL */}
            <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Request Return</Modal.Title></Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    <Alert variant="info" className="mb-4 small border-0 rounded-4">
                        <h6 className="fw-bold mb-2 d-flex align-items-center"><Info size={16} className="me-2"/> Return Policy Eligibility</h6>
                        <ul className="mb-0 ps-3"><li>Return within 30 days.</li><li>Items must be unused.</li></ul>
                    </Alert>
                    <Form onSubmit={handleSubmitReturn}>
                        <h6 className="fw-bold mb-3 small text-muted text-uppercase">1. Choose items</h6>
                        <div className="mb-4">
                             {selectedOrder?.details.map((item) => (
                                <div key={item.id} className={`d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 border ${selectedReturnItems[item.id] ? 'border-primary bg-primary-subtle' : 'border-light bg-white'}`} style={{cursor: 'pointer'}} onClick={() => toggleReturnItem(item.id)}>
                                    <div className="d-flex align-items-center gap-3">
                                        <Form.Check type="checkbox" checked={!!selectedReturnItems[item.id]} onChange={() => {}} className="pointer-events-none"/>
                                        <img src={item.image} alt={item.name} className="rounded-3" style={{width: '40px', height: '40px', objectFit: 'cover'}} />
                                        <div><h6 className="mb-0 small fw-bold">{item.name}</h6></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">REASON</Form.Label>
                            <Form.Select className="rounded-pill bg-light border-0" value={returnReason} onChange={(e) => setReturnReason(e.target.value)} required>
                                <option value="">Select...</option>
                                <option value="size">Size issue</option>
                                <option value="damaged">Damaged</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label>
                            <Form.Control as="textarea" rows={3} className="rounded-4 bg-light border-0" value={returnDescription} onChange={(e) => setReturnDescription(e.target.value)} required/>
                        </Form.Group>
                         <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted">PROOF</Form.Label>
                            <div className="d-flex align-items-center">
                                <label className="btn btn-outline-secondary rounded-pill d-flex align-items-center">
                                    <UploadCloud size={18} className="me-2" /> {returnProof ? returnProof : "Upload Photo/Video"}
                                    <input type="file" hidden accept="image/*,video/*" onChange={handleReturnProofUpload} />
                                </label>
                            </div>
                        </Form.Group>
                        <div className="d-grid"><Button variant="primary" type="submit" className="rounded-pill fw-bold">Submit Request</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default OrdersTab;