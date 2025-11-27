import React, { useState } from 'react';
import { Table, Button, Form, Modal, Row, Col, InputGroup, Pagination, Card, Badge } from 'react-bootstrap';
import { Edit2, Trash2, Plus, Search, Package, Image as ImageIcon, ArrowUpDown, ArrowUp, ArrowDown, LayoutGrid, LayoutList } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

const AdminInventory = ({ showNotification }) => {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'list' ? 8 : 12; // Show more items in grid view

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    
    const initialForm = { name: '', category: 'Tops', price: '', description: '', image: '' };
    const [formData, setFormData] = useState(initialForm);

    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' }); 

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

    // Filter Logic
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort Logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === 'price' || sortConfig.key === 'id') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleOpenAdd = () => {
        setIsEditing(false);
        setFormData(initialForm);
        setShowModal(true);
    };

    const handleOpenEdit = (product) => {
        setIsEditing(true);
        setCurrentId(product.id);
        setFormData(product);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
            deleteProduct(id);
            showNotification("Product deleted successfully", "secondary");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            image: formData.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000'
        };

        if (isEditing) {
            updateProduct(currentId, productData);
            showNotification("Product updated successfully!");
        } else {
            addProduct(productData);
            showNotification("New product added to inventory!");
        }
        setShowModal(false);
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-3">
                    <div style={{ width: '300px' }}>
                        <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} className="text-muted"/></InputGroup.Text>
                            <Form.Control 
                                placeholder="Search inventory..." 
                                className="border-start-0 ps-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </InputGroup>
                    </div>
                    
                    {/* VIEW SWITCHER */}
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

                <Button variant="primary" className="rounded-pill fw-bold px-4" onClick={handleOpenAdd}>
                    <Plus size={18} className="me-2"/> Add Product
                </Button>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-white rounded-4 shadow-sm overflow-hidden border mb-4">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-muted small text-uppercase pointer" style={{width: '80px'}} onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
                                <th className="py-3 text-muted small text-uppercase pointer" onClick={() => handleSort('name')}>Product {getSortIcon('name')}</th>
                                <th className="py-3 text-muted small text-uppercase pointer" onClick={() => handleSort('category')}>Category {getSortIcon('category')}</th>
                                <th className="py-3 text-muted small text-uppercase pointer" onClick={() => handleSort('price')}>Price {getSortIcon('price')}</th>
                                <th className="pe-4 py-3 text-end text-muted small text-uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? currentItems.map(p => (
                                <tr key={p.id}>
                                    <td className="ps-4 text-muted fw-bold small">#{p.id}</td>
                                    <td className="py-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                                {p.image ? <img src={p.image} alt={p.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <ImageIcon size={20} className="text-muted" />}
                                            </div>
                                            <div className="fw-bold text-dark">{p.name}</div>
                                        </div>
                                    </td>
                                    <td><span className="badge bg-light text-dark border">{p.category}</span></td>
                                    <td className="fw-bold text-primary">₱{p.price.toLocaleString()}</td>
                                    <td className="pe-4 text-end">
                                        <Button variant="light" size="sm" className="me-2 rounded-circle p-2" onClick={() => handleOpenEdit(p)}><Edit2 size={16} className="text-primary"/></Button>
                                        <Button variant="light" size="sm" className="rounded-circle p-2" onClick={() => handleDelete(p.id)}><Trash2 size={16} className="text-danger"/></Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="text-center py-5 text-muted"><Package size={48} className="mb-3 opacity-25"/><p>No products found.</p></td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            ) : (
                <Row className="g-4 mb-4">
                    {currentItems.map(p => (
                        <Col md={3} key={p.id}>
                            <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden group">
                                <div style={{height: '200px', overflow: 'hidden', position: 'relative'}}>
                                    {p.image ? (
                                        <img src={p.image} alt={p.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    ) : (
                                        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center"><ImageIcon size={32} className="text-muted"/></div>
                                    )}
                                    <div className="position-absolute top-0 end-0 m-2 d-flex gap-2">
                                        <Button variant="light" size="sm" className="rounded-circle shadow-sm" onClick={() => handleOpenEdit(p)}><Edit2 size={14}/></Button>
                                        <Button variant="danger" size="sm" className="rounded-circle shadow-sm" onClick={() => handleDelete(p.id)}><Trash2 size={14}/></Button>
                                    </div>
                                </div>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Badge bg="light" text="dark" className="border">{p.category}</Badge>
                                        <small className="text-muted">#{p.id}</small>
                                    </div>
                                    <h6 className="fw-bold text-truncate mb-1" title={p.name}>{p.name}</h6>
                                    <div className="text-primary fw-bold">₱{p.price.toLocaleString()}</div>
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
                            <Pagination.Item key={idx + 1} active={idx + 1 === currentPage} onClick={() => handlePageChange(idx + 1)}>{idx + 1}</Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} />
                    </Pagination>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                {/* Modal Content Same as Before */}
                <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</Modal.Title></Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={8}><Form.Group className="mb-3"><Form.Label className="small fw-bold text-muted">PRODUCT NAME</Form.Label><Form.Control required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-pill bg-light border-0" /></Form.Group></Col>
                            <Col md={4}><Form.Group className="mb-3"><Form.Label className="small fw-bold text-muted">PRICE (₱)</Form.Label><Form.Control type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="rounded-pill bg-light border-0" /></Form.Group></Col>
                            <Col md={12}><Form.Group className="mb-3"><Form.Label className="small fw-bold text-muted">CATEGORY</Form.Label><Form.Select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="rounded-pill bg-light border-0"><option>Tops</option><option>Bottoms</option><option>Dresses</option><option>Outerwear</option><option>Shoes</option><option>Accessories</option></Form.Select></Form.Group></Col>
                            <Col xs={12}><Form.Group className="mb-3"><Form.Label className="small fw-bold text-muted">IMAGE URL</Form.Label><Form.Control placeholder="https://..." value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="rounded-pill bg-light border-0" /><Form.Text className="text-muted">Paste a link from Unsplash or similar.</Form.Text></Form.Group></Col>
                            <Col xs={12}><Form.Group className="mb-4"><Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label><Form.Control as="textarea" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-4 bg-light border-0" /></Form.Group></Col>
                        </Row>
                        <div className="d-grid"><Button variant="primary" type="submit" className="rounded-pill fw-bold py-2">{isEditing ? 'Update Product' : 'Create Product'}</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminInventory;