import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomerReportTemplate = ({ data, summary }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No customer data available for the selected period
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <div className="text-sm opacity-90">Total Customers</div>
            <div className="text-3xl font-bold mt-2">{summary.totalCustomers || 0}</div>
            <div className="text-xs mt-2 opacity-75">Active buyers</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="text-sm opacity-90">Total Revenue</div>
            <div className="text-3xl font-bold mt-2">${(summary.totalRevenue || 0).toFixed(2)}</div>
            <div className="text-xs mt-2 opacity-75">From all customers</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div className="text-sm opacity-90">Avg Customer Value</div>
            <div className="text-3xl font-bold mt-2">${(summary.averageCustomerValue || 0).toFixed(2)}</div>
            <div className="text-xs mt-2 opacity-75">Lifetime value</div>
          </div>
        </div>
      )}

      {/* Top Customers Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top 10 Customers by Spending</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="customerName"
              angle={-45}
              textAnchor="end"
              height={120}
              tick={{ fontSize: 11 }}
            />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="totalSpent" fill="#10b981" name="Total Spent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-6 rounded-lg shadow">
          <div className="text-sm opacity-90">VIP Customers</div>
          <div className="text-2xl font-bold mt-2">
            {data.filter(c => c.totalSpent > 1000).length}
          </div>
          <div className="text-xs mt-2 opacity-75">Spent over $1,000</div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-6 rounded-lg shadow">
          <div className="text-sm opacity-90">Regular Customers</div>
          <div className="text-2xl font-bold mt-2">
            {data.filter(c => c.totalOrders >= 3 && c.totalSpent <= 1000).length}
          </div>
          <div className="text-xs mt-2 opacity-75">3+ orders</div>
        </div>

        <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white p-6 rounded-lg shadow">
          <div className="text-sm opacity-90">New Customers</div>
          <div className="text-2xl font-bold mt-2">
            {data.filter(c => c.totalOrders === 1).length}
          </div>
          <div className="text-xs mt-2 opacity-75">Single order</div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Customer Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((customer, index) => {
                const isVIP = customer.totalSpent > 1000;
                const isRegular = customer.totalOrders >= 3 && customer.totalSpent <= 1000;
                const isNew = customer.totalOrders === 1;

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ${customer.averageOrderValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {isVIP && (
                        <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                          VIP
                        </span>
                      )}
                      {isRegular && (
                        <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                          Regular
                        </span>
                      )}
                      {isNew && (
                        <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                          New
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerReportTemplate;
