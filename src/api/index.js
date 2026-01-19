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
  getDashboard: () => axiosInstance.get('/analytics/dashboard'),
  getRevenue: (period) => axiosInstance.get('/analytics/revenue', { params: { period } }),
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

export default {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  categories: categoriesAPI,
  analytics: analyticsAPI,
  banners: bannersAPI,
  shipping: shippingAPI,
};
