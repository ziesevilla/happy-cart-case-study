import React, { useState } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Download, TrendingUp, Users, ShoppingBag, FileText } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useUsers } from '../../context/UserContext';

const AdminReports = ({ showNotification }) => {
    // Default to empty array to prevent crashes if Context is loading
    const { orders = [] } = useOrders();
    const { products = [] } = useProducts();
    const { users = [] } = useUsers();

    // STATE: Track the selected date range
    const [dateRange, setDateRange] = useState('All');

    // HELPER: Filter logic based on Date
    const filterByDate = (items) => {
        if (dateRange === 'All') return items;
        
        const now = new Date();
        const daysToSubtract = dateRange === '7Days' ? 7 : 30;
        const pastDate = new Date(now.setDate(now.getDate() - daysToSubtract));

        return items.filter(item => {
            // Assumes item has a 'date' or 'dateAdded' or 'joined' field
            const itemDate = new Date(item.date || item.dateAdded || item.joined);
            return itemDate >= pastDate;
        });
    };

    const convertToCSV = (data) => {
        if (!data || !data.length) return '';
        
        // Extract Headers
        const headers = Object.keys(data[0]).join(',');
        
        // Extract Rows
        const rows = data.map(obj => 
            Object.values(obj).map(val => {
                // FIXED: Use '??' instead of '||' so we don't lose the number 0
                const safeVal = val ?? ''; 
                return `"${String(safeVal).replace(/"/g, '""')}"`;
            }).join(',')
        );
        
        return [headers, ...rows].join('\n');
    };

    const downloadCSV = (csvContent, fileName) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleGenerate = (type) => {
        showNotification(`Generating ${type} Report (${dateRange})...`);
        
        let rawData = [];
        let formattedData = [];
        let filename = `${type}_Report_${dateRange}_${new Date().toISOString().slice(0,10)}.csv`;

        switch(type) {
            case 'Sales':
                // 1. Filter Raw Data First
                rawData = filterByDate(orders);
                
                // 2. Format Data for CSV
                formattedData = rawData.map(o => ({
                    OrderID: o.id,
                    Customer: o.customerName,
                    Date: o.date,
                    Total: o.total,
                    Status: o.status,
                    Items: o.itemsCount 
                }));
                break;
                
            case 'Inventory':
                // Inventory usually doesn't use date filtering, but we process it anyway
                formattedData = products.map(p => ({
                    ID: p.id,
                    Name: p.name,
                    Category: p.category,
                    SubCategory: p.subCategory,
                    Price: p.price,
                    Stock: p.stock,
                    DateAdded: p.dateAdded
                }));
                break;
                
            case 'User Activity':
                rawData = filterByDate(users);
                formattedData = rawData.map(u => ({
                    ID: u.id,
                    Name: u.name,
                    Email: u.email,
                    Role: u.role,
                    Status: u.status,
                    Joined: u.joined
                }));
                break;
            default: return;
        }

        if (formattedData.length > 0) {
            const csv = convertToCSV(formattedData);
            downloadCSV(csv, filename);
        } else {
            showNotification(`No data found for the selected range (${dateRange}).`, "warning");
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header ... */}
            <div className="d-flex align-items-center mb-4">
                <div className="bg-white p-2 rounded-circle shadow-sm me-3 border">
                    <FileText size={24} className="text-primary"/>
                </div>
                <div>
                    <h4 className="fw-bold mb-0">Reports</h4>
                    <p className="text-muted small mb-0">Generate and export system data</p>
                </div>
            </div>

            <Row className="g-4">
                {/* --- SALES REPORT CARD --- */}
                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3 text-primary">
                                <TrendingUp size={24} className="me-2"/>
                                <h5 className="mb-0 fw-bold">Sales Report</h5>
                            </div>
                            <p className="text-muted small mb-4">Export detailed sales data.</p>
                            
                            {/* WORKING DATE FILTER */}
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">DATE RANGE</Form.Label>
                                <Form.Select 
                                    className="rounded-pill bg-light border-0"
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                >
                                    <option value="All">All Time</option>
                                    <option value="7Days">Last 7 Days</option>
                                    <option value="30Days">Last 30 Days</option>
                                </Form.Select>
                            </Form.Group>
                            
                            <Button variant="primary" className="w-100 rounded-pill" onClick={() => handleGenerate("Sales")}>
                                <Download size={16} className="me-2"/> Download CSV
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* ... Inventory and User Activity Cards (Keep mostly the same) ... */}
                {/* Just ensure they use the new handleGenerate which handles the formatting safely */}
                
                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3 text-success">
                                <ShoppingBag size={24} className="me-2"/>
                                <h5 className="mb-0 fw-bold">Inventory Report</h5>
                            </div>
                            <p className="text-muted small mb-4">Current stock levels and valuation.</p>
                            <div className="mt-auto">
                                <Button variant="info" className="w-100 rounded-pill mt-5" onClick={() => handleGenerate("Inventory")}>
                                    <Download size={16} className="me-2"/> Download CSV
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3 text-info">
                                <Users size={24} className="me-2"/>
                                <h5 className="mb-0 fw-bold">User Activity</h5>
                            </div>
                            <p className="text-muted small mb-4">Registered users and join dates.</p>
                            <div className="mt-auto">
                                <Button variant="primary" className="w-100 rounded-pill mt-5" onClick={() => handleGenerate("User Activity")}>
                                    <Download size={16} className="me-2"/> Download CSV
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminReports;