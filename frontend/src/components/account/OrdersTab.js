import React, { useState } from 'react';
import { Button, Modal, Form, Alert, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Package, Check, CheckCircle, ShoppingBag, RotateCcw, XCircle, AlertTriangle, Info, UploadCloud, ArrowUpDown, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 
import { useReviews } from '../../context/ReviewContext'; 
import { useOrders } from '../../context/OrderContext'; 
import ReviewModal from '../ReviewModal'; 

const OrdersTab = ({ showNotification }) => {
    const { user } = useAuth(); 
    const { orders: globalOrders, updateOrderStatus } = useOrders(); 
    
    // 💡 1. Destructure Review Helpers
    const { canUserReview } = useReviews(); 
    
    const navigate = useNavigate();
    
    // 💡 2. Filter Orders Safe Check
    const userOrders = globalOrders ? globalOrders.filter(order => order.email === user?.email) : [];

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [sortOption, setSortOption] = useState('date-desc'); 
    
    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 

    // Modal States
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [returnDescription, setReturnDescription] = useState('');
    const [returnProof, setReturnProof] = useState(null);
    const [selectedReturnItems, setSelectedReturnItems] = useState({});

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewProduct, setReviewProduct] = useState(null);

    // --- HELPERS ---
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
    
    // 💡 3. FIXED: Async Cancel Logic (Waits for DB)
    const handleConfirmCancel = async () => {
        await updateOrderStatus(selectedOrder.id, 'Cancelled');
        
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

    // 💡 4. FIXED: Async Return Logic
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

    // 💡 5. Open Review Modal
    const handleReviewClick = (item) => {
        setReviewProduct(item);
        setShowReviewModal(true);
    };

    // --- SORTING ---
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

    // --- PAGINATION ---
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="animate-fade-in">
            
            {/* HEADER ROW */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                
                {/* LEFT: PAGINATION */}
                <div className="order-2 order-md-1">
                    {totalPages > 1 && (
                        <Pagination className="mb-0">
                            <Pagination.Prev 
                                disabled={currentPage === 1} 
                                onClick={() => handlePageChange(currentPage - 1)} 
                            />
                            {[...Array(totalPages)].map((_, idx) => (
                                <Pagination.Item 
                                    key={idx + 1} 
                                    active={idx + 1 === currentPage} 
                                    onClick={() => handlePageChange(idx + 1)}
                                >
                                    {idx + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next 
                                disabled={currentPage === totalPages} 
                                onClick={() => handlePageChange(currentPage + 1)} 
                            />
                        </Pagination>
                    )}
                </div>

                {/* RIGHT: SORT CONTROLS */}
                <div className="d-flex align-items-center gap-2 order-1 order-md-2 ms-auto">
                    <ArrowUpDown size={16} className="text-muted" />
                    <Form.Select 
                        size="sm" 
                        className="rounded-pill border-0 bg-light" 
                        style={{width: 'auto', minWidth: '200px'}}
                        value={sortOption}
                        onChange={(e) => {
                            setSortOption(e.target.value);
                            setCurrentPage(1); 
                        }}
                    >
                        <option value="date-desc">Date: Newest First</option>
                        <option value="date-asc">Date: Oldest First</option>
                        <option value="total-high">Total: High to Low</option>
                        <option value="total-low">Total: Low to High</option>
                        <option value="status">Status</option>
                    </Form.Select>
                </div>
            </div>

            {/* ORDER LIST */}
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
                                <div className="fw-bold">₱{parseFloat(order.total).toLocaleString()}</div>
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
                        <Button variant="primary" className="rounded-pill mt-3" onClick={() => navigate('/products')}>Start Shopping</Button>
                    </div>
                )}
            </div>

            {/* ORDER DETAILS MODAL */}
            <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} centered size="lg">
                <Modal.Header className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Order Details #{selectedOrder?.order_number || selectedOrder?.id}</Modal.Title>
                    <button className="btn-close" onClick={() => setShowOrderModal(false)}></button>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    {selectedOrder && (
                        <>
                            {/* TIMELINE */}
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
                                    <strong>{selectedOrder.date_formatted || selectedOrder.date}</strong>
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
                                {/* 💡 Handle both 'details' (legacy) and 'items' (API) structures */}
                                {(selectedOrder.items || selectedOrder.details || []).map((item, idx) => {
                                    return (
                                        <div 
                                            key={idx} 
                                            className="d-flex align-items-center justify-content-between order-detail-item p-3 rounded-3"
                                            onClick={() => navigate(`/products/${item.product_id || item.id}`)} 
                                            style={{ cursor: 'pointer' }} 
                                            title="View Product Details"
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <img src={item.image} alt={item.product_name || item.name} className="rounded-3" style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                                                <div>
                                                    <h6 className="mb-0 fw-bold small">{item.product_name || item.name}</h6>
                                                    <small className="text-muted">Qty: {item.quantity || item.qty}</small>
                                                    
                                                    {/* 💡 REVIEW BUTTON: Only show if delivered */}
                                                    {selectedOrder.status === 'Delivered' && (
                                                        <div className="mt-1">
                                                            <div 
                                                                    className="text-primary small fw-bold d-flex align-items-center" 
                                                                    style={{cursor: 'pointer', zIndex: 10}} 
                                                                    onClick={(e) => { e.stopPropagation(); handleReviewClick(item); }} 
                                                            >
                                                                    <Star size={12} className="me-1" /> Write a Review
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="fw-bold">₱{parseFloat(item.price).toLocaleString()}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                                <div>
                                    {selectedOrder.status === 'Placed' && <Button variant="danger" size="sm" className="rounded-pill fw-bold" onClick={handleCancelClick}><XCircle size={16} className="me-2" /> Cancel Order</Button>}
                                    {selectedOrder.status === 'Delivered' && <Button variant="outline-danger" size="sm" className="rounded-pill fw-bold" onClick={handleOpenReturn}><RotateCcw size={16} className="me-2" /> Return / Exchange</Button>}
                                </div>
                                <div className="text-end">
                                    <span className="text-muted me-2">Total:</span><span className="fw-bold text-primary fs-5">₱{parseFloat(selectedOrder.total).toLocaleString()}</span>
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* CANCEL MODAL */}
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
                        {/* ... Reason inputs ... */}
                        <div className="d-grid"><Button variant="primary" type="submit" className="rounded-pill fw-bold">Submit Request</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* REVIEW MODAL */}
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