import React, { useState } from 'react';
import { Table, Button, Badge, Pagination, Row, Col, Card } from 'react-bootstrap';
import { RefreshCcw, XCircle, CheckCircle, Package, LayoutList, LayoutGrid, CreditCard, Banknote, Smartphone, Calendar, Hash, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext'; // NEW IMPORT

const AdminTransactions = ({ showNotification }) => {
    const { transactions, updateTransactionStatus } = useTransactions(); // USE GLOBAL CONTEXT
    
    const [viewMode, setViewMode] = useState('list'); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'list' ? 8 : 12;

    // --- SORTING STATE ---
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-muted ms-1" />;
        if (sortConfig.direction === 'asc') return <ArrowUp size={14} className="text-primary ms-1" />;
        return <ArrowDown size={14} className="text-primary ms-1" />;
    };

    // --- SORT LOGIC ---
    const sortedTransactions = [...transactions].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === 'amount') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (sortConfig.key === 'date') {
            return sortConfig.direction === 'asc' 
                ? new Date(aValue) - new Date(bValue) 
                : new Date(bValue) - new Date(aValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleRefund = (id) => {
        if(window.confirm("Process refund for this transaction?")) {
            updateTransactionStatus(id, 'Refunded');
            showNotification("Refund processed successfully.", "info");
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getMethodIcon = (method) => {
        if (method === 'Credit Card') return <CreditCard size={18}/>;
        if (method === 'GCash') return <Smartphone size={18}/>;
        return <Banknote size={18}/>;
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Financial Records</h4>
                
                <div className="bg-white p-1 rounded-pill border d-flex">
                    <Button 
                        variant={viewMode === 'list' ? 'dark' : 'light'} 
                        size="sm" 
                        className="rounded-pill px-3 d-flex align-items-center gap-2"
                        onClick={() => setViewMode('list')}
                    >
                        <LayoutList size={14}/> List
                    </Button>
                    <Button 
                        variant={viewMode === 'grid' ? 'dark' : 'light'} 
                        size="sm" 
                        className="rounded-pill px-3 d-flex align-items-center gap-2"
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid size={14}/> Grid
                    </Button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-white rounded-4 shadow-sm overflow-hidden border mb-4">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 pointer" onClick={() => handleSort('id')}>
                                    Transaction ID {getSortIcon('id')}
                                </th>
                                <th className="pointer" onClick={() => handleSort('orderId')}>
                                    Order Ref {getSortIcon('orderId')}
                                </th>
                                <th className="pointer" onClick={() => handleSort('method')}>
                                    Method {getSortIcon('method')}
                                </th>
                                <th className="pointer" onClick={() => handleSort('amount')}>
                                    Amount {getSortIcon('amount')}
                                </th>
                                <th className="pointer" onClick={() => handleSort('status')}>
                                    Status {getSortIcon('status')}
                                </th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? currentItems.map(trx => (
                                <tr key={trx.id}>
                                    <td className="ps-4 font-monospace small">{trx.id}</td>
                                    <td className="text-primary small">{trx.orderId}</td>
                                    <td>{trx.method}</td>
                                    <td className="fw-bold">₱{trx.amount.toLocaleString()}</td>
                                    <td>
                                        <Badge bg={trx.status === 'Paid' ? 'success' : trx.status === 'Refunded' ? 'warning' : 'danger'}>
                                            {trx.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        {trx.status === 'Paid' && (
                                            <Button variant="outline-secondary" size="sm" className="rounded-pill" onClick={() => handleRefund(trx.id)}>
                                                <RefreshCcw size={14} className="me-1"/> Refund
                                            </Button>
                                        )}
                                        {trx.status === 'Failed' && (
                                            <span className="text-danger small"><XCircle size={14} className="me-1"/> Payment Failed</span>
                                        )}
                                        {trx.status === 'Refunded' && (
                                            <span className="text-warning small"><CheckCircle size={14} className="me-1"/> Refunded</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <Package size={48} className="mb-3 opacity-25"/>
                                        <p>No transactions found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            ) : (
                /* GRID VIEW */
                <Row className="g-4 mb-4">
                    {currentItems.map(trx => (
                        <Col md={3} key={trx.id}>
                            <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                                    <span className="font-monospace small text-muted">{trx.id}</span>
                                    <Badge bg={trx.status === 'Paid' ? 'success' : trx.status === 'Refunded' ? 'warning' : 'danger'}>{trx.status}</Badge>
                                </div>
                                <Card.Body className="p-4">
                                    <div className="text-center mb-4">
                                        <h2 className="fw-bold mb-0">₱{trx.amount.toLocaleString()}</h2>
                                        <small className="text-muted">Total Amount</small>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2 border-dashed">
                                        <span className="text-muted small d-flex align-items-center"><Hash size={14} className="me-2"/> Order Ref</span>
                                        <span className="fw-bold text-primary small">{trx.orderId}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2 border-dashed">
                                        <span className="text-muted small d-flex align-items-center"><Calendar size={14} className="me-2"/> Date</span>
                                        <span className="small fw-bold">{trx.date}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted small d-flex align-items-center">{getMethodIcon(trx.method)} <span className="ms-2">Method</span></span>
                                        <span className="small fw-bold">{trx.method}</span>
                                    </div>

                                    {trx.status === 'Paid' && (
                                        <Button variant="outline-secondary" size="sm" className="w-100 rounded-pill dashed-border" onClick={() => handleRefund(trx.id)}>
                                            Process Refund
                                        </Button>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center">
                    <Pagination>
                        <Pagination.Prev onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} />
                        {[...Array(totalPages)].map((_, idx) => (
                            <Pagination.Item 
                                key={idx + 1} 
                                active={idx + 1 === currentPage} 
                                onClick={() => handlePageChange(idx + 1)}
                            >
                                {idx + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} />
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default AdminTransactions;