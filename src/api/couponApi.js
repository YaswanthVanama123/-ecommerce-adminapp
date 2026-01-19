import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all coupons with filters
export const getAllCoupons = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.sort) params.append('sort', filters.sort);

    const response = await axiosInstance.get(`/coupons?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single coupon by ID
export const getCouponById = async (id) => {
  try {
    const response = await axiosInstance.get(`/coupons/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new coupon
export const createCoupon = async (couponData) => {
  try {
    const response = await axiosInstance.post('/coupons', couponData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update coupon
export const updateCoupon = async (id, couponData) => {
  try {
    const response = await axiosInstance.put(`/coupons/${id}`, couponData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete coupon
export const deleteCoupon = async (id) => {
  try {
    const response = await axiosInstance.delete(`/coupons/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Toggle coupon active status
export const toggleCouponStatus = async (id) => {
  try {
    const response = await axiosInstance.patch(`/coupons/${id}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get coupon statistics
export const getCouponStatistics = async () => {
  try {
    const response = await axiosInstance.get('/coupons/stats/overview');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Validate coupon (for testing)
export const validateCoupon = async (code, orderTotal, productIds = [], categoryIds = []) => {
  try {
    const response = await axiosInstance.post('/coupons/validate', {
      code,
      orderTotal,
      productIds,
      categoryIds
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponStatistics,
  validateCoupon
};
