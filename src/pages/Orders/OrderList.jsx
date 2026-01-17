import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../api';
import { toast } from 'react-toastify';
import StatusUpdateModal from '../../components/orders/StatusUpdateModal';

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    if (filterPayment !== 'all') {
      filtered = filtered.filter((order) => order.paymentStatus === filterPayment);
    }

    setFilteredOrders(filtered);
  }, [filterStatus, filterPayment, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();

      // Handle different response structures
      let ordersData = [];
      if (response.data?.data?.orders) {
        ordersData = response.data.data.orders;
      } else if (response.data?.orders) {
        ordersData = response.data.orders;
      } else if (Array.isArray(response.data?.data)) {
        ordersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      }

      // Ensure it's an array
      if (!Array.isArray(ordersData)) {
        console.warn('Orders data is not an array:', ordersData);
        ordersData = [];
      }

      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Helper function to get payment status badge styles
  const getPaymentStatusStyle = (paymentStatus) => {
    const baseStyle = {
      padding: '6px 14px',
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '0.813rem',
      lineHeight: '1',
      fontWeight: '600',
      borderRadius: '20px',
      textTransform: 'capitalize',
      letterSpacing: '0.3px',
      transition: 'all 0.2s ease'
    };

    if (paymentStatus === 'paid') {
      return {
        ...baseStyle,
        backgroundColor: '#d1fae5',
        color: '#065f46',
        border: '1px solid #a7f3d0'
      };
    } else if (paymentStatus === 'failed') {
      return {
        ...baseStyle,
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fecaca'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fde68a'
      };
    }
  };

  // Helper function to get order status badge styles
  const getOrderStatusStyle = (status) => {
    const baseStyle = {
      padding: '6px 14px',
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '0.813rem',
      lineHeight: '1',
      fontWeight: '600',
      borderRadius: '20px',
      textTransform: 'capitalize',
      letterSpacing: '0.3px',
      transition: 'all 0.2s ease'
    };

    if (status === 'delivered') {
      return {
        ...baseStyle,
        backgroundColor: '#d1fae5',
        color: '#065f46',
        border: '1px solid #a7f3d0'
      };
    } else if (status === 'cancelled') {
      return {
        ...baseStyle,
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fecaca'
      };
    } else if (status === 'shipped') {
      return {
        ...baseStyle,
        backgroundColor: '#e0e7ff',
        color: '#3730a3',
        border: '1px solid #c7d2fe'
      };
    } else if (status === 'processing') {
      return {
        ...baseStyle,
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        border: '1px solid #bfdbfe'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fde68a'
      };
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{
          marginTop: '20px',
          fontSize: '0.938rem',
          color: '#64748b',
          fontWeight: '500'
        }}>Loading orders...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="order-list-container" style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '32px 40px'
    }}>
      {/* Professional Header */}
      <div className="header-section" style={{
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <div className="header-content" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 className="page-title" style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px'
            }}>
              Order Management
            </h1>
            <p className="page-subtitle" style={{
              fontSize: '0.938rem',
              color: '#64748b',
              margin: '0',
              fontWeight: '400'
            }}>
              View and manage all customer orders in one place
            </p>
          </div>
          <div className="stats-container" style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div className="stat-card" style={{
              backgroundColor: 'white',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                fontSize: '0.813rem',
                color: '#64748b',
                fontWeight: '500',
                marginBottom: '4px'
              }}>Total Orders</div>
              <div style={{
                fontSize: '1.5rem',
                color: '#0f172a',
                fontWeight: '700'
              }}>{orders.length}</div>
            </div>
            <div className="stat-card" style={{
              backgroundColor: 'white',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                fontSize: '0.813rem',
                color: '#64748b',
                fontWeight: '500',
                marginBottom: '4px'
              }}>Filtered Results</div>
              <div style={{
                fontSize: '1.5rem',
                color: '#3b82f6',
                fontWeight: '700'
              }}>{filteredOrders.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filter Cards */}
      <div className="filter-cards" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Order Status Filter */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <label style={{
              fontSize: '0.938rem',
              fontWeight: '600',
              color: '#0f172a',
              letterSpacing: '-0.2px'
            }}>
              Order Status
            </label>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.938rem',
              color: '#0f172a',
              backgroundColor: '#f8fafc',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '20px',
              paddingRight: '40px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.backgroundColor = 'white';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <label style={{
              fontSize: '0.938rem',
              fontWeight: '600',
              color: '#0f172a',
              letterSpacing: '-0.2px'
            }}>
              Payment Status
            </label>
          </div>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.938rem',
              color: '#0f172a',
              backgroundColor: '#f8fafc',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '20px',
              paddingRight: '40px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.backgroundColor = 'white';
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Professional Orders Table */}
      <div className="orders-table-wrapper" style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#fafbfc'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0',
            letterSpacing: '-0.3px'
          }}>Orders List</h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: '4px 0 0 0'
          }}>View detailed information about each order</p>
        </div>

        <div className="table-scroll-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '0.813rem',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap'
                }}>
                  Order ID
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '0.813rem',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap'
                }}>
                  Customer
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '0.813rem',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap'
                }}>
                  Items
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '0.813rem',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap'
                }}>
                  Total
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '0.813rem',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap'
                }}>
                  Payment
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '0.813rem',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap'
                }}>
                  Status
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '0.813rem',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap'
                }}>
                  Date
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'center',
                  fontSize: '0.813rem',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr
                  key={order._id}
                  style={{
                    borderBottom: index !== filteredOrders.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#3b82f6',
                      fontFamily: 'monospace',
                      backgroundColor: '#eff6ff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      border: '1px solid #dbeafe'
                    }}>
                      #{order._id?.slice(-6).toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{
                        fontSize: '0.938rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        letterSpacing: '-0.2px'
                      }}>
                        {order.user?.name || order.shippingAddress?.fullName || 'N/A'}
                      </div>
                      <div style={{
                        fontSize: '0.813rem',
                        color: '#64748b',
                        fontWeight: '400'
                      }}>
                        {order.user?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#f1f5f9',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#475569',
                        fontWeight: '600'
                      }}>
                        {order.items?.length || 0} items
                      </span>
                    </div>
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#0f172a',
                      letterSpacing: '-0.3px'
                    }}>
                      ${order.total?.toFixed(2) || '0.00'}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                    <span style={getPaymentStatusStyle(order.paymentStatus)}>
                      {order.paymentStatus || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                    <span style={getOrderStatusStyle(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                    textAlign: 'center'
                  }}>
                    <div className="action-buttons" style={{
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'center'
                    }}>
                      <button
                        onClick={() => navigate(`/orders/${order._id}`)}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '0.813rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#3b82f6';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order)}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '0.813rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#10b981';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                        }}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#fafbfc'
            }}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ margin: '0 auto 16px' }}
              >
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#64748b',
                margin: '0 0 8px 0'
              }}>
                No Orders Found
              </h3>
              <p style={{
                fontSize: '0.938rem',
                color: '#94a3b8',
                margin: '0'
              }}>
                Try adjusting your filters to see more results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        order={selectedOrder}
        onUpdate={fetchOrders}
      />

      {/* Responsive CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Tablet Breakpoint */
        @media (max-width: 1024px) {
          .order-list-container {
            padding: 24px 20px !important;
          }

          .page-title {
            font-size: 1.75rem !important;
          }

          .stats-container {
            width: 100%;
            justify-content: flex-start !important;
          }

          .stat-card {
            flex: 1;
            min-width: 140px;
          }

          .filter-cards {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
          }
        }

        /* Mobile Breakpoint */
        @media (max-width: 768px) {
          .order-list-container {
            padding: 16px 12px !important;
          }

          .header-section {
            margin-bottom: 24px !important;
            padding-bottom: 16px !important;
          }

          .page-title {
            font-size: 1.5rem !important;
          }

          .page-subtitle {
            font-size: 0.875rem !important;
          }

          .stats-container {
            width: 100%;
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: 12px !important;
          }

          .stat-card {
            flex: 0 0 auto;
            min-width: 130px;
            padding: 10px 16px !important;
          }

          .stat-card > div:first-child {
            font-size: 0.75rem !important;
          }

          .stat-card > div:last-child {
            font-size: 1.25rem !important;
          }

          .filter-cards {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            margin-bottom: 20px !important;
          }

          .orders-table-wrapper {
            border-radius: 12px !important;
          }

          .orders-table-wrapper > div:first-child {
            padding: 16px 12px !important;
          }

          .orders-table-wrapper h2 {
            font-size: 1rem !important;
          }

          .orders-table-wrapper p {
            font-size: 0.813rem !important;
          }

          .table-scroll-wrapper {
            -webkit-overflow-scrolling: touch;
          }

          .table-scroll-wrapper table {
            min-width: 900px;
          }

          .action-buttons {
            flex-direction: column !important;
            gap: 6px !important;
          }

          .action-buttons button {
            width: 100%;
            padding: 6px 12px !important;
            font-size: 0.75rem !important;
          }
        }

        /* Small Mobile Breakpoint */
        @media (max-width: 480px) {
          .order-list-container {
            padding: 12px 8px !important;
          }

          .page-title {
            font-size: 1.25rem !important;
          }

          .header-content {
            gap: 12px !important;
          }

          .stat-card {
            min-width: 120px;
            padding: 8px 12px !important;
          }

          .filter-cards {
            gap: 12px !important;
          }

          .filter-cards > div {
            padding: 20px !important;
          }

          .filter-cards select {
            font-size: 0.875rem !important;
            padding: 10px 14px !important;
          }
        }

        /* Horizontal scroll indicator */
        @media (max-width: 768px) {
          .table-scroll-wrapper::after {
            content: '← Scroll for more →';
            display: block;
            text-align: center;
            padding: 12px;
            background: #f8fafc;
            color: #64748b;
            font-size: 0.75rem;
            font-weight: 500;
            border-top: 1px solid #e2e8f0;
          }

          .table-scroll-wrapper::-webkit-scrollbar {
            height: 8px;
          }

          .table-scroll-wrapper::-webkit-scrollbar-track {
            background: #f1f5f9;
          }

          .table-scroll-wrapper::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }

          .table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderList;
