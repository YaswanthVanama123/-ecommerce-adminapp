import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    groupBy: 'day',
    category: '',
    status: '',
    limit: 50
  });

  // Fetch report data
  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          ...filters
        }
      };

      let endpoint = '';
      switch (selectedReport) {
        case 'sales':
          endpoint = '/admin/reports/sales';
          break;
        case 'revenue':
          endpoint = '/admin/reports/revenue';
          break;
        case 'inventory':
          endpoint = '/admin/reports/inventory';
          break;
        case 'customers':
          endpoint = '/admin/reports/customers';
          break;
        case 'products':
          endpoint = '/admin/reports/products';
          break;
        case 'top-performers':
          endpoint = '/admin/reports/top-performers';
          break;
        default:
          endpoint = '/admin/reports/sales';
      }

      const response = await axios.get(`${API_BASE_URL}${endpoint}`, config);

      if (response.data.success) {
        setReportData(response.data);
      } else {
        toast.error('Failed to load report data');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error(error.response?.data?.message || 'Error loading report');
    } finally {
      setLoading(false);
    }
  };

  // Export report
  const exportReport = async (format) => {
    if (!reportData || !reportData.data) {
      toast.error('No data to export');
      return;
    }

    setExporting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_BASE_URL}/admin/reports/export`,
        {
          reportData: reportData.data,
          format: format,
          reportName: `${selectedReport}_report`,
          columns: getColumnsForReport(selectedReport)
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error exporting report');
    } finally {
      setExporting(false);
    }
  };

  // Get columns based on report type
  const getColumnsForReport = (reportType) => {
    switch (reportType) {
      case 'sales':
        return [
          { header: 'Date', key: '_id' },
          { header: 'Total Orders', key: 'totalOrders' },
          { header: 'Revenue', key: 'totalRevenue' },
          { header: 'Avg Order Value', key: 'averageOrderValue' },
          { header: 'Completed', key: 'completedOrders' },
          { header: 'Cancelled', key: 'cancelledOrders' }
        ];
      case 'revenue':
        return [
          { header: 'Category', key: 'category' },
          { header: 'Revenue', key: 'revenue' },
          { header: 'Orders', key: 'orderCount' },
          { header: 'Items Sold', key: 'itemsSold' }
        ];
      case 'inventory':
        return [
          { header: 'Product', key: 'name' },
          { header: 'SKU', key: 'sku' },
          { header: 'Category', key: 'category' },
          { header: 'Stock', key: 'stock' },
          { header: 'Price', key: 'price' },
          { header: 'Stock Value', key: 'stockValue' }
        ];
      case 'customers':
        return [
          { header: 'Name', key: 'customerName' },
          { header: 'Email', key: 'email' },
          { header: 'Total Orders', key: 'totalOrders' },
          { header: 'Total Spent', key: 'totalSpent' },
          { header: 'Avg Order Value', key: 'averageOrderValue' }
        ];
      case 'products':
        return [
          { header: 'Product', key: 'productName' },
          { header: 'Revenue', key: 'totalRevenue' },
          { header: 'Quantity Sold', key: 'totalQuantitySold' },
          { header: 'Orders', key: 'totalOrders' },
          { header: 'Avg Price', key: 'averagePrice' }
        ];
      default:
        return [];
    }
  };

  // Load data when report type or filters change
  useEffect(() => {
    fetchReportData();
  }, [selectedReport, dateRange]);

  // Render chart based on report type
  const renderChart = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          No data available for the selected period
        </div>
      );
    }

    switch (selectedReport) {
      case 'sales':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reportData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="totalRevenue" stroke="#8884d8" name="Revenue" />
              <Line yAxisId="right" type="monotone" dataKey="totalOrders" stroke="#82ca9d" name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.data.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'inventory':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.data.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#82ca9d" name="Stock Level" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'customers':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.data.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="customerName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSpent" fill="#ffc658" name="Total Spent" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'products':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.data.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#8884d8" name="Revenue" />
              <Bar dataKey="totalQuantitySold" fill="#82ca9d" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'top-performers':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={reportData.data.slice(0, 8)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={entry => entry.name}
                outerRadius={150}
                fill="#8884d8"
                dataKey="revenue"
              >
                {reportData.data.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Render summary cards
  const renderSummaryCards = () => {
    if (!reportData || !reportData.summary) return null;

    const { summary } = reportData;

    switch (selectedReport) {
      case 'sales':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Orders</div>
              <div className="text-2xl font-bold text-gray-900">{summary.totalOrders || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-2xl font-bold text-green-600">
                ${(summary.totalRevenue || 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Avg Order Value</div>
              <div className="text-2xl font-bold text-blue-600">
                ${(summary.averageOrderValue || 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Max Order Value</div>
              <div className="text-2xl font-bold text-purple-600">
                ${(summary.maxOrderValue || 0).toFixed(2)}
              </div>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Products</div>
              <div className="text-2xl font-bold text-gray-900">{summary.totalProducts || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Low Stock Items</div>
              <div className="text-2xl font-bold text-orange-600">{summary.lowStockProducts || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Out of Stock</div>
              <div className="text-2xl font-bold text-red-600">{summary.outOfStockProducts || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Inventory Value</div>
              <div className="text-2xl font-bold text-green-600">
                ${(summary.totalInventoryValue || 0).toFixed(2)}
              </div>
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Customers</div>
              <div className="text-2xl font-bold text-gray-900">{summary.totalCustomers || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-2xl font-bold text-green-600">
                ${(summary.totalRevenue || 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Avg Customer Value</div>
              <div className="text-2xl font-bold text-blue-600">
                ${(summary.averageCustomerValue || 0).toFixed(2)}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render data table
  const renderDataTable = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) return null;

    const columns = getColumnsForReport(selectedReport);
    const data = reportData.data.slice(0, 20);

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Detailed Data</h3>
          <p className="text-sm text-gray-600">
            Showing {data.length} of {reportData.data.length} records
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof row[col.key] === 'number' && col.key.toLowerCase().includes('revenue') || col.key.toLowerCase().includes('price') || col.key.toLowerCase().includes('value') || col.key.toLowerCase().includes('spent')
                        ? `$${row[col.key].toFixed(2)}`
                        : row[col.key] !== undefined && row[col.key] !== null
                        ? typeof row[col.key] === 'number'
                          ? row[col.key].toLocaleString()
                          : row[col.key]
                        : '-'
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Generate and export comprehensive business reports</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sales">Sales Report</option>
              <option value="revenue">Revenue Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="customers">Customer Report</option>
              <option value="products">Product Performance</option>
              <option value="top-performers">Top Performers</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Group By (for sales) */}
          {selectedReport === 'sales' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group By
              </label>
              <select
                value={filters.groupBy}
                onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hour">Hourly</option>
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchReportData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Generate Report'
            )}
          </button>

          <button
            onClick={() => exportReport('pdf')}
            disabled={!reportData || exporting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            Export PDF
          </button>

          <button
            onClick={() => exportReport('excel')}
            disabled={!reportData || exporting}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            Export Excel
          </button>

          <button
            onClick={() => exportReport('csv')}
            disabled={!reportData || exporting}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading report data...</p>
        </div>
      )}

      {/* Report Content */}
      {!loading && reportData && (
        <>
          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Visual Analysis</h3>
            {renderChart()}
          </div>

          {/* Data Table */}
          {renderDataTable()}
        </>
      )}

      {/* No Data State */}
      {!loading && !reportData && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No report generated</h3>
          <p className="mt-2 text-gray-500">
            Select report type and date range, then click Generate Report
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
