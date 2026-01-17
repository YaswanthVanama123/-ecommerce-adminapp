import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PrivateRoute from './routes/PrivateRoute';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import OrderList from './pages/Orders/OrderList';
import OrderDetail from './pages/Orders/OrderDetail';
import CategoryManagement from './pages/Categories/CategoryManagement';
import BannerManagement from './pages/Banners/BannerManagement';

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
  return (
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
                  <Dashboard />
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

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
  );
}

export default App;
