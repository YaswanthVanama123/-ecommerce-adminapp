import React, { useState, useEffect, useRef } from 'react';
import { analyticsAPI, ordersAPI } from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import RevenueChart from '../components/charts/RevenueChart';
import OrdersChart from '../components/charts/OrdersChart';
import SalesChart from '../components/charts/SalesChart';
import CategoryChart from '../components/charts/CategoryChart';
import CustomerGrowthChart from '../components/charts/CustomerGrowthChart';

const EnhancedDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const refreshInterval = useRef(null);

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // Animated stats
  const [animatedStats, setAnimatedStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  const animationFrameRef = useRef(null);

  // Fetch all dashboard data
  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const { startDate, endDate } = dateRange;

      // Fetch all analytics data in parallel
      const [
        dashboardRes,
        revenueRes,
        salesRes,
        ordersRes,
        customersRes,
      ] = await Promise.all([
        analyticsAPI.getDashboard({ startDate, endDate }),
        analyticsAPI.getRevenue({ startDate, endDate, groupBy: 'day' }),
        analyticsAPI.getSales({ startDate, endDate, groupBy: 'day' }),
        analyticsAPI.getOrders({ startDate, endDate, groupBy: 'day' }),
        analyticsAPI.getCustomers({ startDate, endDate, groupBy: 'day' }),
      ]);

      // Process dashboard data
      if (dashboardRes.data?.success) {
        const data = dashboardRes.data.data;
        setDashboardData(data);

        // Set stats for animation
        setAnimatedStats({
          totalOrders: data.overview?.totalOrders || 0,
          totalRevenue: data.overview?.totalRevenue || 0,
          pendingOrders: data.orderStats?.pending || 0,
          completedOrders: data.orderStats?.completed || 0,
        });

        // Set category data
        setCategoryData(data.revenueByCategory || []);

        // Set recent orders
        setRecentOrders(data.recentOrders || []);
      }

      // Process revenue data
      if (revenueRes.data?.success) {
        const formattedRevenue = (revenueRes.data.data?.timeSeries || []).map((item) => ({
          date: formatChartDate(item._id),
          revenue: item.totalRevenue || 0,
        }));
        setRevenueData(formattedRevenue);
      }

      // Process sales data
      if (salesRes.data?.success) {
        const formattedSales = (salesRes.data.data || []).map((item) => ({
          date: formatChartDate(item._id),
          totalSales: item.totalSales || 0,
          orderCount: item.orderCount || 0,
        }));
        setSalesData(formattedSales);
      }

      // Process orders data
      if (ordersRes.data?.success) {
        const formattedOrders = (ordersRes.data.data?.trends || []).map((item) => ({
          date: formatChartDate(item._id),
          orders: item.totalOrders || 0,
        }));
        setOrdersData(formattedOrders);
      }

      // Process customer data
      if (customersRes.data?.success) {
        const formattedCustomers = (customersRes.data.data?.growth || []).map((item) => ({
          date: formatChartDate(item._id),
          newCustomers: item.newCustomers || 0,
        }));
        setCustomerData(formattedCustomers);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Format date for chart labels
  const formatChartDate = (dateObj) => {
    if (!dateObj) return '';

    if (dateObj.day) {
      return `${dateObj.month}/${dateObj.day}`;
    } else if (dateObj.week) {
      return `Week ${dateObj.week}`;
    } else if (dateObj.month) {
      return `${dateObj.month}/${dateObj.year}`;
    }
    return '';
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  // Setup auto-refresh every 30 seconds
  useEffect(() => {
    refreshInterval.current = setInterval(() => {
      fetchDashboardData(false);
    }, 30000);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [dateRange]);

  // Animate stats counters
  useEffect(() => {
    if (!dashboardData) return;

    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const stats = {
      totalOrders: dashboardData.overview?.totalOrders || 0,
      totalRevenue: dashboardData.overview?.totalRevenue || 0,
      pendingOrders: dashboardData.orderStats?.pending || 0,
      completedOrders: dashboardData.orderStats?.completed || 0,
    };

    const animate = () => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        totalOrders: Math.floor(stats.totalOrders * easeOutQuart),
        totalRevenue: stats.totalRevenue * easeOutQuart,
        pendingOrders: Math.floor(stats.pendingOrders * easeOutQuart),
        completedOrders: Math.floor(stats.completedOrders * easeOutQuart),
      });

      if (currentStep < steps) {
        animationFrameRef.current = setTimeout(animate, stepDuration);
      }
    };

    if (!loading) {
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        clearTimeout(animationFrameRef.current);
      }
    };
  }, [dashboardData, loading]);

  // Export data to CSV
  const exportToCSV = () => {
    try {
      let csvContent = 'Dashboard Statistics\n\n';

      // Overview
      csvContent += 'Overview\n';
      csvContent += 'Total Orders,' + (dashboardData?.overview?.totalOrders || 0) + '\n';
      csvContent += 'Total Revenue,' + (dashboardData?.overview?.totalRevenue || 0).toFixed(2) + '\n';
      csvContent += 'Avg Order Value,' + (dashboardData?.overview?.avgOrderValue || 0).toFixed(2) + '\n';
      csvContent += '\n';

      // Order Stats
      csvContent += 'Order Statistics\n';
      csvContent += 'Pending,' + (dashboardData?.orderStats?.pending || 0) + '\n';
      csvContent += 'Processing,' + (dashboardData?.orderStats?.processing || 0) + '\n';
      csvContent += 'Completed,' + (dashboardData?.orderStats?.completed || 0) + '\n';
      csvContent += 'Cancelled,' + (dashboardData?.orderStats?.cancelled || 0) + '\n';
      csvContent += '\n';

      // Revenue Data
      csvContent += 'Revenue Trend\n';
      csvContent += 'Date,Revenue\n';
      revenueData.forEach((item) => {
        csvContent += `${item.date},${item.revenue}\n`;
      });

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Dashboard data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  // Handle date range change
  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '6px 14px',
      display: 'inline-flex',
      fontSize: '0.8125rem',
      lineHeight: '1.4',
      fontWeight: '600',
      borderRadius: '8px',
      textTransform: 'capitalize',
      letterSpacing: '0.3px',
    };

    switch (status) {
      case 'completed':
      case 'delivered':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          color: '#065f46',
          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.15)',
        };
      case 'pending':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          color: '#92400e',
          boxShadow: '0 2px 4px rgba(245, 158, 11, 0.15)',
        };
      case 'processing':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          color: '#1e40af',
          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.15)',
        };
      default:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          color: '#991b1b',
          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.15)',
        };
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '32px',
          background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
          minHeight: '100vh',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header Skeleton */}
          <div
            style={{
              marginBottom: '40px',
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              borderRadius: '20px',
              padding: '32px 40px',
              boxShadow: '0 20px 60px rgba(236, 72, 153, 0.4)',
            }}
          >
            <div
              style={{
                width: '300px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                marginBottom: '12px',
              }}
            ></div>
            <div
              style={{
                width: '400px',
                height: '18px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
              }}
            ></div>
          </div>

          {/* Loading spinner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                border: '4px solid #fce7f3',
                borderTopColor: '#ec4899',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '32px',
        background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
        minHeight: '100vh',
      }}
      className="dashboard-container"
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <div
          style={{
            marginBottom: '40px',
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            borderRadius: '20px',
            padding: '32px 40px',
            boxShadow: '0 20px 60px rgba(236, 72, 153, 0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              filter: 'blur(60px)',
            }}
          ></div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.5px',
                }}
              >
                Analytics Dashboard
              </h1>
              <p
                style={{
                  fontSize: '1.125rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0,
                  fontWeight: '400',
                }}
              >
                Real-time insights and statistics
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => fetchDashboardData(false)}
                disabled={refreshing}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  opacity: refreshing ? 0.6 : 1,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  }}
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={exportToCSV}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px 32px',
            marginBottom: '32px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <label
              style={{
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: '#1e293b',
              }}
            >
              Start Date:
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              max={dateRange.endDate}
              style={{
                padding: '8px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: '500',
                color: '#1e293b',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <label
              style={{
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: '#1e293b',
              }}
            >
              End Date:
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              min={dateRange.startDate}
              max={new Date().toISOString().split('T')[0]}
              style={{
                padding: '8px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: '500',
                color: '#1e293b',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div
          className="stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {/* Total Orders Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid rgba(236, 72, 153, 0.1)',
            }}
            className="stat-card"
          >
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                borderRadius: '50%',
                opacity: '0.1',
              }}
            ></div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(236, 72, 153, 0.3)',
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div
                style={{
                  background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#be185d',
                }}
              >
                Total
              </div>
            </div>
            <h3
              style={{
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '600',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Total Orders
            </h3>
            <p
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                margin: '0 0 12px 0',
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {animatedStats.totalOrders}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#ec4899',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span>View all orders</span>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid rgba(16, 185, 129, 0.1)',
            }}
            className="stat-card"
          >
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                opacity: '0.1',
              }}
            ></div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div
                style={{
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#065f46',
                }}
              >
                Revenue
              </div>
            </div>
            <h3
              style={{
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '600',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Total Revenue
            </h3>
            <p
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                margin: '0 0 12px 0',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ${animatedStats.totalRevenue.toFixed(2)}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#10b981',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span>All time earnings</span>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid rgba(245, 158, 11, 0.1)',
            }}
            className="stat-card"
          >
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '50%',
                opacity: '0.1',
              }}
            ></div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#92400e',
                }}
              >
                Pending
              </div>
            </div>
            <h3
              style={{
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '600',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Pending Orders
            </h3>
            <p
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                margin: '0 0 12px 0',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {animatedStats.pendingOrders}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#f59e0b',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Requires attention</span>
            </div>
          </div>

          {/* Completed Orders Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
            }}
            className="stat-card"
          >
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '50%',
                opacity: '0.1',
              }}
            ></div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)',
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div
                style={{
                  background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6b21a8',
                }}
              >
                Success
              </div>
            </div>
            <h3
              style={{
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '600',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Completed Orders
            </h3>
            <p
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                margin: '0 0 12px 0',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {animatedStats.completedOrders}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#10b981',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span>Successfully delivered</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
          className="charts-grid"
        >
          {/* Revenue Chart */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '28px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: '0 0 6px 0',
                    color: '#1e293b',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Revenue Trend
                </h2>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    margin: 0,
                    fontWeight: '500',
                  }}
                >
                  Daily revenue performance
                </p>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 12px rgba(236, 72, 153, 0.3)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
            </div>
            <RevenueChart data={revenueData} loading={false} />
          </div>

          {/* Orders Chart */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '28px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: '0 0 6px 0',
                    color: '#1e293b',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Orders Volume
                </h2>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    margin: 0,
                    fontWeight: '500',
                  }}
                >
                  Daily order distribution
                </p>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
            </div>
            <OrdersChart data={ordersData} loading={false} />
          </div>

          {/* Sales Chart */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '28px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: '0 0 6px 0',
                    color: '#1e293b',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Sales Performance
                </h2>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    margin: 0,
                    fontWeight: '500',
                  }}
                >
                  Sales trends over time
                </p>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 12px rgba(59, 130, 246, 0.3)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
            <SalesChart data={salesData} loading={false} />
          </div>

          {/* Category Performance Chart */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '28px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: '0 0 6px 0',
                    color: '#1e293b',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Category Performance
                </h2>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    margin: 0,
                    fontWeight: '500',
                  }}
                >
                  Revenue by category
                </p>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 12px rgba(139, 92, 246, 0.3)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
            </div>
            <CategoryChart data={categoryData} loading={false} />
          </div>
        </div>

        {/* Customer Growth Chart */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  margin: '0 0 6px 0',
                  color: '#1e293b',
                  letterSpacing: '-0.5px',
                }}
              >
                Customer Growth
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0,
                  fontWeight: '500',
                }}
              >
                New customer acquisition over time
              </p>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 12px rgba(245, 158, 11, 0.3)',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <CustomerGrowthChart data={customerData} loading={false} />
        </div>

        {/* Recent Orders Table */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  margin: '0 0 6px 0',
                  color: '#1e293b',
                  letterSpacing: '-0.5px',
                }}
              >
                Recent Orders
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0,
                  fontWeight: '500',
                }}
              >
                Latest customer transactions
              </p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>View All</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <div
            style={{
              overflowX: 'auto',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                }}
              >
                <tr>
                  <th
                    style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}
                  >
                    Order ID
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}
                  >
                    Customer
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody style={{ background: '#ffffff' }}>
                {recentOrders.map((order, index) => (
                  <tr
                    key={order._id}
                    style={{
                      borderBottom: index !== recentOrders.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                    className="table-row"
                  >
                    <td
                      style={{
                        padding: '20px 24px',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: '#ec4899',
                      }}
                    >
                      #{order._id?.slice(-6)}
                    </td>
                    <td
                      style={{
                        padding: '20px 24px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                          }}
                        >
                          {(order.user?.name || order.shippingAddress?.fullName || 'N/A')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: '0.9375rem',
                              fontWeight: '600',
                              color: '#1e293b',
                            }}
                          >
                            {order.user?.name || order.shippingAddress?.fullName || 'N/A'}
                          </div>
                          <div
                            style={{
                              fontSize: '0.8125rem',
                              color: '#64748b',
                              marginTop: '2px',
                            }}
                          >
                            {order.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '20px 24px',
                        fontSize: '0.9375rem',
                        fontWeight: '700',
                        color: '#10b981',
                      }}
                    >
                      ${order.total?.toFixed(2) || '0.00'}
                    </td>
                    <td
                      style={{
                        padding: '20px 24px',
                      }}
                    >
                      <span style={getStatusStyle(order.status)}>{order.status}</span>
                    </td>
                    <td
                      style={{
                        padding: '20px 24px',
                        fontSize: '0.875rem',
                        color: '#64748b',
                        fontWeight: '500',
                      }}
                    >
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <h3
                  style={{
                    color: '#64748b',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    margin: '0 0 8px 0',
                  }}
                >
                  No orders yet
                </h3>
                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    margin: 0,
                  }}
                >
                  Orders will appear here once customers make purchases
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .stat-card {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }

        .stat-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
        }

        .table-row:hover {
          background: #f8fafc !important;
          transform: scale(1.01);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .charts-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-container {
            padding: 16px !important;
          }
        }

        @media (min-width: 641px) and (max-width: 1023px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .charts-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (min-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
          .charts-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          table {
            font-size: 0.875rem;
          }
          th,
          td {
            padding: 12px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedDashboard;
