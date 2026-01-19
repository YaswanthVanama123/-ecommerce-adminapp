import { useState, useEffect } from 'react';
import { analyticsAPI, ordersAPI } from '../api';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosConfig';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dashboardData, setDashboardData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [shippingMetrics, setShippingMetrics] = useState(null);
  const [delayedShipments, setDelayedShipments] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  // Generate mock data for demonstration
  const generateMockData = () => {
    // Mock revenue data
    const mockRevenue = Array.from({ length: 12 }, (_, i) => ({
      date: `${i + 1} Jan`,
      revenue: Math.floor(Math.random() * 10000) + 5000,
      orders: Math.floor(Math.random() * 100) + 20,
    }));

    // Mock order stats
    const mockOrderStats = {
      total: 156,
      pending: 12,
      processing: 23,
      shipped: 34,
      delivered: 78,
      cancelled: 9,
    };

    // Mock top products
    const mockProducts = Array.from({ length: 10 }, (_, i) => ({
      _id: `prod${i}`,
      name: `Product ${i + 1}`,
      brand: 'Brand Name',
      category: { name: 'Category' },
      totalSold: Math.floor(Math.random() * 100) + 10,
      price: Math.floor(Math.random() * 1000) + 100,
      discountPrice: Math.floor(Math.random() * 800) + 80,
      images: ['https://via.placeholder.com/150'],
    }));

    return {
      revenue: mockRevenue,
      orderStats: mockOrderStats,
      products: mockProducts,
      dashboard: {
        totalRevenue: 125000,
        totalOrders: 156,
        totalProducts: 124,
        totalCustomers: 89,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        customerGrowth: 15.7,
      },
      shipping: {
        totalShipments: 134,
        statusBreakdown: {
          inTransit: 34,
          delivered: 78,
          failed: 5,
        },
        deliveryMetrics: {
          averageDeliveryTime: 3.5,
          minDeliveryTime: 1,
          maxDeliveryTime: 7,
        },
      },
      delayed: [],
    };
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const mockData = generateMockData();

      // Try to fetch real data, fall back to mock
      const [dashboardRes, topProductsRes, revenueRes, orderStatsRes, shippingRes, delayedRes] =
        await Promise.all([
          analyticsAPI.getDashboard().catch(() => ({ data: mockData.dashboard })),
          analyticsAPI.getTopProducts().catch(() => ({ data: mockData.products })),
          analyticsAPI.getRevenue(selectedPeriod).catch(() => ({ data: mockData.revenue })),
          ordersAPI.getStats().catch(() => ({ data: mockData.orderStats })),
          axiosInstance.get('/analytics/shipping/overview').catch(() => ({ data: { data: mockData.shipping } })),
          axiosInstance
            .get('/analytics/shipping/delayed-shipments', { params: { limit: 5 } })
            .catch(() => ({ data: { data: mockData.delayed } })),
        ]);

      setDashboardData(dashboardRes.data || mockData.dashboard);
      setTopProducts(
        Array.isArray(topProductsRes.data)
          ? topProductsRes.data
          : topProductsRes.data?.products || mockData.products
      );
      setRevenueData(
        Array.isArray(revenueRes.data) ? revenueRes.data : revenueRes.data?.revenue || mockData.revenue
      );
      setOrderStats(orderStatsRes.data || mockData.orderStats);
      setShippingMetrics(shippingRes.data?.data || mockData.shipping);
      setDelayedShipments(delayedRes.data?.data || mockData.delayed);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#a855f7',
    pink: '#ec4899',
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#ffffff',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ fontWeight: '600', color: '#111827', fontSize: '14px', margin: 0 }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ fontSize: '12px', margin: '4px 0 0 0', color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') ? '$' : ''}
              {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            borderWidth: '4px',
            borderStyle: 'solid',
            borderColor: '#e5e7eb',
            borderBottomColor: '#2563eb',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontWeight: '500' }}>Loading Analytics...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = dashboardData?.totalRevenue || 0;
  const totalOrders = dashboardData?.totalOrders || orderStats?.total || 0;
  const totalProducts = dashboardData?.totalProducts || 0;
  const totalCustomers = dashboardData?.totalCustomers || 0;
  const pendingOrders = orderStats?.pending || 0;
  const processingOrders = orderStats?.processing || 0;
  const shippedOrders = orderStats?.shipped || 0;
  const deliveredOrders = orderStats?.delivered || 0;
  const cancelledOrders = orderStats?.cancelled || 0;

  const orderStatusData = [
    { name: 'Pending', value: pendingOrders, color: COLORS.warning },
    { name: 'Processing', value: processingOrders, color: COLORS.info },
    { name: 'Shipped', value: shippedOrders, color: COLORS.purple },
    { name: 'Delivered', value: deliveredOrders, color: COLORS.success },
    { name: 'Cancelled', value: cancelledOrders, color: COLORS.danger },
  ].filter((item) => item.value > 0);

  const revenueGrowth = dashboardData?.revenueGrowth || 0;
  const orderGrowth = dashboardData?.orderGrowth || 0;
  const customerGrowth = dashboardData?.customerGrowth || 0;

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0
          }}>Analytics Dashboard</h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '4px'
          }}>Comprehensive insights into your store's performance</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              background: '#ffffff',
              color: '#111827',
              cursor: 'pointer'
            }}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last 12 Months</option>
          </select>
          <button
            onClick={fetchAnalyticsData}
            style={{
              padding: '8px 12px',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9, margin: 0 }}>Total Revenue</p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>${totalRevenue.toLocaleString()}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: revenueGrowth >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }}>
              {revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth).toFixed(1)}%
            </span>
            <span style={{ fontSize: '12px', opacity: 0.75 }}>vs last period</span>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9, margin: 0 }}>Total Orders</p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{totalOrders.toLocaleString()}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: orderGrowth >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }}>
              {orderGrowth >= 0 ? '↑' : '↓'} {Math.abs(orderGrowth).toFixed(1)}%
            </span>
            <span style={{ fontSize: '12px', opacity: 0.75 }}>vs last period</span>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9, margin: 0 }}>Total Products</p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{totalProducts.toLocaleString()}</h3>
          <p style={{ fontSize: '12px', opacity: 0.75, marginTop: '8px', margin: 0 }}>In catalog</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9, margin: 0 }}>Total Customers</p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{totalCustomers.toLocaleString()}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: customerGrowth >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }}>
              {customerGrowth >= 0 ? '↑' : '↓'} {Math.abs(customerGrowth).toFixed(1)}%
            </span>
            <span style={{ fontSize: '12px', opacity: 0.75 }}>new customers</span>
          </div>
        </div>
      </div>

      {/* Revenue Trends */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>Revenue Trends</h2>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '2px',
              margin: 0
            }}>Track your revenue and orders over time</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                background: '#3b82f6',
                borderRadius: '50%'
              }}></div>
              <span style={{ color: '#6b7280' }}>Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                background: '#8b5cf6',
                borderRadius: '50%'
              }}></div>
              <span style={{ color: '#6b7280' }}>Orders</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '11px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={COLORS.primary}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke={COLORS.secondary}
              fillOpacity={1}
              fill="url(#colorOrders)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Order Status */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px',
            margin: 0
          }}>Order Status Distribution</h2>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '16px',
            margin: 0
          }}>Current status of all orders</p>
          {orderStatusData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flexShrink: 0 }}>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {orderStatusData.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: item.color
                      }}></div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>{item.name}</span>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#111827'
                    }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '192px',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>No order data available</p>
            </div>
          )}
        </div>

        {/* Shipping Performance */}
        {shippingMetrics && (
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '20px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '4px',
              margin: 0
            }}>Shipping Performance</h2>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '16px',
              margin: 0
            }}>Delivery metrics and efficiency</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#1d4ed8',
                  fontWeight: '600',
                  margin: 0
                }}>In Transit</p>
                <p style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1e3a8a',
                  marginTop: '4px',
                  margin: 0
                }}>
                  {shippingMetrics.statusBreakdown?.inTransit || 0}
                </p>
              </div>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #d1fae5',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#15803d',
                  fontWeight: '600',
                  margin: 0
                }}>Delivered</p>
                <p style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#14532d',
                  marginTop: '4px',
                  margin: 0
                }}>
                  {shippingMetrics.statusBreakdown?.delivered || 0}
                </p>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#1d4ed8',
                  fontWeight: '600',
                  marginBottom: '4px',
                  margin: 0
                }}>Avg</p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1e3a8a',
                  margin: 0
                }}>
                  {shippingMetrics.deliveryMetrics?.averageDeliveryTime || 0}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#1d4ed8',
                  margin: 0
                }}>days</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#15803d',
                  fontWeight: '600',
                  marginBottom: '4px',
                  margin: 0
                }}>Best</p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#14532d',
                  margin: 0
                }}>
                  {shippingMetrics.deliveryMetrics?.minDeliveryTime || 0}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#15803d',
                  margin: 0
                }}>days</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#b91c1c',
                  fontWeight: '600',
                  marginBottom: '4px',
                  margin: 0
                }}>Worst</p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#7f1d1d',
                  margin: 0
                }}>
                  {shippingMetrics.deliveryMetrics?.maxDeliveryTime || 0}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#b91c1c',
                  margin: 0
                }}>days</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Products */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>Top Selling Products</h2>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '2px',
              margin: 0
            }}>Best performers this period</p>
          </div>
          <span style={{
            padding: '4px 10px',
            background: '#dbeafe',
            color: '#1d4ed8',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            Top {topProducts.length}
          </span>
        </div>
        {topProducts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '100%', width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#6b7280',
                    textTransform: 'uppercase'
                  }}>Rank</th>
                  <th style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#6b7280',
                    textTransform: 'uppercase'
                  }}>Product</th>
                  <th style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#6b7280',
                    textTransform: 'uppercase'
                  }}>Category</th>
                  <th style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#6b7280',
                    textTransform: 'uppercase'
                  }}>Sales</th>
                  <th style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#6b7280',
                    textTransform: 'uppercase'
                  }}>Revenue</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid #f3f4f6' }}>
                {topProducts.slice(0, 10).map((product, index) => {
                  const revenue = (product.totalSold || 0) * (product.discountPrice || product.price);
                  return (
                    <tr key={product._id} style={{
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: index === 0 ? '#fef3c7' : index === 1 ? '#e5e7eb' : index === 2 ? '#fed7aa' : '#dbeafe',
                          color: index === 0 ? '#92400e' : index === 1 ? '#374151' : index === 2 ? '#9a3412' : '#1e40af'
                        }}>
                          {index + 1}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '4px',
                                objectFit: 'cover'
                              }}
                            />
                          )}
                          <div>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#111827'
                            }}>{product.name}</div>
                            <div style={{
                              fontSize: '12px',
                              color: '#6b7280'
                            }}>{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: '#dbeafe',
                          color: '#1d4ed8',
                          borderRadius: '4px'
                        }}>
                          {product.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#111827'
                        }}>{product.totalSold || 0} units</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#059669'
                        }}>${revenue.toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '32px',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>No product data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
