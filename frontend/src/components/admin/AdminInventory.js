import React, { useState, useEffect } from 'react'; 
import { Table, Button, Form, Modal, Row, Col, InputGroup, Pagination, Card, Badge, Spinner } from 'react-bootstrap';
import { Edit2, Trash2, Plus, Search, Package, Image as ImageIcon, ArrowUpDown, ArrowUp, ArrowDown, LayoutGrid, LayoutList, AlertTriangle, UploadCloud, Filter } from 'lucide-react';
import { useProducts } from '../../context/ProductContext'; 

const AdminInventory = ({ showNotification }) => {
    const { products, addProduct, updateProduct, deleteProduct, loading } = useProducts();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); 
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'list' ? 8 : 12; 
    const GRID_PAGES = ['Clothing', 'Shoes', 'Accessories']; 

    // --- MODAL STATES ---
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // --- LOADING STATES FOR ACTIONS ---
    const [isSubmitting, setIsSubmitting] = useState(false); // 💡 For Add/Edit
    const [isDeleting, setIsDeleting] = useState(false);     // 💡 For Delete

    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    
    const initialForm = { name: '', category: 'Clothing', sub_category: '', price: '', stock: '', description: '', image: '' };
    const [formData, setFormData] = useState(initialForm);

    const [sortConfig, setSortConfig] = useState({ key: 'dateAdded', direction: 'desc' }); 

    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode]);

    // Show Global Spinner while fetching initial data
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    // --- SORTING LOGIC ---
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

    const getStockBadge = (stock) => {
        if (stock === 0) return <Badge bg="danger">Out of Stock</Badge>;
        if (stock < 10) return <Badge bg="warning" text="dark">Low Stock ({stock})</Badge>;
        return <span className="text-success fw-bold">{stock} in stock</span>;
    };

    // --- FILTERING ---
    const filteredProducts = products.filter(p => 
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sub_category && p.sub_category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === 'dateAdded') {
            const dateA = new Date(aValue || 0);
            const dateB = new Date(bValue || 0);
            return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        if (sortConfig.key === 'price' || sortConfig.key === 'id' || sortConfig.key === 'stock') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const valA = String(aValue || '').toLowerCase();
        const valB = String(bValue || '').toLowerCase();
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // PAGINATION LOGIC (List & Grid)
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const listItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const listTotalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    const currentGridCategory = GRID_PAGES[currentPage - 1] || 'Clothing';
    const gridItems = sortedProducts.filter(p => p.category === currentGridCategory);

    const groupedGridItems = gridItems.reduce((groups, item) => {
        const sub = item.sub_category || 'Other';
        if (!groups[sub]) groups[sub] = [];
        groups[sub].push(item);
        return groups;
    }, {});

    const totalPages = viewMode === 'list' ? listTotalPages : GRID_PAGES.length;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        const contentTop = document.querySelector('.animate-fade-in');
        if (contentTop) {
             contentTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const renderPaginationItems = () => {
        let items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        items.push(<Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />);
        items.push(<Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />);

        if (startPage > 1) items.push(<Pagination.Ellipsis key="start-ellipsis" />);

        for (let number = startPage; number <= endPage; number++) {
            const displayLabel = viewMode === 'grid' ? GRID_PAGES[number - 1] : number;
            const itemStyle = viewMode === 'grid' ? { borderRadius: '50px', paddingLeft: '1rem', paddingRight: '1rem', minWidth: 'auto', height: 'auto' } : {};
            
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)} style={itemStyle}>
                    {displayLabel}
                </Pagination.Item>
            );
        }

        if (endPage < totalPages) items.push(<Pagination.Ellipsis key="end-ellipsis" />);
        
        items.push(<Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />);
        items.push(<Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />);

        return items;
    };

    // --- MODAL HANDLERS ---
    const handleOpenAdd = () => {
        setIsEditing(false);
        setFormData(initialForm);
        setShowModal(true);
    };

    const handleOpenEdit = (product) => {
        setIsEditing(true);
        setCurrentId(product.id);
        setFormData({
            name: product.name,
            category: product.category,
            sub_category: product.sub_category || '',
            price: product.price,
            stock: product.stock,
            description: product.description || '',
            image: product.image || ''
        });
        setShowModal(true);
    };

    const handleDeleteClick = (product) => {
        setItemToDelete(product);
        setShowDeleteModal(true);
    };

    // 💡 UPDATED: DELETE with Spinner
    const confirmDelete = async () => {
        if (itemToDelete) {
            setIsDeleting(true); // Start loading
            const result = await deleteProduct(itemToDelete.id);
            
            if (result.success) {
                showNotification("Product deleted successfully", "secondary");
                setShowDeleteModal(false);
                setItemToDelete(null);
            } else {
                showNotification("Failed to delete product", "danger");
            }
            setIsDeleting(false); // Stop loading
        }
    };

    // 💡 UPDATED: SUBMIT with Spinner
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;

        setIsSubmitting(true); // Start loading

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock) || 0, 
            image: formData.image || ''
        };

        let result;
        if (isEditing) {
            result = await updateProduct(currentId, productData);
            if (result.success) showNotification("Product updated successfully!");
            else showNotification(result.message, "danger");
        } else {
            result = await addProduct(productData);
            if (result.success) showNotification("New product added to inventory!");
            else showNotification(result.message, "danger");
        }

        setIsSubmitting(false); // Stop loading
        
        // Only close modal if success
        if (result.success) {
            setShowModal(false);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <div className="bg-white p-2 rounded-circle shadow-sm me-3 border">
                        <Package size={24} className="text-primary"/>
                    </div>
                    <div>
                        <h4 className="fw-bold mb-0">Inventory</h4>
                        <p className="text-muted small mb-0">Manage product listing</p>
                    </div>
                </div>

                <div className="d-flex gap-3">
                    <div className="bg-white p-1 rounded-pill border d-flex">
                        <Button variant={viewMode === 'list' ? 'dark' : 'light'} size="sm" className="rounded-pill px-3 d-flex align-items-center gap-2" onClick={() => setViewMode('list')}>
                            <LayoutList size={14}/> List
                        </Button>
                        <Button variant={viewMode === 'grid' ? 'dark' : 'light'} size="sm" className="rounded-pill px-3 d-flex align-items-center gap-2" onClick={() => setViewMode('grid')}>
                            <LayoutGrid size={14}/> Grid
                        </Button>
                    </div>

                    <Button variant="primary" className="rounded-pill fw-bold px-4" onClick={handleOpenAdd}>
                        <Plus size={18} className="me-2"/> Add Product
                    </Button>

                    <div style={{ width: '300px'}}>
                        <InputGroup size="sm" className="border rounded-pill bg-white overflow-hidden">
                            <InputGroup.Text className="bg-white border-0 pe-0"><Search size={16} className="text-muted"/></InputGroup.Text>
                            <Form.Control placeholder="Search products..." className="border-0 shadow-none ps-2" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                        </InputGroup>
                    </div>
                </div>
            </div>

            {/* --- LIST VIEW --- */}
            {viewMode === 'list' ? (
                <div className="bg-white rounded-4 shadow-sm overflow-hidden border mb-4">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-muted small text-uppercase pointer" style={{width: '80px'}} onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
                                <th className="py-3 text-muted small text-uppercase pointer" onClick={() => handleSort('name')}>Product {getSortIcon('name')}</th>
                                <th className="py-3 text-muted small text-uppercase pointer" onClick={() => handleSort('category')}>Category {getSortIcon('category')}</th>
                                <th className="py-3 text-muted small text-uppercase pointer" onClick={() => handleSort('sub_category')}>Sub-Cat {getSortIcon('sub_category')}</th>
                                <th className="py-3 text-muted small text-uppercase pointer" onClick={() => handleSort('price')}>Price {getSortIcon('price')}</th>
                                <th className="py-3 text-muted small text-uppercase pointer" onClick={() => handleSort('stock')}>Stock {getSortIcon('stock')}</th>
                                <th className="py-3 text-muted small text-uppercase pointer" onClick={() => handleSort('dateAdded')}>Date Added {getSortIcon('dateAdded')}</th>
                                <th className="pe-4 py-3 text-end text-muted small text-uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listItems.length > 0 ? listItems.map(p => (
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
                                    <td><span className="text-muted small">{p.sub_category || '-'}</span></td>
                                    <td className="fw-bold text-primary">{p.formatted_price}</td>
                                    <td>{getStockBadge(p.stock)}</td>
                                    <td className="text-muted small">{p.dateAdded}</td>
                                    <td className="pe-4 text-end">
                                        <Button variant="light" size="sm" className="me-2 rounded-circle p-2" onClick={() => handleOpenEdit(p)}><Edit2 size={16} className="text-primary"/></Button>
                                        <Button variant="light" size="sm" className="rounded-circle p-2" onClick={() => handleDeleteClick(p)}><Trash2 size={16} className="text-danger"/></Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="text-center py-5 text-muted"><Package size={48} className="mb-3 opacity-25"/><p>No products found.</p></td></tr>
                            )}
                        </tbody>
                    </Table>
                    
                    {listTotalPages > 1 && (
                        <div className="bg-white border-top d-flex justify-content-between align-items-center py-3 px-4">
                            <div className="small text-muted">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length} products
                            </div>
                            <Pagination size="sm" className="mb-0">
                                {renderPaginationItems()}
                            </Pagination>
                        </div>
                    )}
                </div>
            ) : (
                /* --- GRID VIEW --- */
                <div className="mb-4">
                    <div className="mb-4 d-flex align-items-center">
                        <h4 className="fw-bold text-dark mb-0">Category: <span className="text-primary">{currentGridCategory}</span></h4>
                        <Badge bg="light" text="dark" className="ms-3 border">{gridItems.length} items</Badge>
                    </div>

                    {Object.keys(groupedGridItems).length > 0 ? (
                        Object.keys(groupedGridItems).sort().map(subCat => (
                            <div key={subCat} className="mb-5">
                                <h5 className="fw-bold text-secondary text-uppercase mb-3 ps-2 border-start border-4 border-primary">
                                    {subCat} <span className="text-muted small ms-2 fw-normal">({groupedGridItems[subCat].length})</span>
                                </h5>
                                <Row className="g-4">
                                    {groupedGridItems[subCat].map(p => (
                                        <Col md={3} key={p.id}>
                                            <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden group">
                                                <div style={{height: '200px', overflow: 'hidden', position: 'relative'}}>
                                                    {p.image ? (
                                                        <img src={p.image} alt={p.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                    ) : (
                                                        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center"><ImageIcon size={32} className="text-muted"/></div>
                                                    )}
                                                    <div className="position-absolute top-0 start-0 m-2">
                                                        {p.stock === 0 && <Badge bg="danger" className="shadow-sm">Sold Out</Badge>}
                                                    </div>
                                                    <div className="position-absolute top-0 end-0 m-2 d-flex gap-2">
                                                        <Button variant="light" size="sm" className="rounded-circle shadow-sm" onClick={() => handleOpenEdit(p)}><Edit2 size={14}/></Button>
                                                        <Button variant="danger" size="sm" className="rounded-circle shadow-sm" onClick={() => handleDeleteClick(p)}><Trash2 size={14}/></Button>
                                                    </div>
                                                </div>
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <Badge bg="light" text="dark" className="border">{p.category}</Badge>
                                                        <small className="text-muted">#{p.id}</small>
                                                    </div>
                                                    <h6 className="fw-bold text-truncate mb-1" title={p.name}>{p.name}</h6>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="text-primary fw-bold">{p.formatted_price}</div>
                                                        <small className="text-muted" style={{fontSize: '0.75rem'}}>Stock: {p.stock}</small>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <Package size={48} className="mb-3 opacity-25"/>
                            <p>No products found in {currentGridCategory}.</p>
                        </div>
                    )}
                </div>
            )}

            {totalPages > 1 && viewMode === 'grid' && (
                <div className="d-flex justify-content-center mt-5">
                    <Pagination size="sm">
                        {renderPaginationItems()}
                    </Pagination>
                </div>
            )}

            {/* ADD/EDIT MODAL WITH SPINNER */}
            <Modal show={showModal} onHide={() => !isSubmitting && setShowModal(false)} centered size="lg" backdrop="static">
                <Modal.Header closeButton={!isSubmitting} className="border-0"><Modal.Title className="fw-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</Modal.Title></Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    <Form onSubmit={handleSubmit}>
                        {/* ... (Fields remain exactly the same as previous code) ... */}
                        <Row className="g-3">
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">PRODUCT NAME</Form.Label>
                                    <Form.Control required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-pill bg-light border-0" disabled={isSubmitting}/>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">PRICE (₱)</Form.Label>
                                    <Form.Control type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="rounded-pill bg-light border-0" disabled={isSubmitting}/>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">STOCK</Form.Label>
                                    <Form.Control type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="rounded-pill bg-light border-0" disabled={isSubmitting}/>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">CATEGORY</Form.Label>
                                    <Form.Select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="rounded-pill bg-light border-0" disabled={isSubmitting}>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Shoes">Shoes</option>
                                        <option value="Accessories">Accessories</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">SUB-CATEGORY</Form.Label>
                                    <Form.Control placeholder="e.g. Sneakers, Tops, Bags" value={formData.sub_category} onChange={(e) => setFormData({...formData, sub_category: e.target.value})} className="rounded-pill bg-light border-0" disabled={isSubmitting}/>
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">IMAGE URL</Form.Label>
                                    <Form.Control placeholder="https://..." value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="rounded-pill bg-light border-0" disabled={isSubmitting}/>
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label>
                                    <Form.Control as="textarea" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-4 bg-light border-0" disabled={isSubmitting}/>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-grid">
                            <Button type="submit" variant="primary" className="rounded-pill fw-bold py-2" disabled={isSubmitting}>
                                {isSubmitting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>Saving...</> : (isEditing ? 'Update Product' : 'Create Product')}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* DELETE CONFIRMATION MODAL WITH SPINNER */}
            <Modal show={showDeleteModal} onHide={() => !isDeleting && setShowDeleteModal(false)} centered>
                <Modal.Header closeButton={!isDeleting} className="border-0">
                    <Modal.Title className="fw-bold text-danger">Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <div className="bg-danger-subtle text-danger p-3 rounded-circle d-inline-flex mb-3">
                        <AlertTriangle size={32} />
                    </div>
                    <h5 className="fw-bold">Delete Product?</h5>
                    <p className="text-muted mb-0">
                        Are you sure you want to delete <strong>{itemToDelete?.name}</strong>? 
                        <br/>This action cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer className="border-0 justify-content-center pb-4">
                    <Button variant="light" className="rounded-pill px-4" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="danger" className="rounded-pill px-4 fw-bold" onClick={confirmDelete} disabled={isDeleting}>
                        {isDeleting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>Deleting...</> : 'Delete Product'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminInventory;