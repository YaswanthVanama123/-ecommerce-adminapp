import React, { useState, useEffect } from 'react';
import { invoicesAPI, ordersAPI } from '../../api';
import { toast } from 'react-toastify';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [emailAddress, setEmailAddress] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchStatistics();
  }, [currentPage, searchTerm, statusFilter, startDate, endDate]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoicesAPI.getAll({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter,
        startDate,
        endDate
      });

      if (response.data?.data) {
        setInvoices(response.data.data.invoices || []);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await invoicesAPI.getStatistics();
      if (response.data?.data) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleViewInvoice = async (invoice) => {
    try {
      const response = await invoicesAPI.getById(invoice._id);
      setSelectedInvoice(response.data.data);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice details');
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await invoicesAPI.download(invoiceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleEmailInvoice = async () => {
    if (!selectedInvoice || !emailAddress) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await invoicesAPI.email(selectedInvoice._id, emailAddress);
      toast.success('Invoice sent successfully');
      setShowEmailModal(false);
      setEmailAddress('');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    }
  };

  const handleRegenerateInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to regenerate this invoice? This will create a new invoice number.')) {
      return;
    }

    try {
      await invoicesAPI.regenerate(invoiceId);
      toast.success('Invoice regenerated successfully');
      fetchInvoices();
    } catch (error) {
      console.error('Error regenerating invoice:', error);
      toast.error('Failed to regenerate invoice');
    }
  };

  const handleGenerateInvoice = async (orderId) => {
    try {
      await invoicesAPI.generate(orderId);
      toast.success('Invoice generated successfully');
      setShowGenerateModal(false);
      fetchInvoices();
      fetchStatistics();
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handleBulkDownload = async () => {
    if (selectedInvoices.length === 0) {
      toast.error('Please select invoices to download');
      return;
    }

    try {
      const response = await invoicesAPI.bulkDownload(selectedInvoices);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoices-bulk-${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoices downloaded successfully');
      setSelectedInvoices([]);
    } catch (error) {
      console.error('Error bulk downloading:', error);
      toast.error('Failed to download invoices');
    }
  };

  const toggleInvoiceSelection = (invoiceId) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const selectAllInvoices = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv._id));
    }
  };

  const openGenerateModal = async () => {
    try {
      const response = await ordersAPI.getAll({ limit: 100 });
      const allOrders = response.data?.data?.orders || response.data?.orders || [];
      const ordersWithoutInvoice = allOrders.filter(order => !order.invoice || !order.invoice.invoiceNumber);
      setOrders(ordersWithoutInvoice);
      setShowGenerateModal(true);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      processing: '#9c27b0',
      shipped: '#00bcd4',
      delivered: '#4caf50',
      cancelled: '#f44336'
    };
    return colors[status] || '#757575';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      completed: '#4caf50',
      failed: '#f44336',
      refunded: '#9e9e9e'
    };
    return colors[status] || '#757575';
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#fce4ec', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#c2185b', marginBottom: '8px' }}>
          Invoice Management
        </h1>
        <p style={{ color: '#880e4f', fontSize: '14px' }}>
          Manage and track all invoices
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(194, 24, 91, 0.1)', border: '2px solid #f8bbd0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#880e4f', marginBottom: '8px' }}>Total Invoices</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#c2185b' }}>{statistics.totalInvoices}</p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#f8bbd0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '24px', height: '24px', color: '#c2185b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(194, 24, 91, 0.1)', border: '2px solid #f8bbd0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#880e4f', marginBottom: '8px' }}>Paid Invoices</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#4caf50' }}>{statistics.paidInvoices}</p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#c8e6c9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '24px', height: '24px', color: '#4caf50' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(194, 24, 91, 0.1)', border: '2px solid #f8bbd0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#880e4f', marginBottom: '8px' }}>Pending Payment</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>{statistics.pendingInvoices}</p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#ffe0b2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '24px', height: '24px', color: '#ff9800' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(194, 24, 91, 0.1)', border: '2px solid #f8bbd0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#880e4f', marginBottom: '8px' }}>Total Revenue</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#c2185b' }}>{formatCurrency(statistics.totalRevenue)}</p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#f8bbd0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '24px', height: '24px', color: '#c2185b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(194, 24, 91, 0.1)', border: '2px solid #f8bbd0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search by order/invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '2px solid #f8bbd0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '2px solid #f8bbd0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '2px solid #f8bbd0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '2px solid #f8bbd0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={openGenerateModal}
            style={{
              padding: '10px 20px',
              backgroundColor: '#c2185b',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Generate Invoice
          </button>

          {selectedInvoices.length > 0 && (
            <button
              onClick={handleBulkDownload}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ec407a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Download Selected ({selectedInvoices.length})
            </button>
          )}

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setStartDate('');
              setEndDate('');
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f8bbd0',
              color: '#c2185b',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(194, 24, 91, 0.1)', border: '2px solid #f8bbd0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8bbd0' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: '#880e4f', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                    onChange={selectAllInvoices}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#880e4f', fontWeight: '600' }}>Invoice #</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#880e4f', fontWeight: '600' }}>Order #</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#880e4f', fontWeight: '600' }}>Customer</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#880e4f', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#880e4f', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#880e4f', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#880e4f', fontWeight: '600' }}>Payment</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#880e4f', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#880e4f' }}>
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#880e4f' }}>
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice._id} style={{ borderBottom: '1px solid #f8bbd0' }}>
                    <td style={{ padding: '16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice._id)}
                        onChange={() => toggleInvoiceSelection(invoice._id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '16px', color: '#c2185b', fontWeight: '600' }}>
                      {invoice.invoice?.invoiceNumber || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', color: '#880e4f' }}>
                      {invoice.orderNumber}
                    </td>
                    <td style={{ padding: '16px', color: '#880e4f' }}>
                      <div>{invoice.shippingAddress?.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#ad1457' }}>{invoice.user?.email}</div>
                    </td>
                    <td style={{ padding: '16px', color: '#880e4f' }}>
                      {formatDate(invoice.invoice?.generatedAt || invoice.createdAt)}
                    </td>
                    <td style={{ padding: '16px', color: '#c2185b', fontWeight: '600' }}>
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: `${getStatusColor(invoice.orderStatus)}20`,
                        color: getStatusColor(invoice.orderStatus)
                      }}>
                        {invoice.orderStatus}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: `${getPaymentStatusColor(invoice.paymentStatus)}20`,
                        color: getPaymentStatusColor(invoice.paymentStatus)
                      }}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ec407a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                          title="View"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice._id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#c2185b',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                          title="Download"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setEmailAddress(invoice.user?.email || '');
                            setShowEmailModal(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f06292',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                          title="Email"
                        >
                          Email
                        </button>
                        <button
                          onClick={() => handleRegenerateInvoice(invoice._id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f8bbd0',
                            color: '#c2185b',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                          title="Regenerate"
                        >
                          Regenerate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', borderTop: '2px solid #f8bbd0' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 1 ? '#f8bbd0' : '#c2185b',
                color: currentPage === 1 ? '#ad1457' : '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              Previous
            </button>
            <span style={{ color: '#880e4f', fontWeight: '500' }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === pagination.totalPages ? '#f8bbd0' : '#c2185b',
                color: currentPage === pagination.totalPages ? '#ad1457' : '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(194, 24, 91, 0.3)'
          }}>
            <div style={{ padding: '24px', borderBottom: '2px solid #f8bbd0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2185b' }}>
                  Invoice Preview
                </h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#f8bbd0',
                    color: '#c2185b',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Invoice Template Preview */}
              <div style={{ border: '2px solid #f8bbd0', borderRadius: '12px', padding: '24px', backgroundColor: '#fff' }}>
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#c2185b', marginBottom: '8px' }}>
                    INVOICE
                  </h3>
                  <p style={{ color: '#880e4f', fontSize: '18px', fontWeight: '600' }}>
                    {selectedInvoice.invoice?.invoiceNumber}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#880e4f', marginBottom: '8px' }}>FROM:</h4>
                    <p style={{ color: '#ad1457', fontSize: '14px', lineHeight: '1.6' }}>
                      <strong>Your Company Name</strong><br />
                      123 Business Street<br />
                      City, State 12345<br />
                      contact@company.com
                    </p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#880e4f', marginBottom: '8px' }}>TO:</h4>
                    <p style={{ color: '#ad1457', fontSize: '14px', lineHeight: '1.6' }}>
                      <strong>{selectedInvoice.shippingAddress?.fullName}</strong><br />
                      {selectedInvoice.shippingAddress?.addressLine1}<br />
                      {selectedInvoice.shippingAddress?.city}, {selectedInvoice.shippingAddress?.state} {selectedInvoice.shippingAddress?.zipCode}<br />
                      {selectedInvoice.user?.email}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#880e4f', marginBottom: '4px' }}>Order Number:</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#c2185b' }}>{selectedInvoice.orderNumber}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#880e4f', marginBottom: '4px' }}>Invoice Date:</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#c2185b' }}>
                      {formatDate(selectedInvoice.invoice?.generatedAt || selectedInvoice.createdAt)}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8bbd0' }}>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#880e4f', fontWeight: '600' }}>Item</th>
                        <th style={{ padding: '12px', textAlign: 'center', color: '#880e4f', fontWeight: '600' }}>Qty</th>
                        <th style={{ padding: '12px', textAlign: 'right', color: '#880e4f', fontWeight: '600' }}>Price</th>
                        <th style={{ padding: '12px', textAlign: 'right', color: '#880e4f', fontWeight: '600' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f8bbd0' }}>
                          <td style={{ padding: '12px', color: '#ad1457' }}>
                            {item.name}
                            {(item.size || item.color) && (
                              <div style={{ fontSize: '12px', color: '#880e4f' }}>
                                {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#ad1457' }}>{item.quantity}</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#ad1457' }}>
                            {formatCurrency(item.discountPrice || item.price)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#c2185b', fontWeight: '600' }}>
                            {formatCurrency((item.discountPrice || item.price) * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #f8bbd0' }}>
                      <span style={{ color: '#880e4f' }}>Subtotal:</span>
                      <span style={{ color: '#ad1457', fontWeight: '600' }}>{formatCurrency(selectedInvoice.itemsTotal)}</span>
                    </div>
                    {selectedInvoice.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #f8bbd0' }}>
                        <span style={{ color: '#880e4f' }}>Discount:</span>
                        <span style={{ color: '#4caf50', fontWeight: '600' }}>-{formatCurrency(selectedInvoice.discount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #f8bbd0' }}>
                      <span style={{ color: '#880e4f' }}>Shipping:</span>
                      <span style={{ color: '#ad1457', fontWeight: '600' }}>{formatCurrency(selectedInvoice.shippingCharge)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #f8bbd0' }}>
                      <span style={{ color: '#880e4f' }}>Tax:</span>
                      <span style={{ color: '#ad1457', fontWeight: '600' }}>{formatCurrency(selectedInvoice.tax)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8bbd0', borderRadius: '8px', marginTop: '8px' }}>
                      <span style={{ color: '#880e4f', fontSize: '18px', fontWeight: 'bold' }}>Total:</span>
                      <span style={{ color: '#c2185b', fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(selectedInvoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fce4ec', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#880e4f', textAlign: 'center' }}>
                    <strong>Payment Method:</strong> {selectedInvoice.paymentMethod} |
                    <strong> Status:</strong> {selectedInvoice.paymentStatus}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => handleDownloadInvoice(selectedInvoice._id)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#c2185b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setEmailAddress(selectedInvoice.user?.email || '');
                    setShowEmailModal(true);
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ec407a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Email Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showGenerateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(194, 24, 91, 0.3)'
          }}>
            <div style={{ padding: '24px', borderBottom: '2px solid #f8bbd0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2185b' }}>
                  Generate Invoice
                </h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#f8bbd0',
                    color: '#c2185b',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ color: '#880e4f', marginBottom: '16px' }}>
                Select an order to generate invoice:
              </p>
              {orders.length === 0 ? (
                <p style={{ color: '#ad1457', textAlign: 'center', padding: '20px' }}>
                  No orders available without invoices
                </p>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => handleGenerateInvoice(order._id)}
                      style={{
                        padding: '16px',
                        border: '2px solid #f8bbd0',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fce4ec';
                        e.currentTarget.style.borderColor = '#c2185b';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.borderColor = '#f8bbd0';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: '600', color: '#c2185b', marginBottom: '4px' }}>
                            {order.orderNumber}
                          </p>
                          <p style={{ fontSize: '14px', color: '#880e4f' }}>
                            {order.shippingAddress?.fullName}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: '600', color: '#c2185b', marginBottom: '4px' }}>
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <p style={{ fontSize: '12px', color: '#ad1457' }}>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Invoice Modal */}
      {showEmailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(194, 24, 91, 0.3)'
          }}>
            <div style={{ padding: '24px', borderBottom: '2px solid #f8bbd0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2185b' }}>
                  Email Invoice
                </h2>
                <button
                  onClick={() => setShowEmailModal(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#f8bbd0',
                    color: '#c2185b',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#880e4f', fontWeight: '600' }}>
                Email Address
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Enter email address"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #f8bbd0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '24px',
                  outline: 'none'
                }}
              />

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowEmailModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f8bbd0',
                    color: '#c2185b',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmailInvoice}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#c2185b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
