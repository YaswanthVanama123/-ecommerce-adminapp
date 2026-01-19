import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
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
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              color: entry.color,
              fontWeight: '600',
              margin: '4px 0',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: entry.color,
                display: 'inline-block',
              }}
            ></span>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomerGrowthChart = ({ data, loading }) => {
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
              borderTopColor: '#f59e0b',
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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0' }}>No customer data available</p>
        <p style={{ fontSize: '0.875rem', margin: '8px 0 0 0' }}>Data will appear when customers register</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
        <Line
          type="monotone"
          dataKey="newCustomers"
          stroke="#f59e0b"
          strokeWidth={3}
          dot={{
            fill: '#f59e0b',
            strokeWidth: 2,
            r: 5,
            stroke: '#fff',
          }}
          activeDot={{
            r: 7,
            stroke: '#fff',
            strokeWidth: 2,
            fill: '#f59e0b',
          }}
          fill="url(#customerGradient)"
          name="New Customers"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomerGrowthChart;
