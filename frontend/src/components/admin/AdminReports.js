import React from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Download, TrendingUp, Users, ShoppingBag, FileText } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useUsers } from '../../context/UserContext';

/**
 * AdminReports Component
 * * Allows administrators to export raw data (Sales, Inventory, Users) as CSV files.
 * * Uses client-side logic to generate files without needing a backend endpoint.
 */
const AdminReports = ({ showNotification }) => {
    // 1. Consume Live Data
    // We grab the current state from all our contexts so the report is always up-to-date.
    const { orders } = useOrders();
    const { products } = useProducts();
    const { users } = useUsers();

    /**
     * Helper: Convert Array of Objects to CSV String
     * * Handles headers and escaping special characters.
     */
    const convertToCSV = (data) => {
        if (!data || !data.length) return '';
        
        // Extract Headers (Keys of the first object)
        const headers = Object.keys(data[0]).join(',');
        
        // Extract Rows
        const rows = data.map(obj => 
            Object.values(obj).map(val => 
                // CRITICAL: Escape double quotes by doubling them (" -> "") 
                // and wrap the entire string in quotes to handle commas inside data.
                `"${String(val).replace(/"/g, '""')}"`
            ).join(',')
        );
        
        // Combine Headers + Rows
        return [headers, ...rows].join('\n');
    };

    /**
     * Helper: Trigger Browser Download
     * * Creates a hidden link, clicks it programmatically, and removes it.
     */
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
            document.body.removeChild(link); // Cleanup
        }
    };

    /**
     * Main Handler: Generate Report
     */
    const handleGenerate = (type) => {
        showNotification(`Generating ${type} Report...`);
        
        let data = [];
        // Filename: "Sales_Report_2023-10-25.csv"
        let filename = `${type}_Report_${new Date().toISOString().slice(0,10)}.csv`;

        switch(type) {
            case 'Sales':
                // Data Flattening: Convert complex Order objects into a flat structure
                // suitable for an Excel spreadsheet.
                data = orders.map(o => ({
                    OrderID: o.id,
                    Customer: o.customerName,
                    Date: o.date,
                    Total: o.total,
                    Status: o.status,
                    Items: o.itemsCount // Derived field if available
                }));
                break;
                
            case 'Inventory':
                data = products.map(p => ({
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
                data = users.map(u => ({
                    ID: u.id,
                    Name: u.name,
                    Email: u.email,
                    Role: u.role,
                    Status: u.status,
                    Joined: u.joined
                }));
                break;
                
            default:
                return;
        }

        // Trigger Download if data exists
        if (data.length > 0) {
            const csv = convertToCSV(data);
            downloadCSV(csv, filename);
        } else {
            showNotification("No data available to export.", "warning");
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header Section */}
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
                            <p className="text-muted small mb-4">Export detailed sales data including revenue, order status, and customer details.</p>
                            
                            {/* Date Filter (Visual Only for now) */}
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">DATE RANGE</Form.Label>
                                <Form.Select className="rounded-pill bg-light border-0">
                                    <option>All Time</option>
                                    <option disabled>Last 7 Days (Pro)</option>
                                    <option disabled>Last 30 Days (Pro)</option>
                                </Form.Select>
                            </Form.Group>
                            
                            <Button variant="primary" className="w-100 rounded-pill" onClick={() => handleGenerate("Sales")}>
                                <Download size={16} className="me-2"/> Download CSV
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* --- INVENTORY REPORT CARD --- */}
                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3 text-success">
                                <ShoppingBag size={24} className="me-2"/>
                                <h5 className="mb-0 fw-bold">Inventory Report</h5>
                            </div>
                            <p className="text-muted small mb-4">Current stock levels, product valuation, and category breakdown.</p>
                            <div className="mt-auto">
                                <Button variant="outline-success" className="w-100 rounded-pill mt-5" onClick={() => handleGenerate("Inventory")}>
                                    <Download size={16} className="me-2"/> Download CSV
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* --- USER REPORT CARD --- */}
                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3 text-info">
                                <Users size={24} className="me-2"/>
                                <h5 className="mb-0 fw-bold">User Activity</h5>
                            </div>
                            <p className="text-muted small mb-4">Detailed list of registered users, roles, status, and join dates.</p>
                            <div className="mt-auto">
                                <Button variant="outline-info" className="w-100 rounded-pill mt-5" onClick={() => handleGenerate("User Activity")}>
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