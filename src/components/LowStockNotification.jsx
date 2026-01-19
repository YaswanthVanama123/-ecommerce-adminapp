import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../api';
import { Link } from 'react-router-dom';

const LowStockNotification = () => {
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch low stock alerts
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getLowStockAlerts();
      if (response.data.success) {
        setAlerts(response.data.alerts);
      }
    } catch (error) {
      console.error('Failed to fetch low stock alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch alerts on mount and set interval for auto-refresh
  useEffect(() => {
    fetchAlerts();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchAlerts();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  // Get alert count by priority
  const criticalCount = alerts.filter(a => a.alertType === 'critical').length;
  const warningCount = alerts.filter(a => a.alertType === 'warning').length;

  const styles = {
    container: {
      position: 'relative'
    },
    button: {
      position: 'relative',
      padding: '8px 12px',
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    icon: {
      width: '20px',
      height: '20px',
      color: alerts.length > 0 ? '#f59e0b' : '#64748b'
    },
    badge: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      backgroundColor: criticalCount > 0 ? '#dc2626' : '#f59e0b',
      color: 'white',
      fontSize: '11px',
      fontWeight: '600',
      padding: '2px 6px',
      borderRadius: '10px',
      minWidth: '20px',
      textAlign: 'center'
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      width: '380px',
      maxHeight: '500px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      border: '1px solid #e2e8f0',
      zIndex: 1000,
      overflow: 'hidden',
      display: showNotifications ? 'block' : 'none'
    },
    header: {
      padding: '16px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#0f172a'
    },
    count: {
      fontSize: '12px',
      color: '#64748b',
      marginLeft: '8px'
    },
    content: {
      maxHeight: '400px',
      overflowY: 'auto'
    },
    alertItem: {
      padding: '12px 16px',
      borderBottom: '1px solid #f1f5f9',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    },
    alertDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginTop: '6px',
      flexShrink: 0
    },
    alertContent: {
      flex: 1,
      minWidth: 0
    },
    alertName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    alertDetails: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px'
    },
    alertStock: {
      fontSize: '12px',
      fontWeight: '600'
    },
    emptyState: {
      padding: '40px 20px',
      textAlign: 'center',
      color: '#64748b'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '12px',
      opacity: 0.5
    },
    footer: {
      padding: '12px 16px',
      borderTop: '1px solid #e2e8f0',
      textAlign: 'center'
    },
    viewAllLink: {
      display: 'inline-block',
      padding: '8px 16px',
      backgroundColor: '#ec4899',
      color: 'white',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'background-color 0.2s'
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
      display: showNotifications ? 'block' : 'none'
    }
  };

  const getAlertColor = (alertType) => {
    switch (alertType) {
      case 'critical': return '#dc2626';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#64748b';
    }
  };

  return (
    <>
      {/* Overlay to close dropdown when clicking outside */}
      <div
        style={styles.overlay}
        onClick={() => setShowNotifications(false)}
      />

      <div style={styles.container}>
        <button
          style={styles.button}
          onClick={() => setShowNotifications(!showNotifications)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          {/* Bell Icon */}
          <svg
            style={styles.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          {alerts.length > 0 && (
            <span style={styles.badge}>
              {alerts.length}
            </span>
          )}
        </button>

        <div style={styles.dropdown}>
          <div style={styles.header}>
            <div>
              <span style={styles.headerTitle}>Inventory Alerts</span>
              <span style={styles.count}>({alerts.length})</span>
            </div>
            {criticalCount > 0 && (
              <div style={{
                fontSize: '11px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                {criticalCount} Critical
              </div>
            )}
          </div>

          <div style={styles.content}>
            {loading ? (
              <div style={styles.emptyState}>
                <div>Loading alerts...</div>
              </div>
            ) : alerts.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>✓</div>
                <div style={{fontSize: '14px', fontWeight: '600', marginBottom: '4px'}}>
                  All Good!
                </div>
                <div style={{fontSize: '12px'}}>
                  No low stock alerts at this time
                </div>
              </div>
            ) : (
              alerts.slice(0, 10).map((alert) => (
                <Link
                  key={alert._id}
                  to="/inventory"
                  style={{textDecoration: 'none', color: 'inherit'}}
                  onClick={() => setShowNotifications(false)}
                >
                  <div
                    style={styles.alertItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <div
                      style={{
                        ...styles.alertDot,
                        backgroundColor: getAlertColor(alert.alertType)
                      }}
                    />
                    <div style={styles.alertContent}>
                      <div style={styles.alertName}>{alert.name}</div>
                      <div style={styles.alertDetails}>
                        {alert.brand && `${alert.brand} • `}{alert.category}
                      </div>
                      <div style={{
                        ...styles.alertStock,
                        color: getAlertColor(alert.alertType)
                      }}>
                        {alert.status}: {alert.totalStock} units
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {alerts.length > 0 && (
            <div style={styles.footer}>
              <Link
                to="/inventory"
                style={styles.viewAllLink}
                onClick={() => setShowNotifications(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#db2777';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ec4899';
                }}
              >
                View All Alerts
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LowStockNotification;
