import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI, shippingAPI } from '../../api';
import { toast } from 'react-toastify';
import StatusUpdateModal from '../../components/orders/StatusUpdateModal';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrder();
    fetchShipping();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(id);

      // Handle different response structures
      let orderData = null;
      if (response.data?.data?.order) {
        orderData = response.data.data.order;
      } else if (response.data?.order) {
        orderData = response.data.order;
      } else if (response.data?.data) {
        orderData = response.data.data;
      } else if (response.data) {
        orderData = response.data;
      }

      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const fetchShipping = async () => {
    try {
      setLoadingShipping(true);
      const response = await shippingAPI.getById(id);

      if (response.data?.data) {
        setShipping(response.data.data);
      } else if (response.data) {
        setShipping(response.data);
      }
    } catch (error) {
      console.log('No shipping info found:', error);
      setShipping(null);
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleShipOrder = async () => {
    if (!order) return;

    try {
      const carrier = prompt('Enter carrier name (bluedart/delhivery/dtdc/fedex/aramex/other):', 'other');
      if (!carrier) return;

      const response = await shippingAPI.create({
        orderId: order._id,
        carrier: carrier.toLowerCase(),
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        weight: 1,
        notes: 'Shipment created by admin'
      });

      toast.success('Shipment created successfully!');
      await fetchShipping();
      await fetchOrder();
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error(error.response?.data?.message || 'Failed to create shipment');
    }
  };

  const handleUpdateTracking = () => {
    if (!shipping) return;

    const trackingNumber = prompt('Enter new tracking number:', shipping.trackingNumber);
    if (!trackingNumber) return;

    shippingAPI.updateStatus(shipping._id, { trackingNumber })
      .then(() => {
        toast.success('Tracking number updated successfully!');
        fetchShipping();
      })
      .catch((error) => {
        console.error('Error updating tracking:', error);
        toast.error('Failed to update tracking number');
      });
  };

  const getShippingStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      picked_up: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '8px 16px',
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '13px',
      fontWeight: 600,
      borderRadius: '8px',
      letterSpacing: '0.3px',
      textTransform: 'capitalize',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)'
    };

    switch (status?.toLowerCase()) {
      case 'delivered':
        return {
          ...baseStyle,
          backgroundColor: '#dcfce7',
          color: '#15803d',
          border: '1px solid #86efac'
        };
      case 'cancelled':
        return {
          ...baseStyle,
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fca5a5'
        };
      case 'shipped':
        return {
          ...baseStyle,
          backgroundColor: '#e0e7ff',
          color: '#4f46e5',
          border: '1px solid #a5b4fc'
        };
      case 'processing':
        return {
          ...baseStyle,
          backgroundColor: '#dbeafe',
          color: '#2563eb',
          border: '1px solid #93c5fd'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#fef3c7',
          color: '#d97706',
          border: '1px solid #fcd34d'
        };
    }
  };

  const getPaymentStatusStyle = (paymentStatus) => {
    const baseStyle = {
      padding: '8px 16px',
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '13px',
      fontWeight: 600,
      borderRadius: '8px',
      letterSpacing: '0.3px',
      textTransform: 'capitalize',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)'
    };

    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return {
          ...baseStyle,
          backgroundColor: '#dcfce7',
          color: '#15803d',
          border: '1px solid #86efac'
        };
      case 'failed':
        return {
          ...baseStyle,
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fca5a5'
        };
      case 'refunded':
        return {
          ...baseStyle,
          backgroundColor: '#f3e8ff',
          color: '#7c3aed',
          border: '1px solid #d8b4fe'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#fef3c7',
          color: '#d97706',
          border: '1px solid #fcd34d'
        };
    }
  };

  const formatValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return value.name || value.label || JSON.stringify(value);
    }
    return value;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '60px',
            width: '60px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid #ffffff'
          }}></div>
          <p style={{ color: '#ffffff', fontSize: '16px', fontWeight: 500 }}>Loading order details...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div style={{
          fontSize: '72px',
          marginBottom: '20px',
          opacity: 0.5
        }}>📦</div>
        <p style={{
          color: '#64748b',
          fontSize: '18px',
          fontWeight: 500,
          marginBottom: '20px'
        }}>Order not found</p>
        <button
          onClick={() => navigate('/orders')}
          style={{
            backgroundColor: '#6366f1',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 4px 6px rgba(99, 102, 241, 0.25)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div className="order-detail-content" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
      }}>
        {/* Premium Header Section */}
        <div className="header-card" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '32px 40px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div className="header-content-wrapper" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => navigate('/orders')}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#e2e8f0';
                  e.target.style.transform = 'translateX(-4px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                  e.target.style.transform = 'translateX(0)';
                }}
                title="Back to Orders"
              >
                ←
              </button>
              <div>
                <h1 className="order-id-title" style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#1e293b',
                  margin: 0,
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2
                }}>
                  Order #{order._id?.slice(-8).toUpperCase()}
                </h1>
                <p className="order-date-text" style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '8px 0 0 0',
                  fontWeight: 500
                }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleUpdateStatus}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }}
              >
                <span style={{ fontSize: '18px' }}>🔄</span>
                Update Status
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '30px'
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Order Items Card */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #f1f5f9'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  📦
                </div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  margin: 0,
                  color: '#1e293b',
                  letterSpacing: '-0.3px'
                }}>
                  Order Items
                </h2>
                <span style={{
                  marginLeft: 'auto',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600
                }}>
                  {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      padding: '20px',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '2px solid #f1f5f9',
                      transition: 'all 0.3s ease',
                      cursor: 'default'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#e0e7ff';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#f1f5f9';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#f8fafc',
                      border: '2px solid #f1f5f9',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}>
                      <img
                        src={item.product?.images?.[0] || 'https://via.placeholder.com/100'}
                        alt={item.product?.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontWeight: 600,
                        color: '#1e293b',
                        fontSize: '16px',
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.product?.name || 'Product'}
                      </h3>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: '13px',
                        color: '#64748b',
                        fontWeight: 500
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            backgroundColor: '#f1f5f9',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 600
                          }}>
                            Qty: {item.quantity}
                          </span>
                          {item.size && (
                            <span style={{
                              backgroundColor: '#fef3c7',
                              color: '#d97706',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontWeight: 600
                            }}>
                              {formatValue(item.size)}
                            </span>
                          )}
                          {item.color && (
                            <span style={{
                              backgroundColor: '#e0e7ff',
                              color: '#4f46e5',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontWeight: 600
                            }}>
                              {formatValue(item.color)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'right',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <p style={{
                        fontWeight: 700,
                        color: '#1e293b',
                        fontSize: '18px',
                        margin: 0
                      }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p style={{
                        fontSize: '13px',
                        color: '#64748b',
                        margin: 0,
                        fontWeight: 500
                      }}>
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address Card */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #f1f5f9'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  📍
                </div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  margin: 0,
                  color: '#1e293b',
                  letterSpacing: '-0.3px'
                }}>
                  Shipping Address
                </h2>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '16px',
                border: '2px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <p style={{
                      fontWeight: 700,
                      color: '#1e293b',
                      fontSize: '18px',
                      margin: '0 0 4px 0',
                      letterSpacing: '-0.2px'
                    }}>
                      {order.shippingAddress?.fullName}
                    </p>
                  </div>
                  <div style={{
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <p style={{
                      color: '#475569',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      margin: '0 0 6px 0',
                      fontWeight: 500
                    }}>
                      {order.shippingAddress?.address}
                    </p>
                    <p style={{
                      color: '#475569',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      margin: '0 0 6px 0',
                      fontWeight: 500
                    }}>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                    </p>
                    <p style={{
                      color: '#475569',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      margin: 0,
                      fontWeight: 500
                    }}>
                      {order.shippingAddress?.country}
                    </p>
                  </div>
                  <div style={{
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '16px' }}>📞</span>
                    <p style={{
                      color: '#1e293b',
                      fontSize: '15px',
                      fontWeight: 600,
                      margin: 0
                    }}>
                      {order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Tracking Card */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #f1f5f9'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🚚
                </div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  margin: 0,
                  color: '#1e293b',
                  letterSpacing: '-0.3px',
                  flex: 1
                }}>
                  Shipping Tracking
                </h2>
                {!shipping && !loadingShipping && (
                  <button
                    onClick={handleShipOrder}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '13px',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    Ship Order
                  </button>
                )}
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '16px',
                border: '2px solid #f1f5f9'
              }}>
                {loadingShipping ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    Loading shipping information...
                  </div>
                ) : shipping ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <p style={{
                        fontSize: '13px',
                        color: '#64748b',
                        marginBottom: '8px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Tracking Number
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <p style={{
                          fontWeight: 700,
                          fontSize: '18px',
                          color: '#1e293b',
                          margin: 0,
                          fontFamily: 'monospace'
                        }}>
                          {shipping.trackingNumber || order.trackingNumber || 'N/A'}
                        </p>
                        <button
                          onClick={handleUpdateTracking}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6366f1',
                            fontSize: '14px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                          onMouseOut={(e) => e.target.style.background = 'none'}
                          title="Update tracking number"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    <div style={{
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '18px'
                    }}>
                      <p style={{
                        fontSize: '13px',
                        color: '#64748b',
                        marginBottom: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Shipping Status
                      </p>
                      <span style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        ...(shipping.status === 'delivered' ?
                          { backgroundColor: '#dcfce7', color: '#15803d' } :
                          shipping.status === 'in_transit' || shipping.status === 'out_for_delivery' ?
                          { backgroundColor: '#dbeafe', color: '#2563eb' } :
                          shipping.status === 'picked_up' ?
                          { backgroundColor: '#e0e7ff', color: '#4f46e5' } :
                          shipping.status === 'failed' || shipping.status === 'returned' ?
                          { backgroundColor: '#fee2e2', color: '#dc2626' } :
                          { backgroundColor: '#fef3c7', color: '#d97706' })
                      }}>
                        {shipping.status?.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '18px'
                    }}>
                      <p style={{
                        fontSize: '13px',
                        color: '#64748b',
                        marginBottom: '8px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Carrier
                      </p>
                      <p style={{
                        fontWeight: 600,
                        fontSize: '16px',
                        color: '#1e293b',
                        margin: 0,
                        textTransform: 'capitalize'
                      }}>
                        {shipping.carrier || 'Standard Shipping'}
                      </p>
                    </div>

                    <div style={{
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '18px'
                    }}>
                      <p style={{
                        fontSize: '13px',
                        color: '#64748b',
                        marginBottom: '8px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Estimated Delivery
                      </p>
                      <p style={{
                        fontWeight: 600,
                        fontSize: '15px',
                        color: '#1e293b',
                        margin: 0
                      }}>
                        {shipping.estimatedDeliveryDate ?
                          new Date(shipping.estimatedDeliveryDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Not available'}
                      </p>
                    </div>

                    {shipping.actualDeliveryDate && (
                      <div style={{
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '18px'
                      }}>
                        <p style={{
                          fontSize: '13px',
                          color: '#64748b',
                          marginBottom: '8px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Delivered On
                        </p>
                        <p style={{
                          fontWeight: 600,
                          fontSize: '15px',
                          color: '#15803d',
                          margin: 0
                        }}>
                          {new Date(shipping.actualDeliveryDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}

                    <div style={{
                      marginTop: '12px',
                      display: 'flex',
                      gap: '10px'
                    }}>
                      <a
                        href={`/shipping/${shipping._id}`}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          border: '2px solid #e2e8f0'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#e2e8f0';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#f1f5f9';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📦</div>
                    <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '20px', fontWeight: 500 }}>
                      No shipping information available
                    </p>
                    <button
                      onClick={handleShipOrder}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      Create Shipment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Order Summary Card */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #f1f5f9'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  💰
                </div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  margin: 0,
                  color: '#1e293b',
                  letterSpacing: '-0.3px'
                }}>
                  Order Summary
                </h2>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '16px',
                border: '2px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#64748b',
                      fontSize: '15px',
                      fontWeight: 500
                    }}>
                      Subtotal
                    </span>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#1e293b'
                    }}>
                      ${order.subtotal?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#64748b',
                      fontSize: '15px',
                      fontWeight: 500
                    }}>
                      Shipping
                    </span>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#1e293b'
                    }}>
                      ${order.shippingCost?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#64748b',
                      fontSize: '15px',
                      fontWeight: 500
                    }}>
                      Tax
                    </span>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#1e293b'
                    }}>
                      ${order.tax?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  {order.discount > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#dcfce7',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      margin: '4px -8px'
                    }}>
                      <span style={{
                        color: '#15803d',
                        fontSize: '15px',
                        fontWeight: 600
                      }}>
                        Discount
                      </span>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '16px',
                        color: '#15803d'
                      }}>
                        -${order.discount?.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div style={{
                    borderTop: '2px solid #e2e8f0',
                    paddingTop: '20px',
                    marginTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '20px',
                    borderRadius: '12px',
                    margin: '8px -8px -8px -8px'
                  }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '18px',
                      color: '#ffffff',
                      letterSpacing: '-0.3px'
                    }}>
                      Total
                    </span>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '28px',
                      color: '#ffffff',
                      letterSpacing: '-0.5px'
                    }}>
                      ${order.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #f1f5f9'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  ⚡
                </div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  margin: 0,
                  color: '#1e293b',
                  letterSpacing: '-0.3px'
                }}>
                  Status & Payment
                </h2>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '16px',
                border: '2px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <p style={{
                      fontSize: '13px',
                      color: '#64748b',
                      marginBottom: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Order Status
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={getStatusStyle(order.status)}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '20px'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      color: '#64748b',
                      marginBottom: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Payment Status
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={getPaymentStatusStyle(order.paymentStatus)}>
                        {order.paymentStatus || 'pending'}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '20px'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      color: '#64748b',
                      marginBottom: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Payment Method
                    </p>
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <p style={{
                        fontWeight: 600,
                        fontSize: '15px',
                        color: '#1e293b',
                        margin: 0,
                        textTransform: 'capitalize'
                      }}>
                        {order.paymentMethod || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info Card */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #f1f5f9'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  👤
                </div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  margin: 0,
                  color: '#1e293b',
                  letterSpacing: '-0.3px'
                }}>
                  Customer Info
                </h2>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '16px',
                border: '2px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <p style={{
                      fontSize: '13px',
                      color: '#64748b',
                      marginBottom: '8px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Customer Name
                    </p>
                    <p style={{
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#1e293b',
                      margin: 0
                    }}>
                      {order.user?.name || 'N/A'}
                    </p>
                  </div>

                  <div style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '18px'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      color: '#64748b',
                      marginBottom: '8px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Email Address
                    </p>
                    <p style={{
                      fontWeight: 600,
                      fontSize: '15px',
                      color: '#4f46e5',
                      margin: 0,
                      wordBreak: 'break-word'
                    }}>
                      {order.user?.email || 'N/A'}
                    </p>
                  </div>

                  <div style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '18px'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      color: '#64748b',
                      marginBottom: '8px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Order Date & Time
                    </p>
                    <p style={{
                      fontWeight: 600,
                      fontSize: '15px',
                      color: '#1e293b',
                      margin: 0
                    }}>
                      {new Date(order.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        order={order}
        onUpdate={fetchOrder}
      />

      {/* Keyframes for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Tablet Breakpoint */
        @media (max-width: 1024px) {
          .order-detail-container {
            padding: 32px 16px !important;
          }

          .header-card {
            padding: 24px 28px !important;
          }

          .order-id-title {
            font-size: 28px !important;
          }

          .content-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }

        /* Mobile Breakpoint */
        @media (max-width: 768px) {
          .order-detail-container {
            padding: 20px 12px !important;
          }

          .order-detail-content {
            gap: 20px !important;
          }

          .header-card {
            padding: 20px 16px !important;
            border-radius: 16px !important;
          }

          .header-content-wrapper {
            gap: 16px !important;
          }

          .order-id-title {
            font-size: 24px !important;
          }

          .order-date-text {
            font-size: 13px !important;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
            justify-content: center !important;
            padding: 12px 20px !important;
            font-size: 14px !important;
          }

          .content-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }

          .content-grid > div > div {
            padding: 24px 20px !important;
            border-radius: 16px !important;
          }

          .content-grid > div > div h2 {
            font-size: 20px !important;
          }

          .content-grid > div > div h3 {
            font-size: 15px !important;
          }

          /* Order Items */
          .content-grid > div > div > div > div {
            padding: 16px !important;
            gap: 16px !important;
          }

          .content-grid > div > div > div > div > div:first-child {
            width: 70px !important;
            height: 70px !important;
          }

          /* Summary values */
          .content-grid > div > div > div > div > div span {
            font-size: 14px !important;
          }
        }

        /* Small Mobile Breakpoint */
        @media (max-width: 480px) {
          .order-detail-container {
            padding: 16px 8px !important;
          }

          .header-card {
            padding: 16px 12px !important;
          }

          .order-id-title {
            font-size: 20px !important;
          }

          .order-date-text {
            font-size: 12px !important;
          }

          .header-actions button {
            padding: 10px 16px !important;
            font-size: 13px !important;
          }

          .header-actions button span {
            font-size: 16px !important;
          }

          .content-grid > div > div {
            padding: 20px 16px !important;
          }

          .content-grid > div > div h2 {
            font-size: 18px !important;
          }

          .content-grid > div > div > div:first-child > div {
            width: 50px !important;
            height: 50px !important;
          }

          /* Order items */
          .content-grid > div > div > div > div > div:first-child {
            width: 60px !important;
            height: 60px !important;
          }

          /* Reduce icon sizes */
          .content-grid > div > div > div:first-child {
            font-size: 18px !important;
          }
        }

        /* Responsive Grid - Force single column on small screens */
        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetail;
