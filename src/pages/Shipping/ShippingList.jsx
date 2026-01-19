import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shippingAPI } from '../../api';
import { toast } from 'react-toastify';

const ShippingList = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredShipments, setFilteredShipments] = useState([]);

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterStatus, filterDate, searchQuery, shipments]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await shippingAPI.getAll();
      const data = response.data?.data?.shipments || response.data?.shipments || response.data?.data || response.data || [];
      setShipments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments');
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...shipments];

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(shipment => shipment.shippingStatus === filterStatus);
    }

    // Date filter
    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(shipment => {
        const shipmentDate = new Date(shipment.createdAt);
        const diffTime = Math.abs(now - shipmentDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filterDate === 'today') return diffDays <= 1;
        if (filterDate === 'week') return diffDays <= 7;
        if (filterDate === 'month') return diffDays <= 30;
        return true;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shipment => {
        const orderId = shipment.order?._id?.toLowerCase() || '';
        const trackingNumber = shipment.trackingNumber?.toLowerCase() || '';
        const customerName = shipment.order?.user?.name?.toLowerCase() ||
                            shipment.order?.shippingAddress?.fullName?.toLowerCase() || '';

        return orderId.includes(query) ||
               trackingNumber.includes(query) ||
               customerName.includes(query);
      });
    }

    setFilteredShipments(filtered);
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '6px 14px',
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '0.813rem',
      lineHeight: '1',
      fontWeight: '600',
      borderRadius: '20px',
      textTransform: 'capitalize',
      letterSpacing: '0.3px'
    };

    switch (status) {
      case 'picked_up':
        return {
          ...baseStyle,
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #bfdbfe'
        };
      case 'in_transit':
        return {
          ...baseStyle,
          backgroundColor: '#e0e7ff',
          color: '#3730a3',
          border: '1px solid #c7d2fe'
        };
      case 'out_for_delivery':
        return {
          ...baseStyle,
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fde68a'
        };
      case 'delivered':
        return {
          ...baseStyle,
          backgroundColor: '#d1fae5',
          color: '#065f46',
          border: '1px solid #a7f3d0'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#f3f4f6',
          color: '#4b5563',
          border: '1px solid #e5e7eb'
        };
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
        }}>Loading shipments...</p>
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '32px 40px'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px'
            }}>
              Shipping Management
            </h1>
            <p style={{
              fontSize: '0.938rem',
              color: '#64748b',
              margin: '0',
              fontWeight: '400'
            }}>
              Manage and track all shipments assigned to you
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div style={{
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
              }}>Total Shipments</div>
              <div style={{
                fontSize: '1.5rem',
                color: '#0f172a',
                fontWeight: '700'
              }}>{shipments.length}</div>
            </div>
            <div style={{
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
              }}>{filteredShipments.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Search */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
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
              backgroundColor: '#f0f9ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <label style={{
              fontSize: '0.938rem',
              fontWeight: '600',
              color: '#0f172a',
              letterSpacing: '-0.2px'
            }}>
              Search Shipments
            </label>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Order ID, tracking, or customer name"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.938rem',
              color: '#0f172a',
              backgroundColor: '#f8fafc',
              outline: 'none',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0284c7';
              e.target.style.backgroundColor = 'white';
              e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
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
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <label style={{
              fontSize: '0.938rem',
              fontWeight: '600',
              color: '#0f172a',
              letterSpacing: '-0.2px'
            }}>
              Shipping Status
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
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <label style={{
              fontSize: '0.938rem',
              fontWeight: '600',
              color: '#0f172a',
              letterSpacing: '-0.2px'
            }}>
              Date Range
            </label>
          </div>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
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
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Shipments Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
          }}>Shipments List</h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: '4px 0 0 0'
          }}>Manage shipping status and tracking information</p>
        </div>

        <div style={{ overflowX: 'auto' }}>
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
                  Tracking Number
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
                  Assigned Date
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
              {filteredShipments.map((shipment, index) => (
                <tr
                  key={shipment._id}
                  style={{
                    borderBottom: index !== filteredShipments.length - 1 ? '1px solid #f1f5f9' : 'none',
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
                  <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
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
                      #{shipment.order?._id?.slice(-8).toUpperCase() || 'N/A'}
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
                        {shipment.order?.user?.name || shipment.order?.shippingAddress?.fullName || 'N/A'}
                      </div>
                      <div style={{
                        fontSize: '0.813rem',
                        color: '#64748b',
                        fontWeight: '400'
                      }}>
                        {shipment.order?.shippingAddress?.phoneNumber || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: shipment.trackingNumber ? '#0f172a' : '#94a3b8',
                      fontFamily: 'monospace',
                      backgroundColor: shipment.trackingNumber ? '#f1f5f9' : '#fafafa',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      border: `1px solid ${shipment.trackingNumber ? '#e2e8f0' : '#f3f4f6'}`
                    }}>
                      {shipment.trackingNumber || 'Not Set'}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                    <span style={getStatusBadgeStyle(shipment.shippingStatus)}>
                      {formatStatus(shipment.shippingStatus)}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      {new Date(shipment.createdAt).toLocaleDateString('en-US', {
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
                    <button
                      onClick={() => navigate(`/shipping/update/${shipment._id}`)}
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
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredShipments.length === 0 && (
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
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#64748b',
                margin: '0 0 8px 0'
              }}>
                No Shipments Found
              </h3>
              <p style={{
                fontSize: '0.938rem',
                color: '#94a3b8',
                margin: '0'
              }}>
                {searchQuery || filterStatus !== 'all' || filterDate !== 'all'
                  ? 'Try adjusting your filters to see more results'
                  : 'No shipments have been assigned to you yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .shipping-list-container {
            padding: 24px 20px !important;
          }
        }

        @media (max-width: 768px) {
          .shipping-list-container {
            padding: 16px 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ShippingList;
