import { useState } from 'react';
import { X, Upload, Download, Trash2, Edit, Check, AlertCircle } from 'lucide-react';

const BulkOperations = ({ type, selectedItems, onComplete, onCancel }) => {
  const [operation, setOperation] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const operations = {
    products: [
      { value: 'update_price', label: 'Update Price', icon: Edit },
      { value: 'update_stock', label: 'Update Stock', icon: Edit },
      { value: 'update_status', label: 'Update Status', icon: Edit },
      { value: 'bulk_delete', label: 'Delete Products', icon: Trash2 },
      { value: 'export', label: 'Export Data', icon: Download }
    ],
    orders: [
      { value: 'update_status', label: 'Update Status', icon: Edit },
      { value: 'mark_paid', label: 'Mark as Paid', icon: Check },
      { value: 'cancel_orders', label: 'Cancel Orders', icon: X },
      { value: 'export', label: 'Export Data', icon: Download }
    ],
    customers: [
      { value: 'update_status', label: 'Update Status', icon: Edit },
      { value: 'send_email', label: 'Send Email', icon: Upload },
      { value: 'bulk_delete', label: 'Delete Customers', icon: Trash2 },
      { value: 'export', label: 'Export Data', icon: Download }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bulk/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          operation,
          items: selectedItems,
          data: formData
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Operation failed');
      }

      const result = await response.json();
      setSuccess(`Successfully processed ${result.success} items`);

      setTimeout(() => {
        onComplete && onComplete();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bulk/${type}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ items: selectedItems })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Export completed successfully');
      setTimeout(() => onCancel && onCancel(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOperationFields = () => {
    switch (operation) {
      case 'update_price':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Update Type
              </label>
              <select
                value={formData.priceType || ''}
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select type</option>
                <option value="set">Set Price</option>
                <option value="increase">Increase by</option>
                <option value="decrease">Decrease by</option>
                <option value="percentage">Percentage Change</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.priceValue || ''}
                onChange={(e) => setFormData({ ...formData, priceValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter value"
                required
              />
            </div>
          </div>
        );

      case 'update_stock':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Update Type
              </label>
              <select
                value={formData.stockType || ''}
                onChange={(e) => setFormData({ ...formData, stockType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select type</option>
                <option value="set">Set Stock</option>
                <option value="increase">Increase by</option>
                <option value="decrease">Decrease by</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={formData.stockValue || ''}
                onChange={(e) => setFormData({ ...formData, stockValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                required
              />
            </div>
          </div>
        );

      case 'update_status':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Status
            </label>
            <select
              value={formData.status || ''}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select status</option>
              {type === 'products' && (
                <>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </>
              )}
              {type === 'orders' && (
                <>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
              {type === 'customers' && (
                <>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </>
              )}
            </select>
          </div>
        );

      case 'send_email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject || ''}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email subject"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={formData.message || ''}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email message"
                required
              />
            </div>
          </div>
        );

      case 'bulk_delete':
      case 'cancel_orders':
      case 'mark_paid':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Confirm Action
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This action will affect {selectedItems.length} items and cannot be undone.
                  Please confirm you want to proceed.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (operation === 'export') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          <p className="text-gray-600 mb-6">
            Export {selectedItems.length} selected {type} to CSV file?
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Bulk Operations - {selectedItems.length} Items Selected
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Operation
              </label>
              <div className="grid grid-cols-2 gap-3">
                {operations[type]?.map((op) => {
                  const Icon = op.icon;
                  return (
                    <button
                      key={op.value}
                      type="button"
                      onClick={() => {
                        setOperation(op.value);
                        setFormData({});
                        setError('');
                        setSuccess('');
                      }}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 border rounded-md transition-colors ${
                        operation === op.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{op.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {operation && operation !== 'export' && (
              <div className="border-t pt-6">
                {renderOperationFields()}
              </div>
            )}
          </div>

          {operation && operation !== 'export' && (
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Apply to All Selected'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BulkOperations;
