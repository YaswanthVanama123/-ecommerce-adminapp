import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../api';

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [reorderModal, setReorderModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState('7days');
  const [chartData, setChartData] = useState(null);

  // Form states
  const [adjustmentForm, setAdjustmentForm] = useState({
    size: '',
    color: '',
    adjustment: '',
    reason: '',
    notes: '',
    adjustmentType: 'manual'
  });

  const [reorderForm, setReorderForm] = useState({
    size: '',
    color: '',
    quantity: '',
    notes: ''
  });

  // Fetch inventory overview
  const fetchInventoryOverview = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getOverview();
      if (response.data.success) {
        setStatistics(response.data.statistics);
        setInventory(response.data.inventory);
      }
    } catch (error) {
      console.error('Failed to fetch inventory overview:', error);
      alert('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch low stock alerts
  const fetchLowStockAlerts = async () => {
    try {
      const response = await inventoryAPI.getLowStockAlerts();
      if (response.data.success) {
        setLowStockAlerts(response.data.alerts);
      }
    } catch (error) {
      console.error('Failed to fetch low stock alerts:', error);
    }
  };

  // Fetch inventory history
  const fetchInventoryHistory = async (page = 1) => {
    try {
      const response = await inventoryAPI.getHistory({ page, limit: 50 });
      if (response.data.success) {
        setHistory(response.data.history);
        setHistoryPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch inventory history:', error);
    }
  };

  // Fetch inventory statistics
  const fetchStatistics = async () => {
    try {
      const response = await inventoryAPI.getStatistics({ period });
      if (response.data.success) {
        setChartData(response.data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  useEffect(() => {
    fetchInventoryOverview();
    fetchLowStockAlerts();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchInventoryHistory();
    } else if (activeTab === 'analytics') {
      fetchStatistics();
    }
  }, [activeTab, period]);

  // Handle stock adjustment
  const handleAdjustStock = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !adjustmentForm.size || !adjustmentForm.color || !adjustmentForm.adjustment) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await inventoryAPI.adjustStock({
        productId: selectedProduct._id,
        ...adjustmentForm,
        adjustment: parseInt(adjustmentForm.adjustment)
      });

      if (response.data.success) {
        alert('Stock adjusted successfully');
        setAdjustmentModal(false);
        setAdjustmentForm({
          size: '',
          color: '',
          adjustment: '',
          reason: '',
          notes: '',
          adjustmentType: 'manual'
        });
        setSelectedProduct(null);
        fetchInventoryOverview();
        fetchLowStockAlerts();
      }
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      alert(error.response?.data?.message || 'Failed to adjust stock');
    }
  };

  // Handle reorder
  const handleCreateReorder = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }

    try {
      const response = await inventoryAPI.createReorder({
        productId: selectedProduct._id,
        ...reorderForm,
        quantity: reorderForm.quantity ? parseInt(reorderForm.quantity) : undefined
      });

      if (response.data.success) {
        alert(response.data.message);
        setReorderModal(false);
        setReorderForm({
          size: '',
          color: '',
          quantity: '',
          notes: ''
        });
        setSelectedProduct(null);
        fetchInventoryOverview();
        fetchLowStockAlerts();
      }
    } catch (error) {
      console.error('Failed to create reorder:', error);
      alert(error.response?.data?.message || 'Failed to create reorder');
    }
  };

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return '#4caf50';
      case 'Low Stock': return '#ff9800';
      case 'Out of Stock': return '#f44336';
      case 'Reorder': return '#2196f3';
      default: return '#757575';
    }
  };

  // Get alert type color
  const getAlertColor = (alertType) => {
    switch (alertType) {
      case 'critical': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#757575';
    }
  };

  // Styles
  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    statLabel: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '8px'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#ec4899'
    },
    statSubtext: {
      fontSize: '12px',
      color: '#999',
      marginTop: '4px'
    },
    tabContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    tabHeader: {
      display: 'flex',
      borderBottom: '2px solid #f0f0f0',
      padding: '0'
    },
    tab: {
      padding: '16px 24px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#666',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      marginBottom: '-2px',
      transition: 'all 0.3s'
    },
    activeTab: {
      color: '#ec4899',
      borderBottomColor: '#ec4899'
    },
    tabContent: {
      padding: '24px'
    },
    filters: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    searchInput: {
      flex: '1',
      minWidth: '200px',
      padding: '10px 16px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px'
    },
    select: {
      padding: '10px 16px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#ec4899',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    },
    buttonSecondary: {
      padding: '10px 20px',
      backgroundColor: 'white',
      color: '#ec4899',
      border: '2px solid #ec4899',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white'
    },
    th: {
      padding: '12px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '600',
      color: '#666',
      borderBottom: '2px solid #f0f0f0',
      backgroundColor: '#fafafa'
    },
    td: {
      padding: '12px',
      fontSize: '14px',
      borderBottom: '1px solid #f0f0f0'
    },
    productCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    productImage: {
      width: '40px',
      height: '40px',
      objectFit: 'cover',
      borderRadius: '4px',
      backgroundColor: '#f0f0f0'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      color: 'white'
    },
    alertCard: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px',
      borderLeft: '4px solid',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modal: {
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
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalHeader: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    chartContainer: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: '#999'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Inventory Management</h1>
        <p style={styles.subtitle}>Manage stock levels, track inventory, and monitor alerts</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Products</div>
            <div style={styles.statValue}>{statistics.totalProducts}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Stock Items</div>
            <div style={styles.statValue}>{statistics.totalStockItems}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Inventory Value</div>
            <div style={styles.statValue}>₹{statistics.totalInventoryValue.toLocaleString()}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Low Stock Alerts</div>
            <div style={styles.statValue}>{statistics.lowStockCount}</div>
            <div style={styles.statSubtext}>{statistics.outOfStockCount} out of stock</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Needs Reorder</div>
            <div style={styles.statValue}>{statistics.reorderCount}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <div style={styles.tabHeader}>
          <button
            style={{...styles.tab, ...(activeTab === 'overview' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('overview')}
          >
            Inventory Overview
          </button>
          <button
            style={{...styles.tab, ...(activeTab === 'alerts' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('alerts')}
          >
            Low Stock Alerts ({lowStockAlerts.length})
          </button>
          <button
            style={{...styles.tab, ...(activeTab === 'history' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('history')}
          >
            Inventory History
          </button>
          <button
            style={{...styles.tab, ...(activeTab === 'analytics' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        <div style={styles.tabContent}>
          {/* Inventory Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div style={styles.filters}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={styles.select}
                >
                  <option value="all">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Reorder">Needs Reorder</option>
                </select>
              </div>

              {loading ? (
                <div style={styles.emptyState}>Loading inventory...</div>
              ) : filteredInventory.length === 0 ? (
                <div style={styles.emptyState}>No products found</div>
              ) : (
                <div style={{overflowX: 'auto'}}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Product</th>
                        <th style={styles.th}>Brand</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Total Stock</th>
                        <th style={styles.th}>Stock Value</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item) => (
                        <tr key={item._id}>
                          <td style={styles.td}>
                            <div style={styles.productCell}>
                              <img
                                src={item.image || '/placeholder.png'}
                                alt={item.name}
                                style={styles.productImage}
                              />
                              <div>
                                <div style={{fontWeight: '500'}}>{item.name}</div>
                                <div style={{fontSize: '12px', color: '#999'}}>
                                  {item.variants.length} variants
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>{item.brand || '-'}</td>
                          <td style={styles.td}>{item.category}</td>
                          <td style={styles.td}>
                            <strong>{item.totalStock}</strong>
                            <div style={{fontSize: '12px', color: '#999'}}>
                              Threshold: {item.lowStockThreshold}
                            </div>
                          </td>
                          <td style={styles.td}>₹{item.stockValue.toLocaleString()}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.badge,
                              backgroundColor: getStatusColor(item.status)
                            }}>
                              {item.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={{display: 'flex', gap: '8px'}}>
                              <button
                                style={{...styles.buttonSecondary, padding: '6px 12px', fontSize: '12px'}}
                                onClick={() => {
                                  setSelectedProduct(item);
                                  setAdjustmentModal(true);
                                }}
                              >
                                Adjust
                              </button>
                              {(item.status === 'Reorder' || item.status === 'Low Stock' || item.status === 'Out of Stock') && (
                                <button
                                  style={{...styles.button, padding: '6px 12px', fontSize: '12px'}}
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    setReorderModal(true);
                                  }}
                                >
                                  Reorder
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Low Stock Alerts Tab */}
          {activeTab === 'alerts' && (
            <>
              {lowStockAlerts.length === 0 ? (
                <div style={styles.emptyState}>No low stock alerts</div>
              ) : (
                <>
                  {lowStockAlerts.map((alert) => (
                    <div
                      key={alert._id}
                      style={{
                        ...styles.alertCard,
                        borderLeftColor: getAlertColor(alert.alertType)
                      }}
                    >
                      <div style={{flex: 1}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                          <img
                            src={alert.image || '/placeholder.png'}
                            alt={alert.name}
                            style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}}
                          />
                          <div>
                            <div style={{fontWeight: '600', fontSize: '16px'}}>{alert.name}</div>
                            <div style={{fontSize: '12px', color: '#666'}}>
                              {alert.brand} • {alert.category}
                            </div>
                          </div>
                        </div>
                        <div style={{fontSize: '14px', color: '#666', marginLeft: '62px'}}>
                          <div>Total Stock: <strong>{alert.totalStock}</strong> units</div>
                          <div>Status: <strong style={{color: getAlertColor(alert.alertType)}}>{alert.status}</strong></div>
                          {alert.variants.length > 0 && (
                            <div style={{marginTop: '8px'}}>
                              <strong>Low stock variants:</strong>
                              {alert.variants.map((v, idx) => (
                                <div key={idx} style={{fontSize: '12px', marginLeft: '12px'}}>
                                  • {v.size} / {v.color}: {v.quantity} units
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <button
                          style={{...styles.buttonSecondary, padding: '8px 16px', fontSize: '12px'}}
                          onClick={() => {
                            setSelectedProduct(alert);
                            setAdjustmentModal(true);
                          }}
                        >
                          Adjust Stock
                        </button>
                        <button
                          style={{...styles.button, padding: '8px 16px', fontSize: '12px'}}
                          onClick={() => {
                            setSelectedProduct(alert);
                            setReorderModal(true);
                          }}
                        >
                          Create Reorder
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* Inventory History Tab */}
          {activeTab === 'history' && (
            <>
              {history.length === 0 ? (
                <div style={styles.emptyState}>No inventory history</div>
              ) : (
                <div style={{overflowX: 'auto'}}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Product</th>
                        <th style={styles.th}>Variant</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Previous</th>
                        <th style={styles.th}>Change</th>
                        <th style={styles.th}>New Qty</th>
                        <th style={styles.th}>Reason</th>
                        <th style={styles.th}>Adjusted By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item._id}>
                          <td style={styles.td}>
                            {new Date(item.createdAt).toLocaleDateString()}<br/>
                            <span style={{fontSize: '12px', color: '#999'}}>
                              {new Date(item.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={{fontWeight: '500'}}>{item.productName}</div>
                          </td>
                          <td style={styles.td}>
                            <div style={{fontSize: '12px'}}>
                              {item.size} / {item.color}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.badge,
                              backgroundColor: item.adjustmentType === 'sale' ? '#f44336' :
                                             item.adjustmentType === 'reorder' ? '#4caf50' :
                                             item.adjustmentType === 'return' ? '#2196f3' :
                                             '#757575'
                            }}>
                              {item.adjustmentType}
                            </span>
                          </td>
                          <td style={styles.td}>{item.previousQuantity}</td>
                          <td style={styles.td}>
                            <span style={{
                              color: item.adjustmentQuantity > 0 ? '#4caf50' : '#f44336',
                              fontWeight: '600'
                            }}>
                              {item.adjustmentQuantity > 0 ? '+' : ''}{item.adjustmentQuantity}
                            </span>
                          </td>
                          <td style={styles.td}><strong>{item.newQuantity}</strong></td>
                          <td style={styles.td}>{item.reason || '-'}</td>
                          <td style={styles.td}>
                            <div style={{fontSize: '12px'}}>{item.adjustedByName}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {historyPagination && historyPagination.totalPages > 1 && (
                    <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px'}}>
                      {Array.from({length: historyPagination.totalPages}, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          style={{
                            ...styles.button,
                            padding: '8px 12px',
                            backgroundColor: page === historyPagination.currentPage ? '#ec4899' : '#ddd',
                            color: page === historyPagination.currentPage ? 'white' : '#333'
                          }}
                          onClick={() => fetchInventoryHistory(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <>
              <div style={styles.filters}>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  style={styles.select}
                >
                  <option value="24hours">Last 24 Hours</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                </select>
              </div>

              {chartData ? (
                <>
                  {/* Adjustments by Type */}
                  <div style={styles.chartContainer}>
                    <h3 style={{marginBottom: '16px', fontSize: '18px'}}>Adjustments by Type</h3>
                    {chartData.adjustmentsByType.length === 0 ? (
                      <div style={styles.emptyState}>No adjustments in this period</div>
                    ) : (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        {chartData.adjustmentsByType.map((item) => (
                          <div key={item._id} style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <div style={{width: '120px', fontWeight: '500'}}>{item._id}</div>
                            <div style={{flex: 1, backgroundColor: '#f0f0f0', height: '30px', borderRadius: '4px', position: 'relative'}}>
                              <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                height: '100%',
                                backgroundColor: '#ec4899',
                                width: `${(item.count / Math.max(...chartData.adjustmentsByType.map(x => x.count))) * 100}%`,
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: '12px',
                                color: 'white',
                                fontWeight: '600'
                              }}>
                                {item.count}
                              </div>
                            </div>
                            <div style={{width: '100px', textAlign: 'right', color: '#666'}}>
                              {item.totalAdjustment > 0 ? '+' : ''}{item.totalAdjustment} units
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Daily Trend */}
                  <div style={styles.chartContainer}>
                    <h3 style={{marginBottom: '16px', fontSize: '18px'}}>Daily Trend</h3>
                    {chartData.dailyTrend.length === 0 ? (
                      <div style={styles.emptyState}>No data available</div>
                    ) : (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {chartData.dailyTrend.map((item) => (
                          <div key={item._id} style={{display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px'}}>
                            <span style={{fontWeight: '500'}}>{item._id}</span>
                            <span>{item.adjustments} adjustments</span>
                            <span style={{color: item.totalChange >= 0 ? '#4caf50' : '#f44336', fontWeight: '600'}}>
                              {item.totalChange > 0 ? '+' : ''}{item.totalChange} units
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top Adjusted Products */}
                  <div style={styles.chartContainer}>
                    <h3 style={{marginBottom: '16px', fontSize: '18px'}}>Most Adjusted Products</h3>
                    {chartData.topAdjustedProducts.length === 0 ? (
                      <div style={styles.emptyState}>No data available</div>
                    ) : (
                      <div style={{overflowX: 'auto'}}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>Product</th>
                              <th style={styles.th}>Adjustments</th>
                              <th style={styles.th}>Total Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {chartData.topAdjustedProducts.map((item) => (
                              <tr key={item._id}>
                                <td style={styles.td}>{item.productName}</td>
                                <td style={styles.td}>{item.adjustmentCount}</td>
                                <td style={styles.td}>
                                  <span style={{
                                    color: item.totalChange >= 0 ? '#4caf50' : '#f44336',
                                    fontWeight: '600'
                                  }}>
                                    {item.totalChange > 0 ? '+' : ''}{item.totalChange}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={styles.emptyState}>Loading analytics...</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustmentModal && selectedProduct && (
        <div style={styles.modal} onClick={() => setAdjustmentModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalHeader}>Adjust Stock - {selectedProduct.name}</h2>
            <form onSubmit={handleAdjustStock}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Variant (Size / Color) *</label>
                <select
                  style={styles.input}
                  value={`${adjustmentForm.size}|${adjustmentForm.color}`}
                  onChange={(e) => {
                    const [size, color] = e.target.value.split('|');
                    setAdjustmentForm({...adjustmentForm, size, color});
                  }}
                  required
                >
                  <option value="|">Select variant</option>
                  {selectedProduct.variants?.map((v, idx) => (
                    <option key={idx} value={`${v.size}|${v.color}`}>
                      {v.size} / {v.color} (Current: {v.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Adjustment Type *</label>
                <select
                  style={styles.input}
                  value={adjustmentForm.adjustmentType}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, adjustmentType: e.target.value})}
                  required
                >
                  <option value="manual">Manual Adjustment</option>
                  <option value="return">Customer Return</option>
                  <option value="damage">Damage/Loss</option>
                  <option value="correction">Stock Correction</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Adjustment Quantity * (use + or -)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={adjustmentForm.adjustment}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, adjustment: e.target.value})}
                  placeholder="e.g., +10 or -5"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Reason</label>
                <input
                  type="text"
                  style={styles.input}
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, reason: e.target.value})}
                  placeholder="Brief reason for adjustment"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  style={styles.textarea}
                  value={adjustmentForm.notes}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </div>

              <div style={styles.modalActions}>
                <button type="submit" style={styles.button}>
                  Adjust Stock
                </button>
                <button
                  type="button"
                  style={styles.buttonSecondary}
                  onClick={() => {
                    setAdjustmentModal(false);
                    setAdjustmentForm({
                      size: '',
                      color: '',
                      adjustment: '',
                      reason: '',
                      notes: '',
                      adjustmentType: 'manual'
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reorder Modal */}
      {reorderModal && selectedProduct && (
        <div style={styles.modal} onClick={() => setReorderModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalHeader}>Create Reorder - {selectedProduct.name}</h2>
            <form onSubmit={handleCreateReorder}>
              <div style={{marginBottom: '16px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '6px'}}>
                <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Default Reorder Quantity</div>
                <div style={{fontSize: '18px', fontWeight: 'bold', color: '#ec4899'}}>
                  {selectedProduct.reorderQuantity || 50} units
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Variant (Optional - leave empty to reorder all low stock variants)</label>
                <select
                  style={styles.input}
                  value={`${reorderForm.size}|${reorderForm.color}`}
                  onChange={(e) => {
                    const [size, color] = e.target.value.split('|');
                    setReorderForm({...reorderForm, size, color});
                  }}
                >
                  <option value="|">All low stock variants</option>
                  {selectedProduct.variants?.map((v, idx) => (
                    <option key={idx} value={`${v.size}|${v.color}`}>
                      {v.size} / {v.color} (Current: {v.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Custom Quantity (Optional - uses default if empty)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={reorderForm.quantity}
                  onChange={(e) => setReorderForm({...reorderForm, quantity: e.target.value})}
                  placeholder={`Default: ${selectedProduct.reorderQuantity || 50}`}
                  min="1"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  style={styles.textarea}
                  value={reorderForm.notes}
                  onChange={(e) => setReorderForm({...reorderForm, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </div>

              <div style={styles.modalActions}>
                <button type="submit" style={styles.button}>
                  Create Reorder
                </button>
                <button
                  type="button"
                  style={styles.buttonSecondary}
                  onClick={() => {
                    setReorderModal(false);
                    setReorderForm({
                      size: '',
                      color: '',
                      quantity: '',
                      notes: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
