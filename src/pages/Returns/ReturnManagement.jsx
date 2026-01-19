import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosConfig';

const ReturnManagement = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    refundAmount: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchReturns();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/returns/admin/statistics');
      setStats(response.data.statistics || {
        total: 0,
        pending: 0,
        approved: 0,
        refundAmount: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await axiosInstance.get('/returns/admin/all', { params });
      setReturns(response.data.returns || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      }));
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (returnId, newStatus, notes = '') => {
    try {
      await axiosInstance.put(`/returns/${returnId}/status`, {
        status: newStatus,
        adminNotes: notes
      });
      toast.success(`Return ${newStatus} successfully`);
      fetchReturns();
      fetchStats();
    } catch (error) {
      console.error('Error updating return status:', error);
      toast.error(error.response?.data?.message || 'Failed to update return');
    }
  };

  const handleApprove = async (returnId) => {
    const notes = prompt('Add any notes for approval (optional):');
    await handleStatusUpdate(returnId, 'approved', notes);
  };

  const handleReject = async (returnId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) {
      toast.error('Rejection reason is required');
      return;
    }
    await handleStatusUpdate(returnId, 'rejected', reason);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      approved: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
      rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
      picked_up: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
      received: { bg: '#e9d5ff', text: '#6b21a8', border: '#d8b4fe' },
      inspected: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
      refund_initiated: { bg: '#cffafe', text: '#155e75', border: '#a5f3fc' },
      refund_completed: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
      exchange_initiated: { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' },
      exchange_completed: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
      cancelled: { bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' }
    };
    return colors[status] || colors.cancelled;
  };

  const getTypeIcon = (type) => {
    if (type === 'refund') {
      return (
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: '#dbeafe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
      );
    }
    return (
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: '#d1fae5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg style={{ width: '24px', height: '24px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </div>
    );
  };

  if (loading && returns.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: '#e5e7eb',
            borderTopColor: '#2563eb',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading returns...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0
          }}>Return Management</h1>
          <p style={{
            color: '#6b7280',
            marginTop: '4px',
            fontSize: '14px'
          }}>Manage customer return and exchange requests</p>
        </div>
        <button
          onClick={fetchReturns}
          style={{
            padding: '12px 24px',
            background: '#2563eb',
            color: '#ffffff',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s',
            alignSelf: 'flex-start'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
          onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
        >
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px'
      }}>
        {/* Total Returns */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Total Returns</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px', margin: 0 }}>{stats.total}</p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Pending Review</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px', margin: 0 }}>{stats.pending}</p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Approved */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Approved</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px', margin: 0 }}>{stats.approved}</p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Refund Amount */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Refund Amount</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px', margin: 0 }}>${stats.refundAmount?.toLocaleString() || 0}</p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
          marginTop: 0,
          marginBottom: '24px'
        }}>Filter Returns</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '12px'
            }}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#111827',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="picked_up">Picked Up</option>
              <option value="received">Received</option>
              <option value="inspected">Inspected</option>
              <option value="refund_initiated">Refund Initiated</option>
              <option value="refund_completed">Refund Completed</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '12px'
            }}>Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#111827',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="">All Types</option>
              <option value="refund">Refund</option>
              <option value="exchange">Exchange</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '12px'
            }}>Search</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by ID, order, customer..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  boxSizing: 'border-box'
                }}
              />
              <svg style={{
                width: '20px',
                height: '20px',
                color: '#9ca3af',
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Returns List */}
      {returns.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            background: '#f3f4f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg style={{ width: '40px', height: '40px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>No returns found</h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {returns.map((returnItem) => {
            const statusColors = getStatusColor(returnItem.status);
            return (
              <div key={returnItem._id} style={{
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'box-shadow 0.2s'
              }}>
                <div style={{ padding: '32px' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px'
                  }}>
                    {/* Main Content */}
                    <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
                      {getTypeIcon(returnItem.type)}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '12px',
                          marginBottom: '16px',
                          alignItems: 'center'
                        }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: 0
                          }}>
                            #{returnItem.returnNumber || returnItem._id.slice(-8).toUpperCase()}
                          </h3>
                          <span style={{
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: '9999px',
                            background: statusColors.bg,
                            color: statusColors.text,
                            border: `1px solid ${statusColors.border}`
                          }}>
                            {returnItem.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span style={{
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: '9999px',
                            background: returnItem.type === 'refund' ? '#eff6ff' : '#f0fdf4',
                            color: returnItem.type === 'refund' ? '#1d4ed8' : '#15803d'
                          }}>
                            {returnItem.type.charAt(0).toUpperCase() + returnItem.type.slice(1)}
                          </span>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '24px',
                          fontSize: '14px'
                        }}>
                          <div>
                            <p style={{ color: '#6b7280', marginBottom: '8px', margin: 0 }}>Order</p>
                            <button
                              onClick={() => navigate(`/orders/${returnItem.order._id || returnItem.order}`)}
                              style={{
                                color: '#2563eb',
                                fontWeight: '500',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              #{returnItem.order.orderNumber || returnItem.order._id?.slice(-8).toUpperCase()}
                            </button>
                          </div>
                          <div>
                            <p style={{ color: '#6b7280', marginBottom: '8px', margin: 0 }}>Customer</p>
                            <p style={{ color: '#111827', fontWeight: '500', margin: 0 }}>{returnItem.user?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p style={{ color: '#6b7280', marginBottom: '8px', margin: 0 }}>Items</p>
                            <p style={{ color: '#111827', fontWeight: '500', margin: 0 }}>{returnItem.items?.length || 0} item(s)</p>
                          </div>
                          <div>
                            <p style={{ color: '#6b7280', marginBottom: '8px', margin: 0 }}>Date</p>
                            <p style={{ color: '#111827', fontWeight: '500', margin: 0 }}>
                              {new Date(returnItem.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '24px',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '24px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', margin: 0 }}>Refund Amount</p>
                        <p style={{
                          fontSize: '28px',
                          fontWeight: 'bold',
                          color: '#111827',
                          margin: 0
                        }}>
                          ${returnItem.refundAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        <button
                          onClick={() => navigate(`/returns/${returnItem._id}`)}
                          style={{
                            padding: '12px 24px',
                            background: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        >
                          View Details
                        </button>
                        {returnItem.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(returnItem._id)}
                              style={{
                                padding: '12px 24px',
                                background: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'background 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                              onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(returnItem._id)}
                              style={{
                                padding: '12px 24px',
                                background: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'background 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                              onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '14px', color: '#374151' }}>
              Showing <span style={{ fontWeight: '500' }}>{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span style={{ fontWeight: '500' }}>{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span style={{ fontWeight: '500' }}>{pagination.total}</span> results
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page === 1 ? 0.5 : 1,
                  fontSize: '14px'
                }}
              >
                Previous
              </button>
              {[...Array(Math.min(pagination.pages, 5))].map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pagination.page === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isActive ? '#2563eb' : '#ffffff',
                      color: isActive ? '#ffffff' : '#374151',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page === pagination.pages ? 0.5 : 1,
                  fontSize: '14px'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnManagement;
