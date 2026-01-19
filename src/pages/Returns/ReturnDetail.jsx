import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosConfig';

const ReturnDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnData, setReturnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReturnDetails();
  }, [id]);

  const fetchReturnDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/returns/${id}`);
      setReturnData(response.data.return || response.data);
    } catch (error) {
      console.error('Error fetching return details:', error);
      toast.error('Failed to load return details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!adminNotes && newStatus === 'rejected') {
      toast.error('Please provide rejection reason in admin notes');
      return;
    }

    setUpdating(true);
    try {
      await axiosInstance.put(`/returns/${id}/status`, {
        status: newStatus,
        adminNotes
      });
      toast.success('Return status updated successfully');
      setAdminNotes('');
      fetchReturnDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      picked_up: 'bg-blue-100 text-blue-800',
      received: 'bg-purple-100 text-purple-800',
      inspected: 'bg-indigo-100 text-indigo-800',
      refund_initiated: 'bg-cyan-100 text-cyan-800',
      refund_completed: 'bg-green-100 text-green-800',
      exchange_initiated: 'bg-orange-100 text-orange-800',
      exchange_completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!returnData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Return not found</p>
        <button
          onClick={() => navigate('/returns')}
          className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          Back to Returns
        </button>
      </div>
    );
  }

  const nextStatuses = {
    pending: ['approved', 'rejected'],
    approved: ['picked_up'],
    picked_up: ['received'],
    received: ['inspected'],
    inspected: returnData.type === 'refund' ? ['refund_initiated'] : ['exchange_initiated'],
    refund_initiated: ['refund_completed'],
    exchange_initiated: ['exchange_completed']
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate('/returns')}
            className="text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Returns
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Return #{returnData.returnNumber || returnData._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-600 mt-1">
            Created on {new Date(returnData.createdAt).toLocaleString()}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(returnData.status)}`}>
          {returnData.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>

      {/* Return Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer & Order Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Customer & Order Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium text-gray-900">{returnData.user?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500">{returnData.user?.email || ''}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <button
                onClick={() => navigate(`/orders/${returnData.order._id || returnData.order}`)}
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                #{returnData.order.orderNumber || returnData.order._id?.slice(-8).toUpperCase()}
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-600">Return Type</p>
              <p className="font-medium text-gray-900">
                {returnData.type.charAt(0).toUpperCase() + returnData.type.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Refund Amount</p>
              <p className="font-medium text-gray-900">${returnData.refundAmount?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Return Details */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Return Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Reason</p>
              <p className="font-medium text-gray-900">{returnData.reason}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Comments</p>
              <p className="text-gray-900">{returnData.comments || 'No comments provided'}</p>
            </div>
            {returnData.images && returnData.images.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Attached Images</p>
                <div className="grid grid-cols-3 gap-2">
                  {returnData.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Return evidence ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75"
                      onClick={() => window.open(img, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
            {returnData.adminNotes && (
              <div>
                <p className="text-sm text-gray-600">Admin Notes</p>
                <p className="text-gray-900">{returnData.adminNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return Items */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Return Items</h2>
        <div className="space-y-4">
          {returnData.items?.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0">
              <img
                src={item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                alt={item.product?.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-grow">
                <h4 className="font-semibold text-gray-900">{item.product?.name || 'Product'}</h4>
                <div className="text-sm text-gray-600 mt-1">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.size && item.color && <span className="mx-2">|</span>}
                  {item.color && <span>Color: {item.color}</span>}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Quantity: {item.quantity} x ${item.price?.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${item.subtotal?.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Update Section */}
      {nextStatuses[returnData.status] && nextStatuses[returnData.status].length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Update Return Status</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes about this status update..."
              />
            </div>
            <div className="flex space-x-3">
              {nextStatuses[returnData.status].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={updating}
                  className={`px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    status === 'rejected'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {updating ? 'Updating...' : `Mark as ${status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {returnData.timeline && returnData.timeline.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Return Timeline</h2>
          <div className="space-y-4">
            {returnData.timeline.map((event, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-900">
                    {event.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-sm text-gray-600">{new Date(event.timestamp).toLocaleString()}</p>
                  {event.notes && <p className="text-sm text-gray-700 mt-1">{event.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnDetail;
