import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxPurchase, setMaxPurchase] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchCustomers();
    fetchStatistics();
  }, [page, search, statusFilter, dateFrom, dateTo, minPurchase, maxPurchase]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (minPurchase) params.append('minPurchase', minPurchase);
      if (maxPurchase) params.append('maxPurchase', maxPurchase);

      const response = await axios.get(
        `${API_URL}/admin/customers?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setCustomers(response.data.data.customers);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalItems(response.data.data.pagination.totalItems);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching customers');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/customers/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleDeactivate = async (customerId) => {
    if (!window.confirm('Are you sure you want to deactivate this customer?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchCustomers();
      fetchStatistics();
      alert('Customer deactivated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deactivating customer');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setMinPurchase('');
    setMaxPurchase('');
    setPage(1);
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
      day: 'numeric'
    });
  };

  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#fff0f6',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#c2185b',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#666',
      fontSize: '14px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '2px solid #f8bbd0'
    },
    statLabel: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '8px'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#c2185b'
    },
    statSubtext: {
      fontSize: '12px',
      color: '#999',
      marginTop: '4px'
    },
    filterSection: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '2px solid #f8bbd0'
    },
    filterTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#c2185b',
      marginBottom: '16px'
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
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
    select: {
      padding: '10px',
      border: '2px solid #f8bbd0',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: '#fff',
      cursor: 'pointer'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '16px'
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
    tableContainer: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      border: '2px solid #f8bbd0'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    thead: {
      backgroundColor: '#c2185b',
      color: '#fff'
    },
    th: {
      padding: '16px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '14px'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #f8bbd0',
      fontSize: '14px',
      color: '#333'
    },
    tr: {
      transition: 'background-color 0.2s'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    },
    statusActive: {
      backgroundColor: '#e8f5e9',
      color: '#2e7d32'
    },
    statusInactive: {
      backgroundColor: '#ffebee',
      color: '#c62828'
    },
    actionButton: {
      padding: '6px 12px',
      margin: '0 4px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    viewButton: {
      backgroundColor: '#e1bee7',
      color: '#6a1b9a'
    },
    editButton: {
      backgroundColor: '#f8bbd0',
      color: '#c2185b'
    },
    deactivateButton: {
      backgroundColor: '#ffcdd2',
      color: '#c62828'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginTop: '24px',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '2px solid #f8bbd0'
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
    pageButtonActive: {
      padding: '8px 16px',
      backgroundColor: '#c2185b',
      color: '#fff',
      border: '2px solid #c2185b',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer'
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
    },
    noData: {
      textAlign: 'center',
      padding: '40px',
      color: '#666'
    }
  };

  if (loading && !customers.length) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading customers...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Customer Management</h1>
        <p style={styles.subtitle}>Manage and monitor your customer base</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {statistics && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Customers</div>
            <div style={styles.statValue}>{statistics.overview?.totalCustomers || 0}</div>
            <div style={styles.statSubtext}>
              {statistics.overview?.newCustomers || 0} new this month
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active Customers</div>
            <div style={styles.statValue}>{statistics.overview?.activeCustomers || 0}</div>
            <div style={styles.statSubtext}>
              {statistics.overview?.inactiveCustomers || 0} inactive
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Revenue</div>
            <div style={styles.statValue}>
              {formatCurrency(statistics.revenue?.totalRevenue || 0)}
            </div>
            <div style={styles.statSubtext}>From all customers</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Avg Lifetime Value</div>
            <div style={styles.statValue}>
              {formatCurrency(statistics.revenue?.averageLifetimeValue || 0)}
            </div>
            <div style={styles.statSubtext}>
              AOV: {formatCurrency(statistics.revenue?.averageOrderValue || 0)}
            </div>
          </div>
        </div>
      )}

      <div style={styles.filterSection}>
        <div style={styles.filterTitle}>Filters</div>
        <div style={styles.filterGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Search</label>
            <input
              type="text"
              placeholder="Name, email, or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Min Purchase</label>
            <input
              type="number"
              placeholder="0"
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Max Purchase</label>
            <input
              type="number"
              placeholder="No limit"
              value={maxPurchase}
              onChange={(e) => setMaxPurchase(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={fetchCustomers}>
            Apply Filters
          </button>
          <button style={styles.buttonSecondary} onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Joined</th>
              <th style={styles.th}>Orders</th>
              <th style={styles.th}>Total Spent</th>
              <th style={styles.th}>Last Order</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="9" style={styles.noData}>
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer._id}
                  style={styles.tr}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff0f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={styles.td}>{customer.name || 'N/A'}</td>
                  <td style={styles.td}>{customer.email}</td>
                  <td style={styles.td}>{customer.phone || 'N/A'}</td>
                  <td style={styles.td}>{formatDate(customer.createdAt)}</td>
                  <td style={styles.td}>{customer.orderCount || 0}</td>
                  <td style={styles.td}>{formatCurrency(customer.totalSpent)}</td>
                  <td style={styles.td}>{formatDate(customer.lastOrderDate)}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(customer.isActive !== false
                          ? styles.statusActive
                          : styles.statusInactive)
                      }}
                    >
                      {customer.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={{ ...styles.actionButton, ...styles.viewButton }}
                      onClick={() => navigate(`/customers/${customer._id}`)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#ce93d8';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#e1bee7';
                      }}
                    >
                      View
                    </button>
                    <button
                      style={{ ...styles.actionButton, ...styles.editButton }}
                      onClick={() => navigate(`/customers/${customer._id}`)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f48fb1';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f8bbd0';
                      }}
                    >
                      Edit
                    </button>
                    {customer.isActive !== false && (
                      <button
                        style={{ ...styles.actionButton, ...styles.deactivateButton }}
                        onClick={() => handleDeactivate(customer._id)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#ef9a9a';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#ffcdd2';
                        }}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageButton}
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            onMouseEnter={(e) => {
              if (page !== 1) {
                e.target.style.backgroundColor = '#c2185b';
                e.target.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (page !== 1) {
                e.target.style.backgroundColor = '#fff';
                e.target.style.color = '#c2185b';
              }
            }}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page {page} of {totalPages} ({totalItems} total)
          </span>
          <button
            style={styles.pageButton}
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            onMouseEnter={(e) => {
              if (page !== totalPages) {
                e.target.style.backgroundColor = '#c2185b';
                e.target.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (page !== totalPages) {
                e.target.style.backgroundColor = '#fff';
                e.target.style.color = '#c2185b';
              }
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
