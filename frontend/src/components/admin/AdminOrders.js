import React, { useState } from 'react';
import { Table, Button, Form, InputGroup, Row, Col, Card, Badge, Dropdown } from 'react-bootstrap';
import { Search, ShoppingBag, User, MapPin, Calendar, X, MoreVertical, Truck, CheckCircle, XCircle, Clock} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext'; 

const AdminOrders = ({ showNotification }) => {
    const { orders, updateOrderStatus } = useOrders();
    const { products } = useProducts(); 
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null); 

    const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)); 

    const filteredOrders = sortedOrders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusVariant = (status) => {
        switch(status) {
            case 'Delivered': return 'success';
            case 'Shipped': return 'info';
            case 'Processing': return 'primary';
            case 'Pending': return 'warning';
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

    const handleStatusUpdate = (newStatus) => {
        if (!selectedOrder) return;
        updateOrderStatus(selectedOrder.id, newStatus);
        setSelectedOrder(prev => ({...prev, status: newStatus}));
        showNotification(`Order ${selectedOrder.id} updated to ${newStatus}`);
    };

    // 💡 Helper to calculate totals
    const calculateTotals = (details) => {
        if (!details) return { subtotal: 0, shipping: 0, total: 0 };
        const subtotal = details.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const shipping = 150;
        const total = subtotal + shipping;
        return { subtotal, shipping, total };
    };

    const { subtotal, shipping, total } = selectedOrder ? calculateTotals(selectedOrder.details) : { subtotal: 0, shipping: 0, total: 0 };

    // 💡 HELPER: Currency Formatter
    const formatCurrency = (amount) => {
        return amount.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
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
                                <p className="text-muted small mb-0">Manage orders by customers</p>
                            </div>
                        </div>
                        <div style={{ width: '300px'}}>
                            <InputGroup size="sm" className="border rounded-pill bg-white overflow-hidden">
                                <InputGroup.Text className="bg-white border-0 pe-0">
                                    <Search size={16} className="text-muted"/>
                                </InputGroup.Text>
                                <Form.Control 
                                    placeholder="Search orders..." 
                                    className="border-0 shadow-none ps-2" // Remove border, focus shadow, and add padding left
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                    </div>

                    <Card className="border-0 shadow-sm flex-grow-1 overflow-hidden">
                        <div className="overflow-auto h-100">
                            <Table hover className="mb-0 align-middle table-borderless">
                                <thead className="bg-light sticky-top" style={{zIndex: 1}}>
                                    <tr>
                                        <th className="ps-4 text-muted small">Order ID</th>
                                        <th className="text-muted small">Status</th>
                                        <th className="text-end pe-4 text-muted small">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(order => {
                                        const orderTotals = calculateTotals(order.details);
                                        return (
                                            <tr 
                                                key={order.id} 
                                                onClick={() => setSelectedOrder(order)}
                                                style={{ cursor: 'pointer', backgroundColor: selectedOrder?.id === order.id ? '#f0f9ff' : 'transparent' }}
                                                className="border-bottom"
                                            >
                                                <td className="ps-4 py-3">
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-bold text-dark">{order.id}</span>
                                                        <small className="text-muted">{order.customerName}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusVariant(order.status)} className="fw-normal rounded-pill px-2 d-inline-flex align-items-center">
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-end pe-4">
                                                    {/* Display Formatted Total */}
                                                    <div className="fw-bold text-dark">₱{formatCurrency(orderTotals.total)}</div>
                                                    <small className="text-muted">{order.date}</small>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </Col>

                {/* --- RIGHT COLUMN: ORDER DETAILS --- */}
                {selectedOrder && (
                    <Col md={7} className="h-100 animate-slide-in-right">
                        <Card className="border-0 shadow-sm h-100 overflow-hidden">
                            
                            <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <h3 className="fw-bold mb-0 text-primary">{selectedOrder.id}</h3>
                                        <Badge bg={getStatusVariant(selectedOrder.status)} className="rounded-pill px-3 py-2">
                                            {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                                        </Badge>
                                    </div>
                                    <small className="text-muted d-flex align-items-center gap-2">
                                        <Calendar size={14}/> Placed on {selectedOrder.date}
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
                                                <div className="fw-bold">{selectedOrder.customerName}</div>
                                                <div className="text-muted small">{selectedOrder.email}</div>
                                                <div className="text-muted small">+63 912 345 6789</div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="p-3 border rounded-3 h-100">
                                                <h6 className="fw-bold text-muted small mb-3 text-uppercase"><MapPin size={14} className="me-1 mb-1"/> Shipping Address</h6>
                                                <div className="small text-dark">
                                                    {selectedOrder.shippingAddress?.street}<br/>
                                                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.zip}<br/>
                                                    Philippines
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>

                                    <h6 className="fw-bold text-muted small mb-3 text-uppercase"><ShoppingBag size={14} className="me-1 mb-1"/> Items ({selectedOrder.details?.length || 0})</h6>
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
                                                {selectedOrder.details && selectedOrder.details.length > 0 ? (
                                                    selectedOrder.details.map((item, index) => {
                                                        const liveProduct = products.find(p => p.id === item.id);
                                                        const displayImage = liveProduct?.image || item.image;
                                                        const displayName = liveProduct?.name || item.name;
                                                        
                                                        return (
                                                            <tr key={index}>
                                                                <td className="ps-3 py-3">
                                                                    <div className="d-flex align-items-center gap-3">
                                                                        <div className="rounded bg-light d-flex align-items-center justify-content-center border overflow-hidden" style={{width: '40px', height: '40px'}}>
                                                                            {displayImage ? (
                                                                                <img src={displayImage} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                                                                            ) : (
                                                                                <ShoppingBag size={16} className="text-muted"/>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="fw-bold small">{displayName}</div>
                                                                            <div className="text-muted small">₱{formatCurrency(item.price)}</div>
                                                                            {!liveProduct && <Badge bg="danger" style={{fontSize: '0.6rem'}}>Discontinued</Badge>}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="text-center fw-bold text-muted">x{item.qty}</td>
                                                                <td className="text-end pe-3 fw-bold">₱{formatCurrency(item.price * item.qty)}</td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr><td colSpan="3" className="text-center py-3 text-muted">No items details available.</td></tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>

                                    {/* 💡 ORDER SUMMARY FOOTER */}
                                    <div className="d-flex justify-content-end">
                                        <div style={{minWidth: '250px'}}>
                                            <div className="d-flex justify-content-between mb-2 small text-muted">
                                                <span>Subtotal</span>
                                                {/* 💡 Formatted Subtotal */}
                                                <span>₱{formatCurrency(subtotal)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2 small text-muted">
                                                <span>Shipping</span>
                                                {/* 💡 Formatted Shipping */}
                                                <span>₱{formatCurrency(shipping)}</span>
                                            </div>
                                            <hr/>
                                            <div className="d-flex justify-content-between fw-bold text-dark fs-5">
                                                <span>Total</span>
                                                {/* 💡 Formatted Total */}
                                                <span>₱{formatCurrency(total)}</span>
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