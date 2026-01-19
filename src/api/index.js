import axiosInstance from './axiosConfig';

// Auth APIs
export const authAPI = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  logout: () => axiosInstance.post('/auth/logout'),
  getProfile: () => axiosInstance.get('/auth/profile'),
};

// Products APIs
export const productsAPI = {
  getAll: (params) => axiosInstance.get('/products', { params }),
  getById: (id) => axiosInstance.get(`/products/${id}`),
  create: (data) => axiosInstance.post('/products', data),
  update: (id, data) => axiosInstance.put(`/products/${id}`, data),
  delete: (id) => axiosInstance.delete(`/products/${id}`),
  uploadImage: (formData) => axiosInstance.post('/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Orders APIs
export const ordersAPI = {
  getAll: (params) => axiosInstance.get('/orders', { params }),
  getById: (id) => axiosInstance.get(`/orders/${id}`),
  updateStatus: (id, status) => axiosInstance.put(`/orders/${id}/status`, { status }),
  getStats: () => axiosInstance.get('/orders/stats'),
};

// Categories APIs
export const categoriesAPI = {
  getAll: () => axiosInstance.get('/categories'),
  getById: (id) => axiosInstance.get(`/categories/${id}`),
  create: (data) => axiosInstance.post('/categories', data),
  update: (id, data) => axiosInstance.put(`/categories/${id}`, data),
  delete: (id) => axiosInstance.delete(`/categories/${id}`),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: (params) => axiosInstance.get('/analytics/dashboard', { params }),
  getSales: (params) => axiosInstance.get('/analytics/sales', { params }),
  getRevenue: (params) => axiosInstance.get('/analytics/revenue', { params }),
  getCustomers: (params) => axiosInstance.get('/analytics/customers', { params }),
  getProducts: (params) => axiosInstance.get('/analytics/products', { params }),
  getOrders: (params) => axiosInstance.get('/analytics/orders', { params }),
  clearCache: () => axiosInstance.delete('/analytics/cache'),
  getTopProducts: () => axiosInstance.get('/analytics/top-products'),
};

// Banners APIs
export const bannersAPI = {
  getAll: (params) => axiosInstance.get('/banners', { params }),
  getById: (id) => axiosInstance.get(`/banners/${id}`),
  create: (data) => axiosInstance.post('/banners', data),
  update: (id, data) => axiosInstance.put(`/banners/${id}`, data),
  delete: (id) => axiosInstance.delete(`/banners/${id}`),
  uploadImage: (formData) => axiosInstance.post('/banners/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Shipping APIs (Admin specific operations)
export const shippingAPI = {
  // Create shipment for an order
  create: (data) => axiosInstance.post('/shipping', data),

  // Get all shipments (if admin has permission)
  getAll: (params) => axiosInstance.get('/shipping/admin/shipments', { params }),

  // Get shipment by ID or order ID
  getById: (id) => axiosInstance.get(`/shipping/order/${id}`),

  // Get shipment by tracking number
  getByTrackingNumber: (trackingNumber) => axiosInstance.get(`/shipping/track/${trackingNumber}`),

  // Update shipment status
  updateStatus: (id, statusData) => axiosInstance.put(`/shipping/${id}/status`, statusData),

  // Update tracking information
  updateTracking: (id, trackingData) => axiosInstance.put(`/shipping/${id}/tracking`, trackingData),

  // Get delivery timeline
  getTimeline: (id) => axiosInstance.get(`/shipping/${id}/timeline`),
};

// Invoices APIs
export const invoicesAPI = {
  getAll: (params) => axiosInstance.get('/invoices', { params }),
  getById: (id) => axiosInstance.get(`/invoices/${id}`),
  generate: (orderId) => axiosInstance.post('/invoices/generate', { orderId }),
  download: (id) => axiosInstance.get(`/invoices/${id}/download`, { responseType: 'blob' }),
  email: (id, email) => axiosInstance.post(`/invoices/${id}/email`, { email }),
  regenerate: (id) => axiosInstance.post(`/invoices/${id}/regenerate`),
  bulkDownload: (orderIds) => axiosInstance.post('/invoices/bulk/download', { orderIds }, { responseType: 'blob' }),
  getStatistics: () => axiosInstance.get('/invoices/statistics'),
};

// Inventory APIs
export const inventoryAPI = {
  // Get inventory overview
  getOverview: () => axiosInstance.get('/admin/inventory'),

  // Get low stock alerts
  getLowStockAlerts: () => axiosInstance.get('/admin/inventory/low-stock'),

  // Get inventory history
  getHistory: (params) => axiosInstance.get('/admin/inventory/history', { params }),

  // Get inventory statistics
  getStatistics: (params) => axiosInstance.get('/admin/inventory/statistics', { params }),

  // Manual stock adjustment
  adjustStock: (data) => axiosInstance.post('/admin/inventory/adjust', data),

  // Create reorder
  createReorder: (data) => axiosInstance.post('/admin/inventory/reorder', data),

  // Bulk stock update
  bulkUpdate: (updates) => axiosInstance.post('/admin/inventory/bulk-update', { updates }),
};

export default {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  categories: categoriesAPI,
  analytics: analyticsAPI,
  banners: bannersAPI,
  shipping: shippingAPI,
  invoices: invoicesAPI,
  inventory: inventoryAPI,
};
