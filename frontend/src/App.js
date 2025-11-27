import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ReviewProvider } from './context/ReviewContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { UserProvider } from './context/UserContext'; 
import { TransactionProvider } from './context/TransactionContext'; 
import { AddressProvider } from './context/AddressContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop'; 

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Confirmation from './pages/Confirmation';

// Info Pages
import { About, Shipping, Returns, Privacy, Terms, HelpCenter } from './pages/InfoPages';

const Layout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="App">
      {!isAuthPage && <Navbar />}
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/confirmation" element={<Confirmation />} />
          
          {/* Info Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/help" element={<HelpCenter />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  return (
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
  );
}

export default App;