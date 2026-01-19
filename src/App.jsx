import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PrivateRoute from './routes/PrivateRoute';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import ErrorBoundary from './components/ErrorBoundary';

// Error logging
import { initErrorLogging } from './utils/errorLogger';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EnhancedDashboard from './pages/EnhancedDashboard';
import Analytics from './pages/Analytics';
import ProductList from './pages/Products/ProductList';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import OrderList from './pages/Orders/OrderList';
import OrderDetail from './pages/Orders/OrderDetail';
import CategoryManagement from './pages/Categories/CategoryManagement';
import BannerManagement from './pages/Banners/BannerManagement';
import ShippingList from './pages/Shipping/ShippingList';
import UpdateShipping from './pages/Shipping/UpdateShipping';
import ReturnManagement from './pages/Returns/ReturnManagement';
import ReturnDetail from './pages/Returns/ReturnDetail';
import ReviewModeration from './pages/Reviews/ReviewModeration';
import InvoiceManagement from './pages/Invoices/InvoiceManagement';
import PaymentManagement from './pages/Payments/PaymentManagement';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import InventoryManagement from './pages/InventoryManagement';
import CouponManagement from './pages/CouponManagement';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const layoutContainerStyle = {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
    display: 'flex',
    position: 'relative',
  };

  const mainContentWrapperStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    marginLeft: isMobile ? '0' : '280px',
    transition: 'margin-left 0.3s ease-in-out',
  };

  const headerContainerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  };

  const mainContentStyle = {
    flex: 1,
    width: '100%',
    padding: '24px 16px',
  };

  const contentInnerStyle = {
    maxWidth: '1600px',
    margin: '0 auto',
    width: '100%',
  };

  return (
    <div style={layoutContainerStyle}>
      {/* Sidebar - handles its own mobile/desktop rendering */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={mainContentWrapperStyle}>
        <div style={headerContainerStyle}>
          <Header />
        </div>
        <main style={mainContentStyle}>
          <div style={contentInnerStyle}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  // Initialize error logging on app mount
  React.useEffect(() => {
    initErrorLogging();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <EnhancedDashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <Layout>
                  <ProductList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/products/add"
            element={
              <PrivateRoute>
                <Layout>
                  <AddProduct />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/products/edit/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <EditProduct />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Layout>
                  <OrderList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <OrderDetail />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Layout>
                  <CategoryManagement />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/banners"
            element={
              <PrivateRoute>
                <Layout>
                  <BannerManagement />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/shipping"
            element={
              <PrivateRoute>
                <Layout>
                  <ShippingList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/shipping/update/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <UpdateShipping />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/returns"
            element={
              <PrivateRoute>
                <Layout>
                  <ReturnManagement />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/returns/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <ReturnDetail />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <PrivateRoute>
                <Layout>
                  <ReviewModeration />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <Layout>
                  <InvoiceManagement />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <PrivateRoute>
                <Layout>
                  <PaymentManagement />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Inventory Management Routes */}
          <Route
            path="/inventory"
            element={
              <PrivateRoute>
                <Layout>
                  <InventoryManagement />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Reports Routes */}
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Layout>
                  <Reports />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Customer Management Routes */}
          <Route
            path="/customers"
            element={
              <PrivateRoute>
                <Layout>
                  <CustomerList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <CustomerDetail />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/error" element={<ServerError />} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
