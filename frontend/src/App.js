import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AlertTriangle } from 'lucide-react'; 
import './App.css';

// --- CONTEXT PROVIDERS ---
import { AuthProvider, useAuth } from './context/AuthContext'; // <--- IMPORT useAuth HERE
import { CartProvider } from './context/CartContext';
import { ReviewProvider } from './context/ReviewContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { UserProvider } from './context/UserContext'; 
import { TransactionProvider } from './context/TransactionContext'; 
import { AddressProvider } from './context/AddressContext';
import { SettingsProvider, useSettings } from './context/SettingsContext'; 

// --- UI COMPONENTS ---
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop'; 

// --- MAIN PAGES ---
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Confirmation from './pages/Confirmation';

// --- STATIC INFO PAGES ---
import { About, Shipping, Returns, Privacy, Terms, HelpCenter, Sustainability, Press } from './pages/InfoPages';
// Admin Dashboard
import AdminDashboard from './components/admin/AdminDashboard'; // Assuming you have this

/**
 * Layout Component
 */
const Layout = () => {
  const location = useLocation();
  const { settings, loading: settingsLoading } = useSettings(); 
  
  // 1. GET USER AUTH STATE
  const { user, loading: authLoading } = useAuth(); 

  // Determine if the current view is an authentication page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  // --- MAINTENANCE MODE CHECK ---
  
  // We allow the view to render if:
  // 1. Settings or Auth are still loading (don't flash error yet)
  // 2. Maintenance is OFF
  // 3. User is an ADMIN (Bypass!)
  // 4. User is on the Login page (So admins can actually log in!)
  const isMaintenanceOn = settings.maintenanceMode;
  // distinct check: handles 'Admin', 'admin', 'ADMIN' safely
  const isAdmin = user && user.role?.toLowerCase() === 'admin';

  // If Maintenance is ON, User is NOT Admin, and NOT on Login Page... BLOCK THEM.
  if (!settingsLoading && !authLoading && isMaintenanceOn && !isAdmin && !isAuthPage) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light text-center p-4">
        <AlertTriangle size={64} className="text-warning mb-4" />
        <h1 className="fw-bold mb-3">Under Maintenance</h1>
        <p className="lead text-muted mb-4" style={{maxWidth: '500px'}}>
            We are currently updating our store to serve you better. 
            Please check back in a few minutes.
        </p>
        
        {/* Helper for Admins who are locked out */}
        <div className="mt-4 p-3 bg-white shadow-sm rounded border">
            <small className="d-block text-muted mb-2">Administrator?</small>
            <a href="/login" className="btn btn-outline-primary btn-sm">Log In to Bypass</a>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {!isAuthPage && <Navbar />}
      
      <main>
        <Routes>
          {/* --- MAIN E-COMMERCE ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* --- AUTHENTICATION ROUTES --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* --- ACCOUNT & TRANSACTION ROUTES --- */}
          <Route path="/account" element={<Account />} />
          <Route path="/confirmation" element={<Confirmation />} />
          
          {/* --- ADMIN ROUTES --- */}
          {/* Note: You might want to wrap this in a ProtectedRoute later */}
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* --- STATIC INFORMATION ROUTES --- */}
          <Route path="/about" element={<About />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/help" element={<HelpCenter />} />
          
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/press" element={<Press />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ProductProvider>
            <UserProvider>
              <OrderProvider> 
                  <TransactionProvider> 
                      <AddressProvider>
                          <CartProvider>
                              <ReviewProvider>
                                  <Router>
                                      <ScrollToTop />
                                      <Layout />
                                  </Router>
                              </ReviewProvider>
                          </CartProvider>
                      </AddressProvider>
                  </TransactionProvider>
              </OrderProvider>
          </UserProvider>
        </ProductProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;