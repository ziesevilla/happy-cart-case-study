import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Pagination, Row, Col, Card, InputGroup, Form, Spinner, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { RefreshCcw, XCircle, CheckCircle, Package, LayoutList, LayoutGrid, CreditCard, Banknote, Smartphone, Calendar, Hash, ArrowUpDown, ArrowUp, ArrowDown, Search, Layers, AlertTriangle } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import api from '../../api/axios';

const AdminTransactions = ({ showNotification }) => {
    const { updateTransactionStatus } = useTransactions();
    
    // Data State
    const [adminTransactions, setAdminTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [refundReason, setRefundReason] = useState('');
    const [processingRefund, setProcessingRefund] = useState(false);

    // View/Filter/Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'list' ? 8 : 12;
    const [groupBy, setGroupBy] = useState('method');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await api.get('/transactions');
                setAdminTransactions(response.data);
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
                showNotification("Failed to load transactions", "danger");
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    // --- 2. LOGIC: CHECK ELIGIBILITY ---
    const isEligibleForRefund = (trx) => {
        if (trx.status !== 'Paid') return false;
        
        // Strict Rule: Order must be Cancelled, Returned, or Return Requested to allow a refund.
        const orderStatus = trx.order ? trx.order.status : '';
        const allowedStatuses = ['Cancelled', 'Returned', 'Return Requested'];
        
        return allowedStatuses.includes(orderStatus);
    };

    const getIneligibleReason = (trx) => {
        if (trx.status !== 'Paid') return "Transaction is not Paid.";
        
        if (!trx.order) return "Order data is missing.";

        const orderStatus = trx.order.status || 'Unknown';
        return `Order status is '${orderStatus}'. It must be Cancelled or Returned first.`;
    };

    // --- 3. HANDLERS ---
    const handleOpenRefundModal = (trx) => {
        setSelectedTransaction(trx);
        setRefundReason('');
        setShowRefundModal(true);
    };

    const handleConfirmRefund = async () => {
        if (!selectedTransaction) return;

        setProcessingRefund(true);
        try {
            // 1. Call API via Context (Now passing the correct Numeric ID)
            await updateTransactionStatus(selectedTransaction.id, 'Refunded');
            
            // 2. Optimistic UI Update (Locally in this file)
            setAdminTransactions(prev => prev.map(t => 
                t.id === selectedTransaction.id ? {...t, status: 'Refunded'} : t
            ));
            
            showNotification(`Refund processed for ${selectedTransaction.transaction_number || selectedTransaction.id}`, "success");
            setShowRefundModal(false);
        } catch (error) {
            console.error(error); // Log the specific error
            showNotification("Failed to process refund. Please try again.", "danger");
        } finally {
            setProcessingRefund(false);
        }
    };

    // --- 4. SORTING & FILTERING ---
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const filteredTransactions = adminTransactions.filter(trx =>
        (trx.transaction_number || trx.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trx.order?.order_number || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trx.payment_method || trx.method || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const getVal = (item, key) => {
            if (key === 'amount') return parseFloat(item.amount);
            if (key === 'date' || key === 'created_at') return new Date(item.created_at || item.date);
            if (key === 'id') return item.transaction_number || item.id;
            if (key === 'orderId') return item.order ? item.order.order_number : '';
            if (key === 'method') return item.payment_method || item.method;
            if (key === 'status') return item.status;
            return item[key];
        };
        const aValue = getVal(a, sortConfig.key);
        const bValue = getVal(b, sortConfig.key);

        if (sortConfig.key === 'amount') return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        if (sortConfig.key === 'date' || sortConfig.key === 'created_at') return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        if (String(aValue) < String(bValue)) return sortConfig.direction === 'asc' ? -1 : 1;
        if (String(aValue) > String(bValue)) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // --- 5. PAGINATION ---
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
    
    const renderPaginationItems = () => {
        let items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        if (endPage - startPage + 1 < maxVisiblePages) startPage = Math.max(1, endPage - maxVisiblePages + 1);

        items.push(<Pagination.First key="first" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />);
        items.push(<Pagination.Prev key="prev" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />);
        for (let number = startPage; number <= endPage; number++) {
            items.push(<Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>{number}</Pagination.Item>);
        }
        items.push(<Pagination.Next key="next" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />);
        items.push(<Pagination.Last key="last" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />);
        return items;
    };

    // --- 6. ICONS & GROUPING ---
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-muted ms-1" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-primary ms-1" /> : <ArrowDown size={14} className="text-primary ms-1" />;
    };
    const getMethodIcon = (method) => {
        const m = (method || '').toLowerCase();
        if (m.includes('card')) return <CreditCard size={18}/>;
        if (m.includes('gcash')) return <Smartphone size={18}/>;
        return <Banknote size={18}/>;
    };
    const getStatusIcon = (status) => {
        if (status === 'Paid') return <CheckCircle size={18} className="text-success"/>;
        if (status === 'Refunded') return <RefreshCcw size={18} className="text-warning"/>;
        return <XCircle size={18} className="text-danger"/>;
    };
    const groupTransactions = (items) => {
        return items.reduce((groups, item) => {
            let key = 'Other';
            if (groupBy === 'method') key = item.payment_method || item.method || 'Other';
            if (groupBy === 'status') key = item.status || 'Other';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
        }, {});
    };

    const groupedGridItems = groupTransactions(sortedTransactions);

    // --- 7. HELPER COMPONENT FOR REFUND BUTTON ---
    const RefundButton = ({ trx }) => {
        const eligible = isEligibleForRefund(trx);
        
        if (!eligible && trx.status === 'Paid') {
            return (
                <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>{getIneligibleReason(trx)}</Tooltip>}
                >
                    <span className="d-inline-block" style={{ width: viewMode === 'grid' ? '100%' : 'auto' }}>
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className={`rounded-pill ${viewMode === 'grid' ? 'w-100' : ''}`}
                            disabled
                            style={{ pointerEvents: 'none', opacity: 0.6 }}
                        >
                            <RefreshCcw size={14} className="me-1"/> Refund
                        </Button>
                    </span>
                </OverlayTrigger>
            );
        }

        if (trx.status === 'Paid') {
            return (
                <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className={`rounded-pill ${viewMode === 'grid' ? 'w-100 dashed-border' : ''}`}
                    onClick={() => handleOpenRefundModal(trx)}
                >
                    <RefreshCcw size={14} className="me-1"/> Refund
                </Button>
            );
        }
        
        return null;
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div className="animate-fade-in">
            {/* --- HEADER --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center mb-4">
                    <div className="bg-white p-2 rounded-circle shadow-sm me-3 border">
                        <Banknote size={24} className="text-primary"/>
                    </div>
                    <div>
                        <h4 className="fw-bold mb-0">Transactions</h4>
                        <p className="text-muted small mb-0">Manage order transactions</p>
                    </div>
                </div>

                <div className="d-flex gap-3 align-items-center">
                    {viewMode === 'grid' && (
                        <InputGroup size="sm" className="border rounded-pill bg-white overflow-hidden">
                            <InputGroup.Text className="bg-white border-0 pe-0"><Layers size={16} className="text-muted"/></InputGroup.Text>
                            <Form.Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="fw-bold border-start-0">
                                <option value="method">Group by Method</option>
                                <option value="status">Group by Status</option>
                            </Form.Select>
                        </InputGroup>
                    )}
                </div>
                
                <div className="bg-white p-1 rounded-pill border d-flex">
                    <Button variant={viewMode === 'list' ? 'dark' : 'light'} size="sm" className={`rounded-pill px-3 d-flex align-items-center gap-2 ${viewMode === 'list' ? 'text-white' : 'text-muted'}`} onClick={() => setViewMode('list')}><LayoutList size={14}/> List</Button>
                    <Button variant={viewMode === 'grid' ? 'dark' : 'light'} size="sm" className={`rounded-pill px-3 d-flex align-items-center gap-2 ${viewMode === 'grid' ? 'text-white' : 'text-muted'}`} onClick={() => setViewMode('grid')}><LayoutGrid size={14}/> Grid</Button>
                </div>

                <div style={{ width: '300px'}}>
                    <InputGroup size="sm" className="border rounded-pill bg-white overflow-hidden">
                        <InputGroup.Text className="bg-white border-0 pe-0"><Search size={16} className="text-muted"/></InputGroup.Text>
                        <Form.Control placeholder="Search transactions..." className="border-0 shadow-none ps-2" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}/>
                    </InputGroup>
                </div>
            </div>

            {/* --- LIST VIEW --- */}
            {viewMode === 'list' ? (
                <Card className="bg-white rounded-4 shadow-sm overflow-hidden border mb-4">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 pointer" onClick={() => handleSort('id')}>Transaction ID {getSortIcon('id')}</th>
                                <th className="pointer" onClick={() => handleSort('orderId')}>Order ID {getSortIcon('orderId')}</th>
                                <th className="pointer" onClick={() => handleSort('date')}>Date {getSortIcon('date')}</th>
                                <th className="pointer" onClick={() => handleSort('method')}>Method {getSortIcon('method')}</th>
                                <th className="pointer" onClick={() => handleSort('amount')}>Amount {getSortIcon('amount')}</th>
                                <th className="pointer" onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? currentItems.map(trx => (
                                <tr key={trx.id}>
                                    <td className="ps-4 font-monospace small">{trx.transaction_number || trx.id}</td>
                                    <td className="text-primary small">{trx.order ? trx.order.order_number : 'N/A'}</td>
                                    <td className="small text-muted">{new Date(trx.created_at || trx.date).toLocaleDateString()}</td>
                                    <td><div className="d-flex align-items-center gap-2 text-uppercase">{getMethodIcon(trx.payment_method || trx.method)} {trx.payment_method || trx.method}</div></td>
                                    <td className="fw-bold">₱{parseFloat(trx.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td><Badge bg={trx.status === 'Paid' ? 'success' : trx.status === 'Refunded' ? 'warning' : 'danger'}>{trx.status}</Badge></td>
                                    <td className="text-end pe-4">
                                        <RefundButton trx={trx} />
                                        
                                        {trx.status === 'Failed' && <span className="text-danger small"><XCircle size={14} className="me-1"/> Failed</span>}
                                        {trx.status === 'Refunded' && <span className="text-warning small"><CheckCircle size={14} className="me-1"/> Refunded</span>}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="text-center py-5 text-muted"><Package size={48} className="mb-3 opacity-25"/><p>No transactions found.</p></td></tr>
                            )}
                        </tbody>
                    </Table>
                    {totalPages > 1 && <Card.Footer className="bg-white border-top d-flex justify-content-between align-items-center py-3 px-4"><div className="small text-muted">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedTransactions.length)} of {sortedTransactions.length} transactions</div><Pagination size="sm" className="mb-0">{renderPaginationItems()}</Pagination></Card.Footer>}
                </Card>
            ) : (
                /* --- GRID VIEW --- */
                <div className="mb-4">
                    {Object.keys(groupedGridItems).length > 0 ? Object.keys(groupedGridItems).sort().map(groupKey => (
                        <div key={groupKey} className="mb-5">
                            <h5 className="fw-bold text-secondary text-uppercase mb-3 ps-2 border-start border-4 border-primary d-flex align-items-center gap-2">
                                {groupBy === 'method' ? getMethodIcon(groupKey) : getStatusIcon(groupKey)} {groupKey} <span className="text-muted small ms-2 fw-normal">({groupedGridItems[groupKey].length})</span>
                            </h5>
                            <Row className="g-4">
                                {groupedGridItems[groupKey].map(trx => (
                                    <Col md={3} key={trx.id}>
                                        <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                                            <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                                                <span className="font-monospace small text-muted">{trx.transaction_number || trx.id}</span>
                                                {groupBy === 'status' ? (
                                                    <Badge bg="secondary" className="fw-normal text-white d-flex align-items-center gap-1 text-uppercase">{getMethodIcon(trx.payment_method || trx.method)} {trx.payment_method || trx.method}</Badge>
                                                ) : (
                                                    <Badge bg={trx.status === 'Paid' ? 'success' : trx.status === 'Refunded' ? 'warning' : 'danger'}>{trx.status}</Badge>
                                                )}
                                            </div>
                                            <Card.Body className="p-4">
                                                <div className="text-center mb-4"><h2 className="fw-bold mb-0">₱{parseFloat(trx.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</h2><small className="text-muted">Total Amount</small></div>
                                                <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2 border-dashed"><span className="text-muted small d-flex align-items-center"><Hash size={14} className="me-2"/> Order ID</span><span className="fw-bold text-primary small">{trx.order ? trx.order.order_number : 'N/A'}</span></div>
                                                <div className="d-flex justify-content-between align-items-center mb-3"><span className="text-muted small d-flex align-items-center"><Calendar size={14} className="me-2"/> Date</span><span className="small fw-bold">{new Date(trx.created_at || trx.date).toLocaleDateString()}</span></div>
                                                <RefundButton trx={trx} />
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )) : <div className="text-center py-5 text-muted"><Package size={48} className="mb-3 opacity-25"/><p>No transactions found.</p></div>}
                </div>
            )}

            {/* --- REFUND MODAL --- */}
            <Modal show={showRefundModal} onHide={() => setShowRefundModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Process Refund</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    {selectedTransaction && (
                        <>
                            <div className="alert alert-warning d-flex align-items-start gap-2 mb-3">
                                <AlertTriangle size={20} className="mt-1 flex-shrink-0" />
                                <div className="small">
                                    You are about to refund <strong>₱{parseFloat(selectedTransaction.amount).toLocaleString()}</strong> for Order <strong>{selectedTransaction.order?.order_number}</strong>.
                                    This action cannot be undone.
                                </div>
                            </div>
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted fw-bold">Refund Reason (Optional)</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3} 
                                    placeholder="e.g., Customer requested cancellation..."
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                />
                            </Form.Group>
                            
                            {/* 💡 FIXED UI: Forced Light Background and Explicit Text Colors 
                                This replaces 'bg-light' with a specific style to prevent dark theme overrides.
                            */}
                            <div className="d-flex justify-content-between align-items-center p-3 rounded-3 border" style={{ backgroundColor: '#f8f9fa' }}>
                                <div>
                                    <div className="small text-secondary fw-bold">Refund Method</div>
                                    <div className="fw-bold text-dark text-uppercase">{selectedTransaction.payment_method}</div>
                                </div>
                                <div className="text-end">
                                    <div className="small text-secondary fw-bold">Total Refund</div>
                                    <div className="fw-bold text-danger">- ₱{parseFloat(selectedTransaction.amount).toLocaleString()}</div>
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowRefundModal(false)} disabled={processingRefund}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmRefund} disabled={processingRefund}>
                        {processingRefund ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Processing...</> : 'Confirm Refund'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminTransactions;