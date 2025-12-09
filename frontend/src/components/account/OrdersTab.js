import React, { useState } from 'react';
import { Button, Modal, Form, Alert, Pagination, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Package, Check, CheckCircle, ShoppingBag, RotateCcw, XCircle, AlertTriangle, Info, ArrowUpDown, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 
import { useReviews } from '../../context/ReviewContext'; 
import { useOrders } from '../../context/OrderContext'; 
import { useSettings } from '../../context/SettingsContext'; 
import ReviewModal from '../ReviewModal'; 

/**
 * OrdersTab Component
 * * Fixed: Payment Method display logic to handle different variable names.
 */
const OrdersTab = ({ showNotification }) => {
    // --- CONTEXT HOOKS ---
    const { user } = useAuth(); 
    const { orders: globalOrders, updateOrderStatus } = useOrders(); 
    const { settings } = useSettings(); 
    
    const navigate = useNavigate();
    
    // Filter Orders
    const userOrders = globalOrders ? globalOrders.filter(order => order.email === user?.email) : [];

    // --- LOCAL STATE MANAGEMENT ---
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [sortOption, setSortOption] = useState('date-desc'); 
    
    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 

    // Modal Visibility States
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    
    // Loading state for cancellation
    const [isCancelling, setIsCancelling] = useState(false);

    // Return Form Data State
    const [returnProof, setReturnProof] = useState(null);
    const [selectedReturnItems, setSelectedReturnItems] = useState({}); 

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewProduct, setReviewProduct] = useState(null);

    // --- HELPER: PRICE FORMATTING ---
    const formatPrice = (amount) => {
        return parseFloat(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // --- HELPER: GET PAYMENT METHOD ---
    // 🆕 Fixes the issue where payment method defaults to 'Credit Card'
    const getPaymentMethod = (order) => {
        // Check multiple possible property names that might come from the backend
        const method = order.payment_method || order.paymentMethod || order.paymentType || 'Credit Card';
        
        // Format the string (e.g., "credit_card" -> "CREDIT CARD")
        return method.replace(/_/g, ' ').toUpperCase();
    };

    // --- VISUAL HELPERS ---
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

    // --- ACTION HANDLERS ---
    const handleReturnProofUpload = (e) => {
        const file = e.target.files[0];
        if (file) { setReturnProof(file.name); }
    };

    const handleCancelClick = () => setShowCancelModal(true);
    
    const handleConfirmCancel = async () => {
        setIsCancelling(true); 
        try {
            await updateOrderStatus(selectedOrder.id, 'Cancelled');
            setShowCancelModal(false);
            setShowOrderModal(false);
            showNotification("Order cancelled successfully", "secondary");
        } catch (error) {
            console.error("Error cancelling order:", error);
            showNotification("Failed to cancel order. Please try again.", "danger");
        } finally {
            setIsCancelling(false); 
        }
    };

    const handleOpenReturn = () => {
        setSelectedReturnItems({});
        setShowOrderModal(false);
        setShowReturnModal(true);
    };

    const handleSubmitReturn = async (e) => {
        e.preventDefault();
        await updateOrderStatus(selectedOrder.id, 'Return Requested');
        setShowReturnModal(false);
        showNotification("Return request submitted!");
    };

    const toggleReturnItem = (itemId) => {
        setSelectedReturnItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleReviewClick = (item) => {
        setReviewProduct(item);
        setShowReviewModal(true);
    };

    // --- DATA PROCESSING ---
    const sortedOrders = [...userOrders].sort((a, b) => {
        switch (sortOption) {
            case 'date-desc': return new Date(b.date || 0) - new Date(a.date || 0);
            case 'date-asc': return new Date(a.date || 0) - new Date(b.date || 0);
            case 'total-high': return b.total - a.total;
            case 'total-low': return a.total - b.total;
            case 'status': return (a.status || '').localeCompare(b.status || '');
            default: return 0;
        }
    });

    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="animate-fade-in">
            
            {/* --- HEADER --- */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <div className="order-2 order-md-1">
                    {totalPages > 1 && (
                        <Pagination className="mb-0">
                            <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
                            {[...Array(totalPages)].map((_, idx) => (
                                <Pagination.Item key={idx + 1} active={idx + 1 === currentPage} onClick={() => handlePageChange(idx + 1)}>
                                    {idx + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} />
                        </Pagination>
                    )}
                </div>
                <div className="d-flex align-items-center gap-2 order-1 order-md-2 ms-auto">
                    <ArrowUpDown size={16} className="text-muted" />
                    <Form.Select 
                        size="sm" 
                        className="rounded-pill border-0 bg-light" 
                        style={{width: 'auto', minWidth: '200px'}}
                        value={sortOption}
                        onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="date-desc">Date: Newest First</option>
                        <option value="date-asc">Date: Oldest First</option>
                        <option value="total-high">Total: High to Low</option>
                        <option value="total-low">Total: Low to High</option>
                        <option value="status">Status</option>
                    </Form.Select>
                </div>
            </div>

            {/* --- ORDER LIST --- */}
            <div className="d-flex flex-column gap-3">
                {currentOrders.length > 0 ? currentOrders.map((order, idx) => (
                    <div key={idx} className="order-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-4 mb-3 mb-md-0">
                            <div className="bg-light p-3 rounded-3"><Package size={24} className="text-muted"/></div>
                            <div>
                                <h6 className="fw-bold mb-1">Order #{order.order_number || order.id}</h6>
                                <small className="text-muted">{order.date_formatted || order.date} • {order.itemsCount || order.items_count} Items</small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                            <div className="text-end me-3">
                                <div className="fw-bold">₱{formatPrice(order.total)}</div>
                                <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span>
                            </div>
                            <Button variant="outline-dark" size="sm" className="rounded-pill px-3" onClick={() => {setSelectedOrder(order); setShowOrderModal(true);}}>
                                Details
                            </Button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state text-center py-5">
                        <ShoppingBag size={48} className="mb-3 opacity-25" />
                        <h5>No orders yet</h5>
                        <p className="text-muted">Looks like you haven't made any purchases yet.</p>
                        <Button variant="primary" className="rounded-pill mt-3" onClick={() => navigate('/')}>Start Shopping</Button>
                    </div>
                )}
            </div>

            {/* --- ORDER DETAILS MODAL --- */}
            <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} centered size="lg">
                <Modal.Header className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Order Details #{selectedOrder?.order_number || selectedOrder?.id}</Modal.Title>
                    <button className="btn-close" onClick={() => setShowOrderModal(false)}></button>
                </Modal.Header>
                
                <Modal.Body className="p-0 bg-light"> 
                    {selectedOrder && (
                        <>
                            {/* 1. STATUS TIMELINE */}
                            <div className="bg-white pt-4 pb-5 px-4 border-bottom">
                                <div className="timeline position-relative">
                                    {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                                        const currentStep = getStatusStep(selectedOrder.status);
                                        const isCompleted = i <= currentStep && selectedOrder.status !== 'Cancelled';
                                        return (
                                            <div key={step} className={`timeline-step position-relative z-1 ${isCompleted ? 'active' : ''}`} style={{textAlign: 'center', flex: 1}}>
                                                <div 
                                                    className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm ${isCompleted ? 'bg-success text-white' : 'bg-light text-muted'}`} 
                                                    style={{width: '32px', height: '32px', transition: 'all 0.3s', border: isCompleted ? 'none' : '1px solid #dee2e6'}}
                                                >
                                                    {isCompleted ? <Check size={16} strokeWidth={3}/> : <div style={{width: '8px', height: '8px', borderRadius: '50%', background: '#adb5bd'}}></div>}
                                                </div>
                                                <span className={`small fw-bold ${isCompleted ? 'text-success' : 'text-muted'}`}>{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {selectedOrder.status === 'Cancelled' && (
                                    <div className="mt-4 text-center">
                                        <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill border border-danger">
                                            <XCircle size={14} className="me-1"/> Order Cancelled
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                {/* 2. ORDER CONTEXT GRID */}
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="h-100 p-3 bg-white rounded-3 border shadow-sm">
                                            <h6 className="text-muted small fw-bold text-uppercase mb-3 d-flex align-items-center">
                                                <Package size={14} className="me-2 text-primary"/> Shipping Details
                                            </h6>
                                            <div className="fw-bold text-dark mb-1 fs-6">
                                                {selectedOrder.shipping_address?.firstName || user?.name} {selectedOrder.shipping_address?.lastName}
                                            </div>
                                            <div className="text-secondary small mb-2" style={{lineHeight: '1.5'}}>
                                                {selectedOrder.shipping_address?.street || '123 Street Name'}<br/>
                                                {selectedOrder.shipping_address?.city || 'City'}, {selectedOrder.shipping_address?.zip || '0000'}
                                            </div>
                                            <span className="badge bg-light text-dark border mt-2">Standard Delivery</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="h-100 p-3 bg-white rounded-3 border shadow-sm">
                                            <h6 className="text-muted small fw-bold text-uppercase mb-3 d-flex align-items-center">
                                                <CheckCircle size={14} className="me-2 text-success"/> Payment Info
                                            </h6>
                                            {/* 🆕 UPDATED: Uses the robust check function */}
                                            <div className="fw-bold text-dark mb-1 fs-6">
                                                {getPaymentMethod(selectedOrder)}
                                            </div>
                                            <div className="text-secondary small mb-2">Amount Paid</div>
                                            <div className="fw-bold text-success fs-5">₱{formatPrice(selectedOrder.total)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. ITEMS LIST */}
                                <div className="bg-white rounded-3 border shadow-sm overflow-hidden mb-4">
                                    <div className="bg-light px-3 py-2 border-bottom">
                                         <h6 className="text-muted small fw-bold text-uppercase mb-0">Items Ordered</h6>
                                    </div>
                                    {(selectedOrder.items || selectedOrder.details || []).map((item, idx) => (
                                        <div key={idx} className="d-flex align-items-center p-3 border-bottom last-border-none">
                                            <img src={item.image} alt={item.name} className="rounded-3 border" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                                            <div className="ms-3 flex-grow-1">
                                                <h6 className="mb-1 fw-bold text-dark">{item.product_name || item.name}</h6>
                                                <div className="text-muted small">Qty: {item.quantity || 1}</div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-dark">₱{formatPrice(item.price)}</div>
                                                {selectedOrder.status === 'Delivered' && settings.enableReviews && (
                                                    <div className="mt-1 text-primary small fw-bold d-flex align-items-center justify-content-end" style={{cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); handleReviewClick(item); }}>
                                                        <Star size={12} className="me-1" /> Review
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 4. PRICE BREAKDOWN */}
                                <div className="row justify-content-end">
                                    <div className="col-md-6">
                                        <div className="bg-white p-3 rounded-3 border shadow-sm">
                                            <div className="d-flex justify-content-between mb-2 small">
                                                <span className="text-muted">Subtotal</span>
                                                <span className="fw-bold text-dark">₱{formatPrice((selectedOrder.items || []).reduce((acc, item) => acc + (parseFloat(item.price) * (item.quantity || 1)), 0))}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2 small">
                                                <span className="text-muted">Shipping Fee</span>
                                                <span className="fw-bold text-dark">₱150.00</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-3 small">
                                                <span className="text-muted">Tax (12%)</span>
                                                <span className="fw-bold text-dark">₱{formatPrice(parseFloat(selectedOrder.total) * 0.12)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between border-top pt-3 align-items-center">
                                                <span className="fw-bold fs-6 text-dark">Total Amount</span>
                                                <span className="fw-bold fs-4 text-primary">₱{formatPrice(selectedOrder.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer className="bg-light border-top-0 px-4 py-3">
                    {selectedOrder?.status === 'Placed' && (
                        <Button 
                            variant="outline-danger" 
                            className="rounded-pill fw-bold px-4" 
                            onClick={handleCancelClick}
                            disabled={isCancelling}
                        >
                            Cancel Order
                        </Button>
                    )}
                    <Button variant="outline-dark" className="rounded-pill fw-bold px-4 ms-auto" onClick={() => setShowOrderModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* --- CANCEL CONFIRMATION MODAL --- */}
            <Modal show={showCancelModal} onHide={() => !isCancelling && setShowCancelModal(false)} centered size="sm">
                <Modal.Body className="text-center p-4">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}><AlertTriangle size={24} className="text-danger" /></div>
                    <h5 className="fw-bold mb-2">Cancel Order?</h5>
                    <p className="text-muted small mb-4">This action cannot be undone.</p>
                    <div className="d-grid gap-2">
                        <Button 
                            variant="danger" 
                            onClick={handleConfirmCancel} 
                            className="rounded-pill fw-bold"
                            disabled={isCancelling} 
                        >
                            {isCancelling ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Cancelling...
                                </>
                            ) : (
                                "Yes, Cancel Order"
                            )}
                        </Button>
                        <Button 
                            variant="link" 
                            onClick={() => setShowCancelModal(false)} 
                            className="text-muted text-decoration-none"
                            disabled={isCancelling} 
                        >
                            No, Keep Order
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
            
            {/* --- RETURN REQUEST MODAL --- */}
            <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Request Return</Modal.Title></Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    <Alert variant="info" className="mb-4 small border-0 rounded-4">
                        <h6 className="fw-bold mb-2 d-flex align-items-center"><Info size={16} className="me-2"/> Return Policy Eligibility</h6>
                        <ul className="mb-0 ps-3"><li>Return within 30 days.</li><li>Items must be unused.</li></ul>
                    </Alert>
                    <Form onSubmit={handleSubmitReturn}>
                        <h6 className="fw-bold mb-3 small text-muted text-uppercase">1. Choose items to return</h6>
                        <div className="mb-4">
                             {(selectedOrder?.items || selectedOrder?.details || []).map((item) => (
                                <div key={item.id} className={`d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 border ${selectedReturnItems[item.id] ? 'border-primary bg-primary-subtle' : 'border-light bg-white'}`} style={{cursor: 'pointer', transition: 'all 0.2s'}} onClick={() => toggleReturnItem(item.id)}>
                                    <div className="d-flex align-items-center gap-3">
                                        <Form.Check type="checkbox" checked={!!selectedReturnItems[item.id]} onChange={() => {}} className="pointer-events-none"/>
                                        <img src={item.image} alt={item.product_name || item.name} className="rounded-3" style={{width: '40px', height: '40px', objectFit: 'cover'}} />
                                        <div><h6 className="mb-0 small fw-bold">{item.product_name || item.name}</h6></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="d-grid"><Button variant="primary" type="submit" className="rounded-pill fw-bold">Submit Request</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* --- REVIEW SUBMISSION MODAL --- */}
            {reviewProduct && (
                <ReviewModal 
                    show={showReviewModal} 
                    onHide={() => setShowReviewModal(false)} 
                    product={reviewProduct}
                    orderId={selectedOrder?.id}
                    showNotification={showNotification}
                />
            )}
        </div>
    );
};

export default OrdersTab;