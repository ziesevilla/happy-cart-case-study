import React, { useState } from 'react';
import { Table, Button, Form, InputGroup, Row, Col, Card, Badge, Dropdown, Pagination } from 'react-bootstrap'; 
import { Search, ShoppingBag, User, MapPin, Calendar, X, MoreVertical, Truck, CheckCircle, XCircle, Clock} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext'; 

const AdminOrders = ({ showNotification }) => {
    const { orders, updateOrderStatus } = useOrders();
    // Note: We don't necessarily need 'products' if the order items have everything
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null); 
    
    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7; 
    
    // 💡 FIX 1: Sort safely
    const sortedOrders = [...(orders || [])].sort((a, b) => 
        new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
    ); 

    const filteredOrders = sortedOrders.filter(order => 
        (order.order_number || order.id).toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName || order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    
    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        setSelectedOrder(null); 
    };

    const getStatusVariant = (status) => {
        switch(status) {
            case 'Delivered': return 'success';
            case 'Shipped': return 'info';
            case 'Processing': return 'primary';
            case 'Pending': case 'Placed': return 'warning';
            case 'Cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Delivered': return <CheckCircle size={16} className="me-1"/>;
            case 'Shipped': return <Truck size={16} className="me-1"/>;
            case 'Cancelled': return <XCircle size={16} className="me-1"/>;
            default: return <Clock size={16} className="me-1"/>;
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedOrder) return;
        
        // 💡 FIX 2: Async update
        await updateOrderStatus(selectedOrder.id, newStatus);
        
        // Update local selection to reflect change immediately
        setSelectedOrder(prev => ({...prev, status: newStatus}));
        showNotification(`Order updated to ${newStatus}`);
    };

    // 💡 FIX 3: Map 'items' vs 'details'
    const getOrderItems = (order) => order.items || order.details || [];

    // Helper to calculate totals (if not provided by backend)
    const calculateTotals = (items) => {
        if (!items) return { subtotal: 0, shipping: 0, total: 0 };
        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        // Assuming logic: Free > 5000
        const shipping = subtotal >= 5000 ? 0 : 150;
        const total = subtotal + shipping;
        return { subtotal, shipping, total };
    };

    // Helper: Get safe values for selected order
    const activeItems = selectedOrder ? getOrderItems(selectedOrder) : [];
    // Use API total if available, else calculate
    const displayTotal = selectedOrder 
        ? (parseFloat(selectedOrder.total) || calculateTotals(activeItems).total) 
        : 0;

    const formatCurrency = (amount) => {
        return parseFloat(amount).toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };
    
    const renderPaginationItems = () => {
        let items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        items.push(<Pagination.First key="first" onClick={() => paginate(1)} disabled={currentPage === 1} />);
        items.push(<Pagination.Prev key="prev" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />);

        if (startPage > 1) items.push(<Pagination.Ellipsis key="start-ellipsis" />);

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>
                    {number}
                </Pagination.Item>
            );
        }

        if (endPage < totalPages) items.push(<Pagination.Ellipsis key="end-ellipsis" />);
        
        items.push(<Pagination.Next key="next" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />);
        items.push(<Pagination.Last key="last" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />);

        return items;
    };

    return (
        <div className="animate-fade-in h-100">
            <Row className="h-100 g-4">
                <Col md={selectedOrder ? 5 : 12} className={`d-flex flex-column ${selectedOrder ? 'd-none d-md-flex' : ''}`}>
                    
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center mb-4">
                            <div className="bg-white p-2 rounded-circle shadow-sm me-3 border">
                                <ShoppingBag size={24} className="text-primary"/>
                            </div>
                            <div>
                                <h4 className="fw-bold mb-0">Orders</h4>
                                <p className="text-muted small mb-0">Manage customer orders</p>
                            </div>
                        </div>
                        <div style={{ width: '300px'}}>
                            <InputGroup size="sm" className="border rounded-pill bg-white overflow-hidden">
                                <InputGroup.Text className="bg-white border-0 pe-0">
                                    <Search size={16} className="text-muted"/>
                                </InputGroup.Text>
                                <Form.Control 
                                    placeholder="Search orders..." 
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

                    <Card className="border-0 shadow-sm flex-grow-1">
                        <div> 
                            <Table hover className="mb-0 align-middle table-borderless">
                                <thead className="bg-light sticky-top" style={{zIndex: 1}}>
                                    <tr>
                                        <th className="ps-4 text-muted small">Order ID</th>
                                        <th className="text-muted small">Status</th>
                                        <th className="text-end pe-4 text-muted small">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOrders.length > 0 ? (
                                        currentOrders.map(order => (
                                            <tr 
                                                key={order.id} 
                                                onClick={() => setSelectedOrder(order)}
                                                style={{ cursor: 'pointer', backgroundColor: selectedOrder?.id === order.id ? '#f0f9ff' : 'transparent' }}
                                                className="border-bottom"
                                            >
                                                <td className="ps-4 py-3">
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-bold text-dark">{order.order_number || order.id}</span>
                                                        <small className="text-muted">{order.customerName || order.customer_name}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusVariant(order.status)} className="fw-normal rounded-pill px-2 d-inline-flex align-items-center">
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <div className="fw-bold text-dark">₱{formatCurrency(order.total)}</div>
                                                    <small className="text-muted">{order.date_formatted || order.date}</small>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-5 text-muted">
                                                No orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                        
                        {totalPages > 1 && (
                            <Card.Footer className="bg-white border-top d-flex justify-content-between align-items-center py-3">
                                <div className="small text-muted">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
                                </div>
                                <Pagination size="sm" className="mb-0">
                                    {renderPaginationItems()}
                                </Pagination>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>

                {/* --- RIGHT COLUMN: ORDER DETAILS --- */}
                {selectedOrder && (
                    <Col md={7} className="h-100 animate-slide-in-right">
                        <Card className="border-0 shadow-sm h-100 overflow-hidden">
                            <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <h3 className="fw-bold mb-0 text-primary">{selectedOrder.order_number || selectedOrder.id}</h3>
                                        <Badge bg={getStatusVariant(selectedOrder.status)} className="rounded-pill px-3 py-2">
                                            {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                                        </Badge>
                                    </div>
                                    <small className="text-muted d-flex align-items-center gap-2">
                                        <Calendar size={14}/> Placed on {selectedOrder.date_formatted || selectedOrder.date}
                                    </small>
                                </div>
                                <div className="d-flex gap-2">
                                    <Dropdown>
                                        <Dropdown.Toggle variant="white" size="sm" className="border rounded-pill px-3 fw-bold">
                                            Update Status
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu align="end">
                                            <Dropdown.Item onClick={() => handleStatusUpdate('Pending')}>Pending</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleStatusUpdate('Processing')}>Processing</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleStatusUpdate('Shipped')}>Shipped</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleStatusUpdate('Delivered')}>Delivered</Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={() => handleStatusUpdate('Cancelled')} className="text-danger">Cancelled</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <Button variant="light" size="sm" className="rounded-circle p-2" onClick={() => setSelectedOrder(null)}>
                                        <X size={20} />
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-auto p-0 flex-grow-1 bg-white">
                                <div className="p-4">
                                    <Row className="g-4 mb-4">
                                        <Col md={6}>
                                            <div className="p-3 border rounded-3 h-100">
                                                <h6 className="fw-bold text-muted small mb-3 text-uppercase"><User size={14} className="me-1 mb-1"/> Customer</h6>
                                                <div className="fw-bold">{selectedOrder.customerName || selectedOrder.customer_name}</div>
                                                <div className="text-muted small">{selectedOrder.email}</div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="p-3 border rounded-3 h-100">
                                                <h6 className="fw-bold text-muted small mb-3 text-uppercase"><MapPin size={14} className="me-1 mb-1"/> Shipping Address</h6>
                                                <div className="small text-dark">
                                                    {/* Handle address structure from DB or mock */}
                                                    {selectedOrder.shippingAddress?.street || selectedOrder.shipping_address?.street}<br/>
                                                    {selectedOrder.shippingAddress?.city || selectedOrder.shipping_address?.city}, {selectedOrder.shippingAddress?.zip || selectedOrder.shipping_address?.zip}<br/>
                                                    Philippines
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>

                                    <h6 className="fw-bold text-muted small mb-3 text-uppercase"><ShoppingBag size={14} className="me-1 mb-1"/> Items ({activeItems.length})</h6>
                                    <div className="border rounded-3 overflow-hidden mb-4">
                                        <Table className="mb-0 align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="ps-3 small text-muted">Product</th>
                                                    <th className="text-center small text-muted">Qty</th>
                                                    <th className="text-end pe-3 small text-muted">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeItems.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="ps-3 py-3">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="rounded bg-light d-flex align-items-center justify-content-center border overflow-hidden" style={{width: '40px', height: '40px'}}>
                                                                    {item.image ? (
                                                                        <img src={item.image} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                                                                    ) : (
                                                                        <ShoppingBag size={16} className="text-muted"/>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="fw-bold small">{item.product_name || item.name}</div>
                                                                    <div className="text-muted small">₱{formatCurrency(item.price)}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-center fw-bold text-muted">x{item.quantity || item.qty}</td>
                                                        <td className="text-end pe-3 fw-bold">₱{formatCurrency(item.price * (item.quantity || item.qty))}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>

                                    <div className="d-flex justify-content-end">
                                        <div style={{minWidth: '250px'}}>
                                            <div className="d-flex justify-content-between mb-2 small text-muted">
                                                <span>Subtotal</span>
                                                <span>₱{formatCurrency(calculateTotals(activeItems).subtotal)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2 small text-muted">
                                                <span>Shipping</span>
                                                <span>₱{formatCurrency(calculateTotals(activeItems).shipping)}</span>
                                            </div>
                                            <hr/>
                                            <div className="d-flex justify-content-between fw-bold text-dark fs-5">
                                                <span>Total</span>
                                                <span>₱{formatCurrency(displayTotal)}</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default AdminOrders;