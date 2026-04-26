import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StoreLayout from './components/StoreLayout';
import AdminLayout from './components/AdminLayout';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ScrollToTop';
import NotificationListener from './components/NotificationListener';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Category from './pages/Category';
import Search from './pages/Search';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import Login from './pages/Login';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminStock from './pages/AdminStock';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProductProvider } from './context/ProductContext';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ProductProvider>
          <CartProvider>
            <BrowserRouter>
              <ScrollToTop />
              <AuthProvider>
                <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 transition-colors">
                  <Routes>
                    <Route element={<StoreLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/category/:id" element={<Category />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/my-orders" element={<MyOrders />} />
                      <Route path="/login" element={<Login />} />
                    </Route>

                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="stock" element={<AdminStock />} />
                      {/* Additional routes like users, products can be added here later */}
                    </Route>
                  </Routes>
                  <NotificationListener />
                  <AuthModal />
                  <Toaster position="top-center" expand={false} richColors />
                </div>
              </AuthProvider>
            </BrowserRouter>
          </CartProvider>
        </ProductProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
