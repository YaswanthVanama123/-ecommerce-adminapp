import React, { useState, useEffect, useRef } from 'react';
import { ordersAPI, analyticsAPI } from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [animatedStats, setAnimatedStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Animate stats counters
  useEffect(() => {
    const duration = 1500; // Animation duration in ms
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

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
  }, [stats, loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch orders stats
      const ordersResponse = await ordersAPI.getAll({ limit: 5, sort: '-createdAt' });

      // Handle different response structures
      let orders = [];
      if (ordersResponse.data?.data?.orders) {
        orders = ordersResponse.data.data.orders;
      } else if (ordersResponse.data?.orders) {
        orders = ordersResponse.data.orders;
      } else if (Array.isArray(ordersResponse.data?.data)) {
        orders = ordersResponse.data.data;
      } else if (Array.isArray(ordersResponse.data)) {
        orders = ordersResponse.data;
      }

      // Calculate stats
      const allOrdersResponse = await ordersAPI.getAll();

      // Handle different response structures for all orders
      let allOrders = [];
      if (allOrdersResponse.data?.data?.orders) {
        allOrders = allOrdersResponse.data.data.orders;
      } else if (allOrdersResponse.data?.orders) {
        allOrders = allOrdersResponse.data.orders;
      } else if (Array.isArray(allOrdersResponse.data?.data)) {
        allOrders = allOrdersResponse.data.data;
      } else if (Array.isArray(allOrdersResponse.data)) {
        allOrders = allOrdersResponse.data;
      }

      // Ensure allOrders is an array
      if (!Array.isArray(allOrders)) {
        console.warn('allOrders is not an array:', allOrders);
        allOrders = [];
      }

      const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = allOrders.filter((o) => o.status === 'pending').length;
      const completedOrders = allOrders.filter((o) => o.status === 'completed').length;

      setStats({
        totalOrders: allOrders.length,
        totalRevenue,
        pendingOrders,
        completedOrders,
      });

      setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);

      // Generate revenue data for last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayOrders = allOrders.filter((order) => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate === dateStr;
        });

        const revenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        last7Days.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: revenue,
          orders: dayOrders.length,
        });
      }

      setRevenueData(last7Days);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label, valuePrefix = '', valueSuffix = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          padding: '16px 20px',
          backdropFilter: 'blur(10px)',
        }}>
          <p style={{
            color: '#1e293b',
            fontWeight: '700',
            marginBottom: '8px',
            fontSize: '0.9375rem',
          }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{
              color: entry.color,
              fontWeight: '600',
              margin: '4px 0',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: entry.color,
                display: 'inline-block',
              }}></span>
              {entry.name}: {valuePrefix}{entry.value}{valueSuffix}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading Skeleton Components
  const StatCardSkeleton = () => (
    <div style={{
      background: '#ffffff',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '16px',
        }}></div>
        <div style={{
          width: '80px',
          height: '28px',
          background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '8px',
        }}></div>
      </div>
      <div style={{
        width: '120px',
        height: '14px',
        background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '4px',
        marginBottom: '12px',
      }}></div>
      <div style={{
        width: '100px',
        height: '40px',
        background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '8px',
        marginBottom: '16px',
      }}></div>
      <div style={{
        width: '140px',
        height: '14px',
        background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '4px',
      }}></div>
    </div>
  );

  const ChartSkeleton = () => (
    <div style={{
      background: '#ffffff',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}>
        <div>
          <div style={{
            width: '180px',
            height: '24px',
            background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '6px',
            marginBottom: '8px',
          }}></div>
          <div style={{
            width: '140px',
            height: '14px',
            background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px',
          }}></div>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '12px',
        }}></div>
      </div>
      <div style={{
        width: '100%',
        height: '320px',
        background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '12px',
      }}></div>
    </div>
  );

  const TableSkeleton = () => (
    <div style={{
      background: '#ffffff',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}>
        <div>
          <div style={{
            width: '180px',
            height: '24px',
            background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '6px',
            marginBottom: '8px',
          }}></div>
          <div style={{
            width: '200px',
            height: '14px',
            background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px',
          }}></div>
        </div>
        <div style={{
          width: '100px',
          height: '40px',
          background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '10px',
        }}></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            width: '100%',
            height: '60px',
            background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '12px',
          }}></div>
        ))}
      </div>
    </div>
  );

  const QuickActionsSkeleton = () => (
    <div style={{
      background: '#ffffff',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{
        width: '180px',
        height: '24px',
        background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '6px',
        marginBottom: '24px',
      }}></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            width: '100%',
            height: '120px',
            background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '16px',
          }}></div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{
        padding: '32px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header Section */}
          <div style={{
            marginBottom: '40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '32px 40px',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
          }}>
            <div style={{
              width: '300px',
              height: '32px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              marginBottom: '12px',
            }}></div>
            <div style={{
              width: '400px',
              height: '18px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
            }}></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Quick Actions Skeleton */}
          <div style={{ marginBottom: '40px' }}>
            <QuickActionsSkeleton />
          </div>

          {/* Charts Grid Skeleton */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}>
            <ChartSkeleton />
            <ChartSkeleton />
          </div>

          {/* Table Skeleton */}
          <TableSkeleton />
        </div>

        <style>{`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      padding: '32px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
    }}
    className="dashboard-container"
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{
          marginBottom: '40px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '32px 40px',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}></div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#ffffff',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
            position: 'relative',
            zIndex: 1,
          }}>
            Dashboard Overview
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            fontWeight: '400',
            position: 'relative',
            zIndex: 1,
          }}>
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}>
          {/* Total Orders Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
          }}
          className="stat-card"
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '50%',
              opacity: '0.1',
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#1e40af',
              }}>
                All Time
              </div>
            </div>
            <h3 style={{
              color: '#64748b',
              fontSize: '0.875rem',
              fontWeight: '600',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Total Orders
            </h3>
            <p style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {animatedStats.totalOrders}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#10b981',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span>View all orders</span>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div style={{
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
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              opacity: '0.1',
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#065f46',
              }}>
                Revenue
              </div>
            </div>
            <h3 style={{
              color: '#64748b',
              fontSize: '0.875rem',
              fontWeight: '600',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Total Revenue
            </h3>
            <p style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              ${animatedStats.totalRevenue.toFixed(2)}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#10b981',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span>+12.5% from last month</span>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div style={{
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
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '50%',
              opacity: '0.1',
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#92400e',
              }}>
                Pending
              </div>
            </div>
            <h3 style={{
              color: '#64748b',
              fontSize: '0.875rem',
              fontWeight: '600',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Pending Orders
            </h3>
            <p style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {animatedStats.pendingOrders}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#f59e0b',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Requires attention</span>
            </div>
          </div>

          {/* Completed Orders Card */}
          <div style={{
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
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '50%',
              opacity: '0.1',
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6b21a8',
              }}>
                Success
              </div>
            </div>
            <h3 style={{
              color: '#64748b',
              fontSize: '0.875rem',
              fontWeight: '600',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Completed Orders
            </h3>
            <p style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {animatedStats.completedOrders}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#10b981',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span>+8.2% from last month</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Widget */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          marginBottom: '40px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}>
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: '0 0 6px 0',
                color: '#1e293b',
                letterSpacing: '-0.5px',
              }}>
                Quick Actions
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: 0,
                fontWeight: '500',
              }}>
                Manage your store efficiently
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 12px rgba(102, 126, 234, 0.3)',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
          }}
          className="quick-actions-grid"
          >
            {/* Create Product */}
            <button
              onClick={() => navigate('/products/new')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '24px 20px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
              className="quick-action-btn"
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
              <div style={{
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.9375rem',
                textAlign: 'center',
              }}>
                Create Product
              </div>
            </button>

            {/* View Orders */}
            <button
              onClick={() => navigate('/orders')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '24px 20px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
              className="quick-action-btn"
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div style={{
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.9375rem',
                textAlign: 'center',
              }}>
                View Orders
              </div>
            </button>

            {/* Manage Products */}
            <button
              onClick={() => navigate('/products')}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '24px 20px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 16px rgba(245, 158, 11, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
              className="quick-action-btn"
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <div style={{
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.9375rem',
                textAlign: 'center',
              }}>
                Manage Products
              </div>
            </button>

            {/* View Analytics */}
            <button
              onClick={() => toast.info('Analytics feature coming soon!')}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '24px 20px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 16px rgba(139, 92, 246, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
              className="quick-action-btn"
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="20" x2="12" y2="10"></line>
                  <line x1="18" y1="20" x2="18" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="16"></line>
                </svg>
              </div>
              <div style={{
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.9375rem',
                textAlign: 'center',
              }}>
                View Analytics
              </div>
            </button>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}
        className="charts-grid"
        >
          {/* Revenue Chart */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  margin: '0 0 6px 0',
                  color: '#1e293b',
                  letterSpacing: '-0.5px',
                }}>
                  Revenue Trend
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0,
                  fontWeight: '500',
                }}>
                  Last 7 days performance
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 12px rgba(59, 130, 246, 0.3)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: '0.875rem', fontWeight: '500' }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '0.875rem', fontWeight: '500' }}
                />
                <Tooltip content={<CustomTooltip valuePrefix="$" />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    fill: '#3b82f6',
                    strokeWidth: 2,
                    r: 5,
                    stroke: '#fff',
                  }}
                  activeDot={{
                    r: 7,
                    stroke: '#fff',
                    strokeWidth: 2,
                    fill: '#3b82f6',
                  }}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Chart */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  margin: '0 0 6px 0',
                  color: '#1e293b',
                  letterSpacing: '-0.5px',
                }}>
                  Orders Volume
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0,
                  fontWeight: '500',
                }}>
                  Daily order distribution
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 12px rgba(16, 185, 129, 0.3)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={revenueData}>
                <defs>
                  <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: '0.875rem', fontWeight: '500' }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '0.875rem', fontWeight: '500' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                  iconType="circle"
                />
                <Bar
                  dataKey="orders"
                  fill="url(#orderGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                  name="Orders"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
          }}>
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: '0 0 6px 0',
                color: '#1e293b',
                letterSpacing: '-0.5px',
              }}>
                Recent Orders
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: 0,
                fontWeight: '500',
              }}>
                Latest customer transactions
              </p>
            </div>
            <button style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>View All</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <div style={{
            overflowX: 'auto',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              }}>
                <tr>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}>
                    Order ID
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}>
                    Customer
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}>
                    Amount
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}>
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
                    <td style={{
                      padding: '20px 24px',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: '#3b82f6',
                    }}>
                      #{order._id?.slice(-6)}
                    </td>
                    <td style={{
                      padding: '20px 24px',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: '0.875rem',
                        }}>
                          {(order.user?.name || order.shippingAddress?.fullName || 'N/A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '0.9375rem',
                            fontWeight: '600',
                            color: '#1e293b',
                          }}>
                            {order.user?.name || order.shippingAddress?.fullName || 'N/A'}
                          </div>
                          <div style={{
                            fontSize: '0.8125rem',
                            color: '#64748b',
                            marginTop: '2px',
                          }}>
                            {order.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      fontSize: '0.9375rem',
                      fontWeight: '700',
                      color: '#10b981',
                    }}>
                      ${order.total?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{
                      padding: '20px 24px',
                    }}>
                      <span style={getStatusStyle(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      fontSize: '0.875rem',
                      color: '#64748b',
                      fontWeight: '500',
                    }}>
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
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <h3 style={{
                  color: '#64748b',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                }}>
                  No orders yet
                </h3>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  margin: 0,
                }}>
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

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
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

        .spinner {
          animation: spin 1s linear infinite;
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

        .quick-action-btn:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2) !important;
        }

        .quick-action-btn:active {
          transform: translateY(-2px) scale(1.02);
        }

        .table-row:hover {
          background: #f8fafc !important;
          transform: scale(1.01);
        }

        /* Mobile Responsive Styles */
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .charts-grid {
            grid-template-columns: 1fr !important;
          }
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr) !important;
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
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (min-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
          .charts-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .quick-actions-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          table {
            font-size: 0.875rem;
          }
          th, td {
            padding: 12px 16px !important;
          }

          /* Make container padding smaller on mobile */
          body > div > div {
            padding: 16px !important;
          }
        }

        /* Tablet optimizations */
        @media (min-width: 641px) and (max-width: 1023px) {
          .charts-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* Hide table columns on very small screens */
        @media (max-width: 480px) {
          table {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
