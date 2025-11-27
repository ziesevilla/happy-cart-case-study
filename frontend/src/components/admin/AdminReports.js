import React from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Download, TrendingUp, Users, ShoppingBag } from 'lucide-react';

const AdminReports = ({ showNotification }) => {
    const handleGenerate = (type) => {
        showNotification(`Generating ${type} Report... Download will start shortly.`);
    };

    return (
        <div className="animate-fade-in">
            <h4 className="fw-bold mb-4">Analytics & Reports</h4>

            <Row className="g-4">
                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3 text-primary">
                                <TrendingUp size={24} className="me-2"/>
                                <h5 className="mb-0 fw-bold">Sales Report</h5>
                            </div>
                            <p className="text-muted small mb-4">Export detailed sales data including revenue, tax, and shipping costs.</p>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">DATE RANGE</Form.Label>
                                <Form.Select className="rounded-pill bg-light border-0">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                    <option>This Year</option>
                                </Form.Select>
                            </Form.Group>
                            <Button variant="primary" className="w-100 rounded-pill" onClick={() => handleGenerate("Sales")}>
                                <Download size={16} className="me-2"/> Download CSV
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3 text-success">
                                <ShoppingBag size={24} className="me-2"/>
                                <h5 className="mb-0 fw-bold">Inventory Report</h5>
                            </div>
                            <p className="text-muted small mb-4">Current stock levels, low stock alerts, and product valuation.</p>
                            <div className="mt-auto">
                                <Button variant="outline-success" className="w-100 rounded-pill mt-5" onClick={() => handleGenerate("Inventory")}>
                                    <Download size={16} className="me-2"/> Download PDF
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
                            <p className="text-muted small mb-4">New signups, active users, and customer retention metrics.</p>
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