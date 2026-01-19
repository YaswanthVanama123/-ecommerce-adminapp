import { useState, useEffect } from 'react';
import {
  Server, Database, Cpu, HardDrive, Activity, AlertCircle,
  CheckCircle, RefreshCw, Clock, Zap, Globe, BarChart3
} from 'lucide-react';

const SystemStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchStatus();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/system/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch system status');

      const data = await response.json();
      setStatus(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'up':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
      case 'down':
      case 'disconnected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      connected: 'bg-green-100 text-green-800',
      up: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      down: 'bg-red-100 text-red-800',
      disconnected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'up':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
      case 'down':
      case 'disconnected':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Server className="h-8 w-8 mr-2" />
            System Status
          </h1>
          <p className="text-gray-600 mt-1">Monitor system health and performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Auto-refresh
            </label>
          </div>
          <button
            onClick={fetchStatus}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {status && (
        <>
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Status</span>
                {getStatusIcon(status.overall)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {status.overall}
                </span>
                {getStatusBadge(status.overall)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Uptime</span>
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatUptime(status.server?.uptime || 0)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">API Requests</span>
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {status.api?.requestCount?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Avg Response</span>
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {status.api?.avgResponseTime || 0}ms
              </div>
              <div className="text-xs text-gray-500 mt-1">Response time</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  Server Health
                </h2>
                {getStatusIcon(status.server?.status)}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">CPU Usage</span>
                    <span className="font-medium">{status.server?.cpu?.usage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(status.server?.cpu?.usage || 0)}`}
                      style={{ width: `${status.server?.cpu?.usage || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Memory Usage</span>
                    <span className="font-medium">
                      {formatBytes(status.server?.memory?.used || 0)} / {formatBytes(status.server?.memory?.total || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(status.server?.memory?.usagePercent || 0)}`}
                      style={{ width: `${status.server?.memory?.usagePercent || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Disk Usage</span>
                    <span className="font-medium">
                      {formatBytes(status.server?.disk?.used || 0)} / {formatBytes(status.server?.disk?.total || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(status.server?.disk?.usagePercent || 0)}`}
                      style={{ width: `${status.server?.disk?.usagePercent || 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Platform:</span>
                      <span className="ml-2 font-medium">{status.server?.platform || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Node.js:</span>
                      <span className="ml-2 font-medium">{status.server?.nodeVersion || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Health
                </h2>
                {getStatusIcon(status.database?.status)}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(status.database?.status)}
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Collections</span>
                  <span className="font-medium">{status.database?.collections || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Documents</span>
                  <span className="font-medium">{status.database?.documents?.toLocaleString() || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Database Size</span>
                  <span className="font-medium">{formatBytes(status.database?.dataSize || 0)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Storage Size</span>
                  <span className="font-medium">{formatBytes(status.database?.storageSize || 0)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Indexes</span>
                  <span className="font-medium">{status.database?.indexes || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Query Time</span>
                  <span className="font-medium">{status.database?.avgQueryTime || 0}ms</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Connections</span>
                  <span className="font-medium">
                    {status.database?.connections?.current || 0} / {status.database?.connections?.available || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  API Performance
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Requests (24h)</span>
                  <span className="font-medium">{status.api?.requestCount?.toLocaleString() || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">{status.api?.successRate || 0}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Error Count</span>
                  <span className="font-medium text-red-600">{status.api?.errorCount || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="font-medium">{status.api?.avgResponseTime || 0}ms</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Min Response Time</span>
                  <span className="font-medium">{status.api?.minResponseTime || 0}ms</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Max Response Time</span>
                  <span className="font-medium">{status.api?.maxResponseTime || 0}ms</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Requests</span>
                  <span className="font-medium">{status.api?.activeRequests || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Recent Errors
                </h2>
              </div>

              <div className="space-y-3">
                {status.errors && status.errors.length > 0 ? (
                  status.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-3 py-2">
                      <div className="text-sm font-medium text-gray-900">{error.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {error.endpoint} - {new Date(error.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p>No recent errors</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Service Status</h2>
            <div className="grid grid-cols-4 gap-4">
              {status.services && Object.entries(status.services).map(([name, serviceStatus]) => (
                <div key={name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 capitalize">{name}</span>
                    {getStatusIcon(serviceStatus)}
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(serviceStatus)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemStatus;
