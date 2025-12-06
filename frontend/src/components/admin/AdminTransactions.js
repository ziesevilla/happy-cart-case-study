import React, { useState } from 'react';
import { Table, Button, Badge, Pagination, Row, Col, Card, InputGroup, Form } from 'react-bootstrap';
import { RefreshCcw, XCircle, CheckCircle, Package, LayoutList, LayoutGrid, CreditCard, Banknote, Smartphone, Calendar, Hash, ArrowUpDown, ArrowUp, ArrowDown, Search, Layers } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';

/**
 * AdminTransactions Component
 * * Displays a comprehensive list of transactions with advanced filtering, 
 * sorting, and view modes (List vs Grid). Allows admins to process refunds.
 */
const AdminTransactions = ({ showNotification }) => {
    // --- CONTEXT HOOKS ---
    const { transactions, updateTransactionStatus } = useTransactions();
    
    // --- LOCAL STATE MANAGEMENT ---
    
    // Search and View Mode toggles
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // Options: 'list' | 'grid'
    
    // 💡 PAGINATION STATE & CONFIG
    // Current active page in pagination
    const [currentPage, setCurrentPage] = useState(1);
    // Dynamic items per page based on current view mode for optimal layout
    const itemsPerPage = viewMode === 'list' ? 8 : 12;

    // 💡 STATE: Grouping Mode ('method' or 'status')
    // Controls how cards are categorized in Grid View
    const [groupBy, setGroupBy] = useState('method');

    // --- SORTING STATE ---
    // Stores current sort key and direction (asc/desc)
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    /**
     * Toggles the sorting direction or changes the sort key.
     * If clicking the same key, it flips direction. If new key, defaults to 'asc'.
     * @param {string} key - The data key to sort by (e.g., 'amount', 'date')
     */
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    /**
     * Renders the appropriate sort visual indicator (Up/Down/Neutral arrows).
     */
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-muted ms-1" />;
        if (sortConfig.direction === 'asc') return <ArrowUp size={14} className="text-primary ms-1" />;
        return <ArrowDown size={14} className="text-primary ms-1" />;
    };

    // --- FILTER & SORT LOGIC (DERIVED STATE) ---
    
    // Step 1: Filter raw transactions based on search term
    const filteredTransactions = transactions.filter(trx =>
        trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.method.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Step 2: Sort the filtered results based on sortConfig
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Numeric sorting for Amount
        if (sortConfig.key === 'amount') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Date object sorting
        if (sortConfig.key === 'date') {
            return sortConfig.direction === 'asc'
                ? new Date(aValue) - new Date(bValue)
                : new Date(bValue) - new Date(aValue);
        }

        // Default String comparison
        if (String(aValue) < String(bValue)) return sortConfig.direction === 'asc' ? -1 : 1;
        if (String(aValue) > String(bValue)) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    /**
     * Handles the refund action flow with user confirmation.
     * @param {string} id - Transaction ID
     */
    const handleRefund = (id) => {
        if(window.confirm("Process refund for this transaction?")) {
            updateTransactionStatus(id, 'Refunded');
            showNotification("Refund processed successfully.", "info");
        }
    };
    
    // --- PAGINATION CALCULATIONS ---
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // The items currently visible (Sliced from the sorted array)
    const currentItems = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);

    // Handler to safely change pages within bounds
    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };
    
    // --- PAGINATION RENDERING HELPER ---
    // Generates the array of Pagination components (Numbers, Ellipsis, Prev/Next)
    const renderPaginationItems = () => {
        let items = [];
        const maxVisiblePages = 5; // Limits how many page numbers are shown at once
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust startPage if we are near the end of the list
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Render First/Prev controls
        items.push(<Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />);
        items.push(<Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />);

        // Start Ellipsis
        if (startPage > 1) {
            items.push(<Pagination.Ellipsis key="start-ellipsis" />);
        }

        // Page Numbers
        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>
            );
        }

        // End Ellipsis
        if (endPage < totalPages) {
            items.push(<Pagination.Ellipsis key="end-ellipsis" />);
        }
        
        // Render Next/Last controls
        items.push(<Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />);
        items.push(<Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />);

        return items;
    };
    // --- END PAGINATION RENDERING HELPER ---

    // --- ICON HELPERS ---
    const getMethodIcon = (method) => {
        if (method === 'Credit Card') return <CreditCard size={18}/>;
        if (method === 'GCash') return <Smartphone size={18}/>;
        return <Banknote size={18}/>;
    };

    const getStatusIcon = (status) => {
        if (status === 'Paid') return <CheckCircle size={18} className="text-success"/>;
        if (status === 'Refunded') return <RefreshCcw size={18} className="text-warning"/>;
        return <XCircle size={18} className="text-danger"/>;
    };

    // 💡 DYNAMIC GROUPING FUNCTION
    // Groups the flat array of items based on the selected 'groupBy' state key
    const groupTransactions = (items) => {
        return items.reduce((groups, item) => {
            // Group by 'method' OR 'status' based on state
            const key = item[groupBy] || 'Other';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    };
    
    // Use the *full* sorted list for grid view grouping across pages, 
    // or use currentItems if you want the grid view to also be paginated (which you don't)
    const groupedGridItems = groupTransactions(sortedTransactions);


    return (
        <div className="animate-fade-in">
            {/* --- HEADER SECTION: TITLE & CONTROLS --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                {/* Page Title & Icon */}
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
                    {/* 💡 GROUPING SELECTOR (Only visible in Grid Mode) */}
                    {viewMode === 'grid' && (
                        <InputGroup size="sm" className="border rounded-pill bg-white overflow-hidden">
                            {/* InputGroup.Text (Icon): Remove right border */}
                            <InputGroup.Text className="bg-white border-0 pe-0">
                                <Layers size={16} className="text-muted"/> 
                            </InputGroup.Text>
                            
                            {/* Form.Select (Dropdown): Remove left border */}
                            <Form.Select 
                                value={groupBy} 
                                onChange={(e) => setGroupBy(e.target.value)}
                                className="fw-bold border-start-0" 
                            >
                                <option value="method">Group by Method</option>
                                <option value="status">Group by Status</option>
                            </Form.Select>
                        </InputGroup>
                    )}
                </div>
                
                {/* View Mode Toggles (List vs Grid) */}
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

                {/* Search Bar */}
                <div style={{ width: '300px'}}>
                    <InputGroup size="sm" className="border rounded-pill bg-white overflow-hidden">
                        <InputGroup.Text className="bg-white border-0 pe-0">
                            <Search size={16} className="text-muted"/>
                        </InputGroup.Text>
                        <Form.Control 
                            placeholder="Search transactions..." 
                            className="border-0 shadow-none ps-2"
                            value={searchTerm}
                            // Updates search and resets pagination to page 1
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </InputGroup>
                </div>
            </div>

            {viewMode === 'list' ? (
                // --- LIST VIEW RENDERING ---
                <Card className="bg-white rounded-4 shadow-sm overflow-hidden border mb-4">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                {/* Sortable Columns */}
                                <th className="ps-4 py-3 pointer" onClick={() => handleSort('id')}>
                                    Transaction ID {getSortIcon('id')}
                                </th>
                                <th className="pointer" onClick={() => handleSort('orderId')}>
                                    Order Ref {getSortIcon('orderId')}
                                </th>
                                <th className="pointer" onClick={() => handleSort('date')}>
                                    Date {getSortIcon('date')}
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
                            {/* Use currentItems for pagination logic */}
                            {currentItems.length > 0 ? currentItems.map(trx => (
                                <tr key={trx.id}>
                                    <td className="ps-4 font-monospace small">{trx.id}</td>
                                    <td className="text-primary small">{trx.orderId}</td>
                                    <td className="small text-muted">{trx.date}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            {getMethodIcon(trx.method)} {trx.method}
                                        </div>
                                    </td>
                                    <td className="fw-bold">₱{trx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td>
                                        <Badge bg={trx.status === 'Paid' ? 'success' : trx.status === 'Refunded' ? 'warning' : 'danger'}>
                                            {trx.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        {/* Action Buttons based on Status */}
                                        {trx.status === 'Paid' && (
                                            <Button variant="outline-secondary" size="sm" className="rounded-pill" onClick={() => handleRefund(trx.id)}>
                                                <RefreshCcw size={14} className="me-1"/> Refund
                                            </Button>
                                        )}
                                        {trx.status === 'Failed' && (
                                            <span className="text-danger small"><XCircle size={14} className="me-1"/> Failed</span>
                                        )}
                                        {trx.status === 'Refunded' && (
                                            <span className="text-warning small"><CheckCircle size={14} className="me-1"/> Refunded</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                /* Empty State */
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <Package size={48} className="mb-3 opacity-25"/>
                                        <p>No transactions found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {/* ✅ PAGINATION FOOTER FOR LIST VIEW */}
                    {totalPages > 1 && viewMode === 'list' && (
                        <Card.Footer className="bg-white border-top d-flex justify-content-between align-items-center py-3 px-4">
                            <div className="small text-muted">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedTransactions.length)} of {sortedTransactions.length} transactions
                            </div>
                            <Pagination size="sm" className="mb-0">
                                {renderPaginationItems()}
                            </Pagination>
                        </Card.Footer>
                    )}
                </Card>
            ) : (
                /* --- GRID VIEW RENDERING --- */
                <div className="mb-4">
                    {Object.keys(groupedGridItems).length > 0 ? (
                        Object.keys(groupedGridItems).sort().map(groupKey => (
                            <div key={groupKey} className="mb-5">
                                {/* Group Header Section */}
                                <h5 className="fw-bold text-secondary text-uppercase mb-3 ps-2 border-start border-4 border-primary d-flex align-items-center gap-2">
                                    {/* Show specific icon based on grouping mode */}
                                    {groupBy === 'method' ? getMethodIcon(groupKey) : getStatusIcon(groupKey)}
                                    {groupKey}
                                    <span className="text-muted small ms-2 fw-normal">({groupedGridItems[groupKey].length})</span>
                                </h5>
                                
                                <Row className="g-4">
                                    {groupedGridItems[groupKey].map(trx => (
                                        <Col md={3} key={trx.id}>
                                            <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                                                
                                                {/* 💡 DYNAMIC HEADER: Badge changes based on grouping */}
                                                <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                                                    <span className="font-monospace small text-muted">{trx.id}</span>
                                                    
                                                    {groupBy === 'status' ? (
                                                        // If grouped by status, show Method Badge
                                                        <Badge bg="secondary" className="fw-normal text-white d-flex align-items-center gap-1">
                                                            {getMethodIcon(trx.method)} {trx.method}
                                                        </Badge>
                                                    ) : (
                                                        // If grouped by method, show Status Badge
                                                        <Badge bg={trx.status === 'Paid' ? 'success' : trx.status === 'Refunded' ? 'warning' : 'danger'}>
                                                            {trx.status}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <Card.Body className="p-4">
                                                    <div className="text-center mb-4">
                                                        <h2 className="fw-bold mb-0">₱{trx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                                                        <small className="text-muted">Total Amount</small>
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2 border-dashed">
                                                        <span className="text-muted small d-flex align-items-center"><Hash size={14} className="me-2"/> Order Ref</span>
                                                        <span className="fw-bold text-primary small">{trx.orderId}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <span className="text-muted small d-flex align-items-center"><Calendar size={14} className="me-2"/> Date</span>
                                                        <span className="small fw-bold">{trx.date}</span>
                                                    </div>
                                                    
                                                    {/* Refund Action Button */}
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
                            </div>
                        ))
                    ) : (
                        /* Empty State for Grid */
                        <div className="text-center py-5 text-muted">
                            <Package size={48} className="mb-3 opacity-25"/>
                            <p>No transactions found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ❌ REMOVED: The redundant, unconditional pagination block previously here. */}
        </div>
    );
};

export default AdminTransactions;