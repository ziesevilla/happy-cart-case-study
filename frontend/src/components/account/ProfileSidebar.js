import React, { useState } from 'react';
import { Card, Button, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { Settings, LogOut, Camera, User, Package, Save, DollarSign, Star, Award } from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios'; 

/**
 * ProfileSidebar Component
 * * Displays the user's profile card, avatar, and account statistics.
 * * Handles Profile Editing, including Image Uploads via FormData.
 */
const ProfileSidebar = ({ 
    showNotification, 
    orderCount = 0, 
    totalSpent = 0, 
    reviewCount = 0, 
    memberTier = 'Bronze' 
}) => {
    // --- CONTEXT HOOKS ---
    const { user, login, logout } = useAuth();
    
    // --- LOCAL STATE MANAGEMENT ---
    
    const [profileImage, setProfileImage] = useState(null); 
    const [selectedFile, setSelectedFile] = useState(null); 
    const [loading, setLoading] = useState(false);

    // Modal States
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
    
    // Form Data State for Editing
    const [profileData, setProfileData] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        dob: '', 
        gender: '' 
    });

    // --- HANDLERS ---

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Opens the Edit Modal and populates it with current user data.
     */
    const handleOpenEdit = () => {
        // Reset image states
        setProfileImage(null);
        setSelectedFile(null);

        setProfileData({ 
            name: user.name || '', 
            email: user.email || '',
            phone: user.phone || '', 
            dob: user.dob ? user.dob.split('T')[0] : '', // Clean date format for input type="date"
            gender: user.gender || 'Male'
        });
        setShowProfileModal(true);
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setShowUpdateConfirmModal(true); 
    };

    /**
     * Submits the updated profile data and file upload to the backend.
     */
    const confirmUpdate = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            
            // Append TEXT fields
            formData.append('name', profileData.name);
            formData.append('phone', profileData.phone || '');
            formData.append('dob', profileData.dob || '');
            formData.append('gender', profileData.gender || '');
            
            // Laravel method spoofing for PUT requests with files
            formData.append('_method', 'PUT'); 

            // Append FILE if selected
            if (selectedFile) {
                formData.append('profile_image', selectedFile);
            }

            // Send POST request (spoofed as PUT)
            const response = await api.post('/user/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update React Context with fresh user data
            login(response.data); 

            setShowUpdateConfirmModal(false);
            setShowProfileModal(false);
            setSelectedFile(null); // Clear file
            showNotification("Profile updated successfully!");
        } catch (error) {
            console.error("Profile update failed", error);
            showNotification("Failed to update profile.", "danger");
        }
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/'; 
    };

    // Helper to get the correct image URL
    const getAvatarUrl = (isPreview = false) => {
        if (isPreview && profileImage) return profileImage; 
        if (user.profile_image) {
            return user.profile_image.startsWith('http') 
                ? user.profile_image 
                : `http://localhost:80${user.profile_image}`; // Docker URL
        }
        return null;
    };

    return (
        <>
            {/* --- MAIN PROFILE CARD --- */}
            <Card className="profile-card text-center mb-4">
                <div className="profile-header"></div>
                <div className="profile-avatar-container position-relative">
                    <div 
                        className="profile-avatar bg-white rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm"
                        style={{ 
                            width: '100px', 
                            height: '100px', 
                            border: '4px solid white', 
                            marginTop: '-50px',      // The magic number: Pulls it up exactly half its height
                            position: 'relative',    // Required for zIndex to work
                            zIndex: 10,              // Ensures it floats ABOVE the pink header
                            overflow: 'hidden'       // Clips the image to the circle
                        }}
                    >
                        {getAvatarUrl() ? (
                            <img 
                                src={getAvatarUrl()} 
                                alt="Profile" 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover', 
                                    display: 'block' 
                                }} 
                            />
                        ) : (
                            <span className="fs-1 fw-bold text-secondary">
                                {user.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                </div>

                <Card.Body className="pt-3 pb-4">
                    <h4 className="fw-bold mb-1">{user.name}</h4>
                    <p className="text-muted small mb-1">{user.email}</p>
                    <p className="text-muted small mb-4">{user.phone || 'No phone added'}</p>
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

            {/* --- STATS SUMMARY CARD --- */}
            <Card className="border-0 shadow-sm rounded-4 p-4">
                 <h6 className="fw-bold text-muted mb-3 text-uppercase small">Account Details</h6>
                 
                 <div className="d-flex align-items-center mb-3">
                    <div className="bg-light p-2 rounded-circle me-3"><User size={20} className="text-primary"/></div>
                    <div><small className="d-block text-muted">Member Since</small><strong>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</strong></div>
                 </div>

                 <div className="d-flex align-items-center mb-3">
                    <div className="bg-light p-2 rounded-circle me-3"><Package size={20} className="text-primary"/></div>
                    <div><small className="d-block text-muted">Total Orders</small><strong>{orderCount} Orders</strong></div>
                 </div>

                 <div className="d-flex align-items-center mb-3">
                    <div className="bg-light p-2 rounded-circle me-3"><DollarSign size={20} className="text-primary"/></div>
                    <div><small className="d-block text-muted">Total Spent</small><strong>₱{totalSpent.toLocaleString()}</strong></div>
                 </div>

                 <div className="d-flex align-items-center mb-3">
                    <div className="bg-light p-2 rounded-circle me-3"><Star size={20} className="text-primary"/></div>
                    <div><small className="d-block text-muted">Reviews</small><strong>{reviewCount} Written</strong></div>
                 </div>

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

            {/* --- EDIT PROFILE MODAL --- */}
            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0"><Modal.Title className="fw-bold">Edit Profile</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSaveProfile}>
                        
                        {/* 2. FIXED PREVIEW IMAGE STYLING (Modal View) */}
                        <div className="text-center mb-4">
                            <div className="d-inline-block position-relative">
                                <div 
                                    className="rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center mx-auto mb-2 border" 
                                    style={{
                                        width: '100px', 
                                        height: '100px', 
                                        overflow: 'hidden', // CRITICAL
                                        position: 'relative'
                                    }}
                                >
                                    {getAvatarUrl(true) ? (
                                        <img 
                                            src={getAvatarUrl(true)} 
                                            alt="Preview" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    ) : (
                                        <span className="fs-1 fw-bold text-muted">{user.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <label className="btn btn-sm btn-light border rounded-pill shadow-sm d-flex align-items-center gap-2 justify-content-center cursor-pointer">
                                    <Camera size={14}/> Change Photo
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>

                        <Row className="g-3">
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        className="rounded-pill" 
                                        value={profileData.name} 
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control 
                                        type="tel" 
                                        className="rounded-pill" 
                                        value={profileData.phone} 
                                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        className="rounded-pill" 
                                        value={profileData.dob} 
                                        onChange={(e) => setProfileData({...profileData, dob: e.target.value})} 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Gender</Form.Label>
                                    <Form.Select 
                                        className="rounded-pill" 
                                        value={profileData.gender} 
                                        onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Form.Group className="mb-4 mt-3">
                            <Form.Label className="d-block">Email Address</Form.Label>
                            <Form.Control type="email" value={profileData.email} disabled className="rounded-pill bg-light" />
                            <Form.Text className="text-muted small">Email cannot be changed here.</Form.Text>
                        </Form.Group>

                        <div className="d-grid">
                            <Button variant="primary" type="submit" className="rounded-pill fw-bold">Review & Save</Button>
                        </div>
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
                        <Button variant="primary" onClick={confirmUpdate} className="rounded-pill fw-bold" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : "Yes, Update"}
                        </Button>
                        <Button variant="link" onClick={() => setShowUpdateConfirmModal(false)} className="text-muted text-decoration-none">Cancel</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* LOGOUT MODAL */}
            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered size="sm">
                <Modal.Body className="text-center p-4">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}>
                        <LogOut size={24} className="text-danger" />
                    </div>
                    <h5 className="fw-bold mb-2">Log Out?</h5>
                    <p className="text-muted small mb-4">You will be securely logged out of your account.</p>
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