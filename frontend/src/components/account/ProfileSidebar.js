import React, { useState } from 'react';
import { Card, Button, Modal, Form, Row, Col } from 'react-bootstrap';
// 💡 Added DollarSign, Star, Award to imports
import { Settings, LogOut, Camera, User, Package, Save, DollarSign, Star, Award } from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext';

const ProfileSidebar = ({ 
    showNotification, 
    orderCount = 0, 
    totalSpent = 0, 
    reviewCount = 0, 
    memberTier = 'Bronze' 
}) => {
    const { user, login, logout } = useAuth();
    const [profileImage, setProfileImage] = useState(null);
    
    // Modal States
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
    
    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', dob: '', gender: '' });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
                showNotification("Profile picture updated!");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenEdit = () => {
        setProfileData({ 
            name: user.name, email: user.email,
            phone: user.phone || '0912 345 6789', 
            dob: user.dob || '1995-08-15', gender: user.gender || 'Male'
        });
        setShowProfileModal(true);
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setShowUpdateConfirmModal(true);
    };

    const confirmUpdate = () => {
        login({ ...user, ...profileData });
        setShowUpdateConfirmModal(false);
        setShowProfileModal(false);
        showNotification("Profile updated successfully!");
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <>
            <Card className="profile-card text-center mb-4">
                <div className="profile-header"></div>
                <div className="profile-avatar-container">
                    <div className="profile-avatar">
                        {profileImage ? <img src={profileImage} alt="Profile" /> : user.name.charAt(0).toUpperCase()}
                    </div>
                    <label className="profile-upload-overlay">
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                        <Camera size={24} />
                    </label>
                </div>
                <Card.Body className="pt-0 pb-4">
                    <h4 className="fw-bold mb-1">{user.name}</h4>
                    <p className="text-muted small mb-1">{user.email}</p>
                    <p className="text-muted small mb-4">{user.phone || '0912 345 6789'}</p>
                    <div className="d-grid gap-2 px-4">
                        <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={handleOpenEdit}>
                            <Settings size={16} className="me-2"/> Edit Profile
                        </Button>
                        <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={() => setShowLogoutModal(true)}>
                            <LogOut size={16} className="me-2"/> Logout
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4 p-4">
                 <h6 className="fw-bold text-muted mb-3 text-uppercase small">Account Details</h6>
                 
                 {/* Member Since */}
                 <div className="d-flex align-items-center mb-3">
                    <div className="bg-light p-2 rounded-circle me-3"><User size={20} className="text-primary"/></div>
                    <div><small className="d-block text-muted">Member Since</small><strong>October 2023</strong></div>
                 </div>

                 {/* Order Count */}
                 <div className="d-flex align-items-center mb-3">
                    <div className="bg-light p-2 rounded-circle me-3"><Package size={20} className="text-primary"/></div>
                    <div><small className="d-block text-muted">Total Orders</small><strong>{orderCount} Orders</strong></div>
                 </div>

                 {/* Total Spent */}
                 <div className="d-flex align-items-center mb-3">
                    <div className="bg-light p-2 rounded-circle me-3"><DollarSign size={20} className="text-primary"/></div>
                    <div><small className="d-block text-muted">Total Spent</small><strong>₱{totalSpent.toLocaleString()}</strong></div>
                 </div>

                 {/* Reviews Written */}
                 <div className="d-flex align-items-center mb-3">
                    <div className="bg-light p-2 rounded-circle me-3"><Star size={20} className="text-primary"/></div>
                    <div><small className="d-block text-muted">Reviews</small><strong>{reviewCount} Written</strong></div>
                 </div>

                 {/* Loyalty Tier */}
                 <div className="d-flex align-items-center">
                    <div className="bg-light p-2 rounded-circle me-3"><Award size={20} className="text-warning"/></div>
                    <div>
                        <small className="d-block text-muted">Status</small>
                        <strong className={memberTier === 'Platinum' ? 'text-info' : memberTier === 'Gold' ? 'text-warning' : 'text-dark'}>
                            {memberTier} Member
                        </strong>
                    </div>
                 </div>
            </Card>

            {/* EDIT PROFILE MODAL */}
            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0"><Modal.Title className="fw-bold">Edit Profile</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSaveProfile}>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control type="text" className="rounded-pill" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} required/>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control type="email" className="rounded-pill" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} required/>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control type="tel" className="rounded-pill" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})}/>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-4"><Form.Label>Date of Birth</Form.Label><Form.Control type="date" className="rounded-pill" value={profileData.dob} onChange={(e) => setProfileData({...profileData, dob: e.target.value})}/></Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-4"><Form.Label>Gender</Form.Label><Form.Select className="rounded-pill" value={profileData.gender} onChange={(e) => setProfileData({...profileData, gender: e.target.value})}><option>Male</option><option>Female</option><option>Other</option></Form.Select></Form.Group>
                            </Col>
                        </Row>
                        <div className="d-grid"><Button variant="primary" type="submit" className="rounded-pill fw-bold">Save Changes</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* CONFIRM UPDATE MODAL */}
            <Modal show={showUpdateConfirmModal} onHide={() => setShowUpdateConfirmModal(false)} centered size="sm">
                <Modal.Body className="text-center p-4">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}>
                        <Save size={24} className="text-primary" />
                    </div>
                    <h5 className="fw-bold mb-2">Update Profile?</h5>
                    <p className="text-muted small mb-4">Are you sure you want to save these changes to your profile?</p>
                    <div className="d-grid gap-2">
                        <Button variant="primary" onClick={confirmUpdate} className="rounded-pill fw-bold">Yes, Update</Button>
                        <Button variant="link" onClick={() => setShowUpdateConfirmModal(false)} className="text-muted text-decoration-none">Cancel</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* LOGOUT MODAL */}
            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered size="sm">
                <Modal.Body className="text-center p-4">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}><LogOut size={24} className="text-danger" /></div>
                    <h5 className="fw-bold mb-2">Log Out?</h5>
                    <p className="text-muted small mb-4">Are you sure?</p>
                    <div className="d-grid gap-2">
                        <Button variant="danger" onClick={handleLogout} className="rounded-pill fw-bold">Yes, Log Out</Button>
                        <Button variant="link" onClick={() => setShowLogoutModal(false)} className="text-muted text-decoration-none">Cancel</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ProfileSidebar;