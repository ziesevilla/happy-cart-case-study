import React, { useState } from 'react';
import { Table, Badge, Form, Button, Pagination, Row, Col, Card } from 'react-bootstrap';
import { Eye, ArrowUpDown, ArrowUp, ArrowDown, Package, LayoutList, Kanban } from 'lucide-react';
import { useOrders } from '../../context/OrderContext'; // NEW IMPORT

const AdminOrders = ({ showNotification }) => {
    const { orders, updateOrderStatus } = useOrders(); // USE GLOBAL CONTEXT
    const [viewMode, setViewMode] = useState('table'); 
    
    // ... (Rest of Pagination/Sorting State same as before)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // ... (Sorting helpers same as before)
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-muted ms-1" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-primary ms-1" /> : <ArrowDown size={14} className="text-primary ms-1" />;
    };

    const handleStatusUpdate = (id, newStatus) => {
        updateOrderStatus(id, newStatus); // Update Global State
        showNotification(`Order ${id} updated to ${newStatus}`);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Delivered': return 'success';
            case 'Shipped': return 'primary';
            case 'Processing': return 'info';
            case 'Placed': return 'warning';
            case 'Cancelled': return 'secondary';
            default: return 'light';
        }
    };

    // Sort Logic
    const sortedOrders = [...orders].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (sortConfig.key === 'total') return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    // ... (Render Kanban Board - Update map source to 'orders') ...
    const renderKanbanBoard = () => {
        const statuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        return (
            <div className="d-flex gap-3 pb-4 overflow-auto" style={{ minHeight: '600px' }}>
                {statuses.map(status => {
                    const statusOrders = orders.filter(o => o.status === status);
                    const color = getStatusColor(status);
                    
                    return (
                        <div key={status} className="flex-shrink-0" style={{ width: '280px' }}>
                            <div className={`d-flex justify-content-between align-items-center p-3 mb-3 rounded-3 bg-${color} bg-opacity-10 border border-${color}`}>
                                <h6 className={`mb-0 fw-bold text-${color} text-uppercase`}>{status}</h6>
                                <Badge bg={color}>{statusOrders.length}</Badge>
                            </div>
                            <div className="d-flex flex-column gap-3">
                                {statusOrders.map(order => (
                                    <Card key={order.id} className="border-0 shadow-sm">
                                        <Card.Body className="p-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="fw-bold small">{order.id}</span>
                                                <span className="text-muted small">{order.date}</span>
                                            </div>
                                            <h6 className="mb-1">{order.customerName}</h6>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span className="fw-bold text-primary">₱{order.total.toLocaleString()}</span>
                                                <Form.Select 
                                                    size="sm" 
                                                    style={{width: 'auto', fontSize: '0.7rem'}}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                >
                                                    <option value="Placed">Placed</option>
                                                    <option value="Processing">Proc.</option>
                                                    <option value="Shipped">Ship</option>
                                                    <option value="Delivered">Done</option>
                                                    <option value="Cancelled">Cancel</option>
                                                </Form.Select>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Order Management</h4>
                
                <div className="bg-white p-1 rounded-pill border d-flex">
                    <Button variant={viewMode === 'table' ? 'dark' : 'light'} size="sm" className="rounded-pill px-3 d-flex align-items-center gap-2" onClick={() => setViewMode('table')}><LayoutList size={14}/> List</Button>
                    <Button variant={viewMode === 'kanban' ? 'dark' : 'light'} size="sm" className="rounded-pill px-3 d-flex align-items-center gap-2" onClick={() => setViewMode('kanban')}><Kanban size={14}/> Board</Button>
                </div>
            </div>
            
            {viewMode === 'table' ? (
                <>
                    <div className="bg-white rounded-4 shadow-sm overflow-hidden border mb-4">
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-3 pointer" onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
                                    <th className="pointer" onClick={() => handleSort('customerName')}>Customer {getSortIcon('customerName')}</th>
                                    <th className="pointer" onClick={() => handleSort('date')}>Date {getSortIcon('date')}</th>
                                    <th className="pointer" onClick={() => handleSort('total')}>Total {getSortIcon('total')}</th>
                                    <th className="pointer" onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map(order => (
                                    <tr key={order.id}>
                                        <td className="ps-4 fw-bold">{order.id}</td>
                                        <td>{order.customerName}</td>
                                        <td className="text-muted small">{order.date}</td>
                                        <td className="fw-bold">₱{order.total.toLocaleString()}</td>
                                        <td>
                                            <Form.Select 
                                                size="sm" 
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                className={`border-${getStatusColor(order.status)} text-${getStatusColor(order.status)} fw-bold`}
                                                style={{width: '130px'}}
                                            >
                                                <option value="Placed">Placed</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </Form.Select>
                                        </td>
                                        <td className="text-end pe-4">
                                            <Button variant="light" size="sm" className="rounded-circle p-2"><Eye size={16} className="text-primary"/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center">
                            <Pagination>
                                <Pagination.Prev onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} />
                                <Pagination.Next onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </>
            ) : (
                renderKanbanBoard()
            )}
        </div>
    );
};

export default AdminOrders;