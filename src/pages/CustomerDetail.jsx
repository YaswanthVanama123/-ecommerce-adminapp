import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true
  });

  // Pagination for orders
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchCustomerDetails();
    fetchCustomerOrders();
  }, [id, orderPage]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const customerData = response.data.data.customer;
        setCustomer(customerData);
        setEditForm({
          name: customerData.name || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          isActive: customerData.isActive !== false
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching customer details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/admin/customers/${id}/orders?page=${orderPage}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setOrders(response.data.data.orders);
        setOrderTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/admin/customers/${id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Customer updated successfully');
        setIsEditing(false);
        fetchCustomerDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating customer');
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this customer?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Customer deactivated successfully');
      navigate('/customers');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deactivating customer');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fff3e0', color: '#e65100' },
      processing: { bg: '#e3f2fd', color: '#1565c0' },
      shipped: { bg: '#f3e5f5', color: '#6a1b9a' },
      delivered: { bg: '#e8f5e9', color: '#2e7d32' },
      cancelled: { bg: '#ffebee', color: '#c62828' }
    };
    return colors[status] || colors.pending;
  };

  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#fff0f6',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    backButton: {
      padding: '8px 16px',
      backgroundColor: '#fff',
      color: '#c2185b',
      border: '2px solid #c2185b',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.3s'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#c2185b',
      margin: 0
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px'
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#c2185b',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    },
    buttonSecondary: {
      padding: '10px 20px',
      backgroundColor: '#fff',
      color: '#c2185b',
      border: '2px solid #c2185b',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    buttonDanger: {
      padding: '10px 20px',
      backgroundColor: '#c62828',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    },
    card: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '2px solid #f8bbd0'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#c2185b',
      marginBottom: '16px'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #f8bbd0'
    },
    infoLabel: {
      fontSize: '14px',
      color: '#666',
      fontWeight: '500'
    },
    infoValue: {
      fontSize: '14px',
      color: '#333',
      fontWeight: '600'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px'
    },
    statCard: {
      backgroundColor: '#fff0f6',
      padding: '16px',
      borderRadius: '6px',
      textAlign: 'center'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#c2185b',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '12px',
      color: '#666'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#c2185b'
    },
    input: {
      padding: '10px',
      border: '2px solid #f8bbd0',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.3s'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    },
    timeline: {
      position: 'relative',
      paddingLeft: '30px'
    },
    timelineItem: {
      position: 'relative',
      paddingBottom: '24px',
      borderLeft: '2px solid #f8bbd0'
    },
    timelineDot: {
      position: 'absolute',
      left: '-9px',
      top: '0',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      backgroundColor: '#c2185b',
      border: '2px solid #fff'
    },
    timelineContent: {
      marginLeft: '20px',
      backgroundColor: '#fff',
      padding: '16px',
      borderRadius: '6px',
      border: '1px solid #f8bbd0'
    },
    timelineTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#c2185b',
      marginBottom: '4px'
    },
    timelineText: {
      fontSize: '13px',
      color: '#666',
      marginBottom: '8px'
    },
    timelineDate: {
      fontSize: '12px',
      color: '#999'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    },
    tableContainer: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      padding: '12px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '13px',
      color: '#c2185b',
      borderBottom: '2px solid #f8bbd0'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #f8bbd0',
      fontSize: '13px',
      color: '#333'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginTop: '16px'
    },
    pageButton: {
      padding: '8px 16px',
      backgroundColor: '#fff',
      color: '#c2185b',
      border: '2px solid #c2185b',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    pageInfo: {
      fontSize: '14px',
      color: '#666'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '16px',
      color: '#c2185b'
    },
    error: {
      backgroundColor: '#ffebee',
      color: '#c62828',
      padding: '16px',
      borderRadius: '6px',
      marginBottom: '20px',
      border: '2px solid #ef5350'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading customer details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button style={styles.button} onClick={() => navigate('/customers')}>
          Back to Customers
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Customer not found</div>
        <button style={styles.button} onClick={() => navigate('/customers')}>
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            style={styles.backButton}
            onClick={() => navigate('/customers')}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#c2185b';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.color = '#c2185b';
            }}
          >
            Back
          </button>
          <h1 style={styles.title}>{customer.name || 'Customer Details'}</h1>
        </div>
        <div style={styles.buttonGroup}>
          {!isEditing ? (
            <>
              <button
                style={styles.button}
                onClick={() => setIsEditing(true)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ad1457';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#c2185b';
                }}
              >
                Edit Customer
              </button>
              {customer.isActive !== false && (
                <button
                  style={styles.buttonDanger}
                  onClick={handleDeactivate}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#b71c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#c62828';
                  }}
                >
                  Deactivate
                </button>
              )}
            </>
          ) : (
            <>
              <button
                style={styles.button}
                onClick={handleUpdateCustomer}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ad1457';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#c2185b';
                }}
              >
                Save Changes
              </button>
              <button
                style={styles.buttonSecondary}
                onClick={() => setIsEditing(false)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#c2185b';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.color = '#c2185b';
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div style={styles.grid}>
        {/* Customer Information */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Customer Information</div>
          {isEditing ? (
            <form style={styles.form} onSubmit={handleUpdateCustomer}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  style={styles.checkbox}
                />
                <label style={styles.label}>Active</label>
              </div>
            </form>
          ) : (
            <>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email</span>
                <span style={styles.infoValue}>{customer.email}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Phone</span>
                <span style={styles.infoValue}>{customer.phone || 'N/A'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Status</span>
                <span style={styles.infoValue}>
                  {customer.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Joined</span>
                <span style={styles.infoValue}>{formatDate(customer.createdAt)}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Last Updated</span>
                <span style={styles.infoValue}>{formatDate(customer.updatedAt)}</span>
              </div>
            </>
          )}
        </div>

        {/* Customer Statistics */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Customer Statistics</div>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{customer.statistics?.orderCount || 0}</div>
              <div style={styles.statLabel}>Total Orders</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {formatCurrency(customer.statistics?.totalSpent || 0)}
              </div>
              <div style={styles.statLabel}>Total Spent</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {formatCurrency(customer.statistics?.averageOrderValue || 0)}
              </div>
              <div style={styles.statLabel}>Avg Order Value</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{customer.statistics?.completedOrders || 0}</div>
              <div style={styles.statLabel}>Completed</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{customer.statistics?.pendingOrders || 0}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{customer.statistics?.cancelledOrders || 0}</div>
              <div style={styles.statLabel}>Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Order History</div>
        {orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No orders found
          </p>
        ) : (
          <>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Items</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td style={styles.td}>
                        #{order.orderId || order._id.slice(-8).toUpperCase()}
                      </td>
                      <td style={styles.td}>{formatDate(order.createdAt)}</td>
                      <td style={styles.td}>{order.items?.length || 0} items</td>
                      <td style={styles.td}>{formatCurrency(order.totalAmount)}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: getStatusColor(order.status).bg,
                            color: getStatusColor(order.status).color
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor:
                              order.paymentStatus === 'paid' ? '#e8f5e9' : '#ffebee',
                            color: order.paymentStatus === 'paid' ? '#2e7d32' : '#c62828'
                          }}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orderTotalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  style={styles.pageButton}
                  onClick={() => setOrderPage(orderPage - 1)}
                  disabled={orderPage === 1}
                  onMouseEnter={(e) => {
                    if (orderPage !== 1) {
                      e.target.style.backgroundColor = '#c2185b';
                      e.target.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (orderPage !== 1) {
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.color = '#c2185b';
                    }
                  }}
                >
                  Previous
                </button>
                <span style={styles.pageInfo}>
                  Page {orderPage} of {orderTotalPages}
                </span>
                <button
                  style={styles.pageButton}
                  onClick={() => setOrderPage(orderPage + 1)}
                  disabled={orderPage === orderTotalPages}
                  onMouseEnter={(e) => {
                    if (orderPage !== orderTotalPages) {
                      e.target.style.backgroundColor = '#c2185b';
                      e.target.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (orderPage !== orderTotalPages) {
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.color = '#c2185b';
                    }
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Lifetime Value Card */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Customer Lifetime Value</div>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#c2185b' }}>
            {formatCurrency(customer.statistics?.lifetimeValue || 0)}
          </div>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Total value generated by this customer
          </p>
          {customer.statistics?.firstOrderDate && (
            <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
              Customer since {formatDate(customer.statistics.firstOrderDate)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
