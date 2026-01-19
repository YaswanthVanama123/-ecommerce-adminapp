import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          padding: '16px 20px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <p
          style={{
            color: '#1e293b',
            fontWeight: '700',
            marginBottom: '8px',
            fontSize: '0.9375rem',
          }}
        >
          {payload[0].payload.categoryName}
        </p>
        <p
          style={{
            color: payload[0].fill,
            fontWeight: '600',
            margin: '4px 0',
            fontSize: '0.875rem',
          }}
        >
          Revenue: ${payload[0].value?.toFixed(2) || '0.00'}
        </p>
        <p
          style={{
            color: '#64748b',
            fontWeight: '500',
            margin: '4px 0',
            fontSize: '0.8125rem',
          }}
        >
          {payload[0].payload.percentage?.toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

const CategoryChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          borderRadius: '12px',
        }}
      >
        <div className="spinner" style={{ width: '48px', height: '48px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#8b5cf6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          borderRadius: '12px',
          color: '#64748b',
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginBottom: '16px' }}
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        </svg>
        <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0' }}>No category data available</p>
        <p style={{ fontSize: '0.875rem', margin: '8px 0 0 0' }}>Data will appear when orders are placed</p>
      </div>
    );
  }

  // Calculate total and percentages
  const total = data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
  const chartData = data.map((item) => ({
    ...item,
    percentage: total > 0 ? (item.totalRevenue / total) * 100 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ categoryName, percentage }) =>
            `${categoryName}: ${percentage.toFixed(1)}%`
          }
          outerRadius={120}
          fill="#8884d8"
          dataKey="totalRevenue"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '0.875rem',
            fontWeight: '600',
          }}
          formatter={(value, entry) => entry.payload.categoryName}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;
