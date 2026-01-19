import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosConfig';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState({ amount: '', reason: '', notes: '' });

  const [filters, setFilters] = useState({
    status: '',
    method: '',
    search: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchPayments();
  }, [filters, pagination.page]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await axiosInstance.get('/admin/payments', { params });
      setPayments(response.data.data.payments || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination?.totalPayments || 0,
        pages: response.data.data.pagination?.totalPages || 0
      }));
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get('/admin/payments/statistics');
      setStatistics(response.data.data || null);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchPaymentDetails = async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/admin/payments/${paymentId}`);
      setSelectedPayment(response.data.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Failed to load payment details');
    }
  };

  const handleRefundClick = (payment) => {
    setSelectedPayment(payment);
    const maxRefundable = payment.amount - (payment.refundDetails?.refundAmount || 0);
    setRefundData({
      amount: maxRefundable.toFixed(2),
      reason: '',
      notes: ''
    });
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async () => {
    if (!refundData.amount || !refundData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await axiosInstance.post(`/admin/payments/${selectedPayment._id}/refund`, {
        refundAmount: parseFloat(refundData.amount),
        refundReason: refundData.reason,
        notes: refundData.notes
      });
      toast.success('Refund processed successfully');
      setShowRefundModal(false);
      setRefundData({ amount: '', reason: '', notes: '' });
      fetchPayments();
      fetchStatistics();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error(error.response?.data?.message || 'Failed to process refund');
    }
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    try {
      await axiosInstance.patch(`/admin/payments/${paymentId}/status`, {
        status: newStatus,
        notes: `Status updated to ${newStatus} by admin`
      });
      toast.success('Payment status updated successfully');
      fetchPayments();
      fetchStatistics();
      if (showDetailsModal) {
        fetchPaymentDetails(paymentId);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      method: '',
      search: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
      partial_refund: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMethodIcon = (method) => {
    const icons = {
      razorpay: '💳',
      paytm: '💰',
      phonepe: '📱',
      gpay: '🔵',
      cod: '💵',
      wallet: '👛',
      emi: '📊',
      card: '💳',
      upi: '📲',
      netbanking: '🏦',
      split: '🔀'
    };
    return icons[method] || '💰';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          Payment Management
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage payments, process refunds, and view transaction statistics
        </p>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Revenue</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
              {formatCurrency(statistics.revenue?.totalRevenue || 0)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
              {statistics.revenue?.totalTransactions || 0} transactions
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Success Rate</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
              {statistics.overview?.successRate || 0}%
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {statistics.overview?.completedPayments || 0} / {statistics.overview?.totalPayments || 0} payments
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Avg Transaction</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
              {formatCurrency(statistics.revenue?.avgTransactionValue || 0)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Average per transaction
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Refunded</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
              {formatCurrency(statistics.refunds?.totalRefunded || 0)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {statistics.refunds?.refundCount || 0} refunds
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Transaction ID, Email, Order..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="partial_refund">Partial Refund</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Method
            </label>
            <select
              value={filters.method}
              onChange={(e) => handleFilterChange('method', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">All Methods</option>
              <option value="razorpay">Razorpay</option>
              <option value="paytm">Paytm</option>
              <option value="phonepe">PhonePe</option>
              <option value="gpay">Google Pay</option>
              <option value="cod">Cash on Delivery</option>
              <option value="wallet">Wallet</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Min Amount
            </label>
            <input
              type="number"
              placeholder="Min"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Max Amount
            </label>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={clearFilters}
              style={{
                width: '100%',
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Transaction ID
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Order
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  User
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Method
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Amount
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Date
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                      {payment.transactionId || payment.gateway?.paymentId || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                      {payment.order?.orderNumber || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                      <div>{payment.user?.firstName} {payment.user?.lastName}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{payment.user?.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                      <span>{getMethodIcon(payment.method)} {payment.method.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      {formatCurrency(payment.amount)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        ...(() => {
                          const className = getStatusColor(payment.status);
                          const [bg, text] = className.split(' ');
                          return {
                            backgroundColor: bg.replace('bg-', '').replace('-100', '') === 'yellow' ? '#fef3c7' :
                                            bg.replace('bg-', '').replace('-100', '') === 'blue' ? '#dbeafe' :
                                            bg.replace('bg-', '').replace('-100', '') === 'green' ? '#d1fae5' :
                                            bg.replace('bg-', '').replace('-100', '') === 'red' ? '#fee2e2' :
                                            bg.replace('bg-', '').replace('-100', '') === 'purple' ? '#f3e8ff' :
                                            bg.replace('bg-', '').replace('-100', '') === 'orange' ? '#fed7aa' : '#f3f4f6',
                            color: text.replace('text-', '').replace('-800', '') === 'yellow' ? '#92400e' :
                                  text.replace('text-', '').replace('-800', '') === 'blue' ? '#1e40af' :
                                  text.replace('text-', '').replace('-800', '') === 'green' ? '#065f46' :
                                  text.replace('text-', '').replace('-800', '') === 'red' ? '#991b1b' :
                                  text.replace('text-', '').replace('-800', '') === 'purple' ? '#6b21a8' :
                                  text.replace('text-', '').replace('-800', '') === 'orange' ? '#9a3412' : '#374151'
                          };
                        })()
                      }}>
                        {payment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>
                      {formatDate(payment.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => fetchPaymentDetails(payment._id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ec4899',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          View
                        </button>
                        {payment.status === 'completed' && (
                          <button
                            onClick={() => handleRefundClick(payment)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && payments.length > 0 && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pagination.page === 1 ? '#f3f4f6' : '#ec4899',
                  color: pagination.page === 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pagination.page >= pagination.pages ? '#f3f4f6' : '#ec4899',
                  color: pagination.page >= pagination.pages ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                Payment Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gap: '24px' }}>
              {/* Basic Info */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Transaction ID</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {selectedPayment.transactionId || selectedPayment.gateway?.paymentId || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Order Number</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {selectedPayment.order?.orderNumber || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Amount</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#ec4899' }}>
                      {formatCurrency(selectedPayment.amount)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'inline-block',
                      ...(() => {
                        const className = getStatusColor(selectedPayment.status);
                        const [bg, text] = className.split(' ');
                        return {
                          backgroundColor: bg.replace('bg-', '').replace('-100', '') === 'yellow' ? '#fef3c7' :
                                          bg.replace('bg-', '').replace('-100', '') === 'blue' ? '#dbeafe' :
                                          bg.replace('bg-', '').replace('-100', '') === 'green' ? '#d1fae5' :
                                          bg.replace('bg-', '').replace('-100', '') === 'red' ? '#fee2e2' :
                                          bg.replace('bg-', '').replace('-100', '') === 'purple' ? '#f3e8ff' :
                                          bg.replace('bg-', '').replace('-100', '') === 'orange' ? '#fed7aa' : '#f3f4f6',
                          color: text.replace('text-', '').replace('-800', '') === 'yellow' ? '#92400e' :
                                text.replace('text-', '').replace('-800', '') === 'blue' ? '#1e40af' :
                                text.replace('text-', '').replace('-800', '') === 'green' ? '#065f46' :
                                text.replace('text-', '').replace('-800', '') === 'red' ? '#991b1b' :
                                text.replace('text-', '').replace('-800', '') === 'purple' ? '#6b21a8' :
                                text.replace('text-', '').replace('-800', '') === 'orange' ? '#9a3412' : '#374151'
                        };
                      })()
                    }}>
                      {selectedPayment.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Method</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {getMethodIcon(selectedPayment.method)} {selectedPayment.method.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {formatDate(selectedPayment.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  Customer Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Name</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {selectedPayment.user?.firstName} {selectedPayment.user?.lastName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {selectedPayment.user?.email}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Phone</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {selectedPayment.user?.phone || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Refund Details */}
              {selectedPayment.refundDetails && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                    Refund Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Refund Amount</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
                        {formatCurrency(selectedPayment.refundDetails.refundAmount)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Refund Status</div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {selectedPayment.refundDetails.refundStatus?.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Refund Reason</div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {selectedPayment.refundDetails.refundReason}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Refunded At</div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {formatDate(selectedPayment.refundDetails.refundedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  Quick Actions
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {selectedPayment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(selectedPayment._id, 'completed')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Mark as Completed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedPayment._id, 'failed')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Mark as Failed
                      </button>
                    </>
                  )}
                  {selectedPayment.status === 'completed' && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleRefundClick(selectedPayment);
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Process Refund
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
              Process Refund
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Refund Amount *
              </label>
              <input
                type="number"
                value={refundData.amount}
                onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
                max={selectedPayment.amount - (selectedPayment.refundDetails?.refundAmount || 0)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Max refundable: {formatCurrency(selectedPayment.amount - (selectedPayment.refundDetails?.refundAmount || 0))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Refund Reason *
              </label>
              <select
                value={refundData.reason}
                onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select a reason</option>
                <option value="customer_request">Customer Request</option>
                <option value="order_cancelled">Order Cancelled</option>
                <option value="product_defective">Product Defective</option>
                <option value="product_not_delivered">Product Not Delivered</option>
                <option value="duplicate_payment">Duplicate Payment</option>
                <option value="wrong_product">Wrong Product</option>
                <option value="quality_issue">Quality Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Additional Notes
              </label>
              <textarea
                value={refundData.notes}
                onChange={(e) => setRefundData({ ...refundData, notes: e.target.value })}
                rows="3"
                placeholder="Add any additional notes..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleRefundSubmit}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  backgroundColor: '#ec4899',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Process Refund
              </button>
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundData({ amount: '', reason: '', notes: '' });
                }}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
