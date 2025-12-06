import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// --- CONTEXT PROVIDERS (GLOBAL STATE) ---
// These providers inject data/functions (Auth, Cart, Products) into the component tree.
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ReviewProvider } from './context/ReviewContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { UserProvider } from './context/UserContext'; 
import { TransactionProvider } from './context/TransactionContext'; 
import { AddressProvider } from './context/AddressContext';
import { SettingsProvider } from './context/SettingsContext';

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
// 💡 Updated imports to include Sustainability and Press
import { About, Shipping, Returns, Privacy, Terms, HelpCenter, Sustainability, Press } from './pages/InfoPages';

/**
 * Layout Component
 * * Acts as the structural shell for the application.
 * * Functionality: Conditionally renders Navbar and Footer.
 * * Logic: Hides navigation elements on Auth pages (Login/Register) for a cleaner UI focus.
 */
const Layout = () => {
  const location = useLocation();
  // Determine if the current view is an authentication page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="App">
      {/* Conditionally render Navbar */}
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
          
          {/* --- STATIC INFORMATION ROUTES --- */}
          <Route path="/about" element={<About />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/help" element={<HelpCenter />} />
          
          {/* 💡 NEW ROUTES ADDED HERE */}
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/press" element={<Press />} />
        </Routes>
      </main>

      {/* Conditionally render Footer */}
      {!isAuthPage && <Footer />}
    </div>
  );
};

/**
 * App Component (Root)
 * * The entry point of the application structure.
 * * Responsibility: 
 * * 1. Wraps the app in all necessary Context Providers (Pyramid of Providers).
 * * 2. Initializes the Router.
 * * 3. Mounts the Layout component.
 */
function App() {
  return (
    // --- PROVIDER WRAPPERS ---
    // (Order matters: Higher providers are available to lower ones)
    <SettingsProvider>
      <AuthProvider>
        <ProductProvider>
            <UserProvider>
              <OrderProvider> 
                  <TransactionProvider> 
                      <AddressProvider>
                          <CartProvider>
                              <ReviewProvider>
                                  {/* --- ROUTER SETUP --- */}
                                  <Router>
                                      {/* ScrollToTop ensures page resets to top on route change */}
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