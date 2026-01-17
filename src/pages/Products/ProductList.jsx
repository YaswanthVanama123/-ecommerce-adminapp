import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../../api';
import { toast } from 'react-toastify';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Helper function to calculate total stock
  const getStockValue = (stock) => {
    if (typeof stock === 'number') {
      return stock;
    }
    if (Array.isArray(stock)) {
      return stock.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    return 0;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();

      // Handle different response structures
      let productsData = [];
      if (response.data?.data?.products) {
        productsData = response.data.data.products;
      } else if (response.data?.products) {
        productsData = response.data.products;
      } else if (Array.isArray(response.data?.data)) {
        productsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      }

      // Ensure it's an array
      if (!Array.isArray(productsData)) {
        console.warn('Products data is not an array:', productsData);
        productsData = [];
      }

      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsAPI.delete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            border: '3px solid #e2e8f0',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <p style={{
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500',
            letterSpacing: '0.025em'
          }}>Loading products...</p>
        </div>
        <style>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '32px 24px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#0f172a',
                margin: '0 0 8px 0',
                letterSpacing: '-0.025em'
              }}>
                Product Management
              </h1>
              <p style={{
                fontSize: '15px',
                color: '#64748b',
                margin: 0,
                fontWeight: '400'
              }}>
                Manage your product inventory and details
              </p>
            </div>
            <Link
              to="/products/add"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add New Product
            </Link>
          </div>
        </div>

        {/* Search Bar Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ position: 'relative' }}>
            <svg
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                pointerEvents: 'none'
              }}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search by product name, brand, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s ease',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {searchTerm && (
            <div style={{
              marginTop: '12px',
              fontSize: '13px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </div>
          )}
        </div>

        {/* Products Table Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          {/* Table Header Info */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 4px 0'
            }}>
              All Products
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0
            }}>
              Total of {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          {/* Table Container */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              minWidth: '900px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    Product
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    Category
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    Price
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    Stock Status
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'right',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr
                    key={product._id}
                    style={{
                      borderBottom: index === filteredProducts.length - 1 ? 'none' : '1px solid #e2e8f0',
                      transition: 'background-color 0.15s ease',
                      backgroundColor: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    {/* Product Column with Image and Details */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <div style={{
                          position: 'relative',
                          flexShrink: 0
                        }}>
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/100'}
                            alt={product.name}
                            style={{
                              height: '64px',
                              width: '64px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#f8fafc'
                            }}
                          />
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          minWidth: 0
                        }}>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#0f172a',
                            lineHeight: '1.4',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {product.name}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#64748b',
                            fontWeight: '500'
                          }}>
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td style={{
                      padding: '20px 24px'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '13px',
                        fontWeight: '500',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0'
                      }}>
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>

                    {/* Price Column */}
                    <td style={{
                      padding: '20px 24px'
                    }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#0f172a'
                      }}>
                        ${product.price?.toFixed(2)}
                      </div>
                    </td>

                    {/* Stock Column */}
                    <td style={{
                      padding: '20px 24px'
                    }}>
                      {(() => {
                        const stockValue = getStockValue(product.stock);
                        let bgColor, textColor, statusText, dotColor;

                        if (stockValue > 10) {
                          bgColor = '#dcfce7';
                          textColor = '#14532d';
                          dotColor = '#16a34a';
                          statusText = 'In Stock';
                        } else if (stockValue > 0) {
                          bgColor = '#fef3c7';
                          textColor = '#78350f';
                          dotColor = '#f59e0b';
                          statusText = 'Low Stock';
                        } else {
                          bgColor = '#fee2e2';
                          textColor = '#7f1d1d';
                          dotColor = '#dc2626';
                          statusText = 'Out of Stock';
                        }

                        return (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 12px',
                              backgroundColor: bgColor,
                              color: textColor,
                              fontSize: '13px',
                              fontWeight: '600',
                              borderRadius: '6px',
                              width: 'fit-content'
                            }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: dotColor
                              }}></span>
                              {statusText}
                            </div>
                            <span style={{
                              fontSize: '13px',
                              color: '#64748b',
                              fontWeight: '500'
                            }}>
                              Qty: {stockValue}
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Actions Column */}
                    <td style={{
                      padding: '20px 24px',
                      textAlign: 'right'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        gap: '8px',
                        alignItems: 'center'
                      }}>
                        <button
                          onClick={() => navigate(`/products/edit/${product._id}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            backgroundColor: '#eff6ff',
                            color: '#1e40af',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#dbeafe';
                            e.target.style.borderColor = '#93c5fd';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#eff6ff';
                            e.target.style.borderColor = '#bfdbfe';
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M10.5 1.16667C10.721 0.945669 10.9858 0.771005 11.2786 0.653303C11.5715 0.535601 11.886 0.476593 12.2031 0.479492C12.5203 0.482391 12.8337 0.547137 13.1244 0.670208C13.415 0.793279 13.6769 0.972059 13.8937 1.19623C14.1104 1.4204 14.2774 1.6869 14.3856 1.98065C14.4939 2.2744 14.5414 2.58855 14.5251 2.90273C14.5088 3.21692 14.4291 3.52422 14.291 3.80623C14.1529 4.08824 13.9593 4.33885 13.7217 4.54334L4.95504 13.3333H0.666699V8.98334L9.415 0.236668" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            backgroundColor: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#fee2e2';
                            e.target.style.borderColor = '#fca5a5';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#fef2f2';
                            e.target.style.borderColor = '#fecaca';
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1.16667 3.5H2.33333M2.33333 3.5H12.8333M2.33333 3.5V11.6667C2.33333 12.0203 2.47381 12.3594 2.72386 12.6095C2.97391 12.8595 3.31304 13 3.66667 13H10.3333C10.687 13 11.0261 12.8595 11.2761 12.6095C11.5262 12.3594 11.6667 12.0203 11.6667 11.6667V3.5H2.33333ZM4.08333 3.5V2.33333C4.08333 1.97971 4.22381 1.64057 4.47386 1.39052C4.72391 1.14048 5.06304 1 5.41667 1H8.58333C8.93696 1 9.27609 1.14048 9.52614 1.39052C9.77619 1.64057 9.91667 1.97971 9.91667 2.33333V3.5M5.41667 6.41667V10.5M8.58333 6.41667V10.5" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '64px 24px',
                backgroundColor: 'white'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  marginBottom: '16px'
                }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M4 4H6.66667L9.6 17.5867C9.7003 18.0645 9.96149 18.4933 10.3398 18.8065C10.7182 19.1197 11.1913 19.2978 11.68 19.3133H23.3333C23.822 19.2978 24.2951 19.1197 24.6735 18.8065C25.0518 18.4933 25.313 18.0645 25.4133 17.5867L27.3333 9.33333H8M12 25.3333C12 26.0697 11.403 26.6667 10.6667 26.6667C9.93029 26.6667 9.33333 26.0697 9.33333 25.3333C9.33333 24.597 9.93029 24 10.6667 24C11.403 24 12 24.597 12 25.3333ZM25.3333 25.3333C25.3333 26.0697 24.7364 26.6667 24 26.6667C23.2636 26.6667 22.6667 26.0697 22.6667 25.3333C22.6667 24.597 23.2636 24 24 24C24.7364 24 25.3333 24.597 25.3333 25.3333Z" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 8px 0'
                }}>
                  {searchTerm ? 'No products found' : 'No products yet'}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '0 0 24px 0'
                }}>
                  {searchTerm
                    ? `No products match your search "${searchTerm}"`
                    : 'Get started by adding your first product'
                  }
                </p>
                {!searchTerm && (
                  <Link
                    to="/products/add"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#3b82f6';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add Your First Product
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default ProductList;
