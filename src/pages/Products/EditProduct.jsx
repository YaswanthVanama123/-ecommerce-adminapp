import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../../api';
import { toast } from 'react-toastify';
import ProductForm from '../../components/products/ProductForm';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);

      // Handle different response structures
      let productData = null;
      if (response.data?.data?.product) {
        productData = response.data.data.product;
      } else if (response.data?.product) {
        productData = response.data.product;
      } else if (response.data?.data) {
        productData = response.data.data;
      } else if (response.data) {
        productData = response.data;
      }

      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsLoading(true);
      await productsAPI.update(id, data);
      toast.success('Product updated successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
  };

  const contentWrapperStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headerCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  };

  const titleContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    letterSpacing: '-0.5px',
  };

  const subtitleStyle = {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
    fontWeight: '400',
  };

  const backButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#f9fafb',
    color: '#374151',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    outline: 'none',
  };

  const formCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e5e7eb',
  };

  const loadingContainerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  };

  const loadingCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '48px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  };

  const spinnerStyle = {
    width: '56px',
    height: '56px',
    border: '5px solid #e5e7eb',
    borderTop: '5px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const loadingTextStyle = {
    fontSize: '16px',
    color: '#374151',
    fontWeight: '600',
    letterSpacing: '-0.2px',
  };

  if (loading) {
    return (
      <>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={loadingContainerStyle}>
          <div style={loadingCardStyle}>
            <div style={spinnerStyle}></div>
            <p style={loadingTextStyle}>Loading product details...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={containerStyle}>
        <div style={contentWrapperStyle}>
          <div style={headerCardStyle}>
            <div style={titleContainerStyle}>
              <h1 style={titleStyle}>Edit Product</h1>
              <p style={subtitleStyle}>Update product details and information</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              style={backButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.color = '#667eea';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Products
            </button>
          </div>

          <div style={formCardStyle}>
            <ProductForm
              onSubmit={handleSubmit}
              initialData={product}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProduct;
