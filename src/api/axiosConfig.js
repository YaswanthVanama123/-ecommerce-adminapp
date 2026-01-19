import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// CSRF Token management
let csrfToken = null;

// Function to fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/csrf-token`, {
      withCredentials: true
    });
    csrfToken = response.data?.data?.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Fetch CSRF token on initialization
fetchCsrfToken();

// Request interceptor to add token and CSRF
axiosInstance.interceptors.request.use(
  async (config) => {
    // Add CSRF token for state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase())) {
      // If no CSRF token, fetch it
      if (!csrfToken) {
        await fetchCsrfToken();
      }

      // Add CSRF token to headers
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Note: Token from localStorage is kept for backward compatibility
    // But cookies are the primary authentication method now
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

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token using cookie-based refresh endpoint
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Token refreshed, retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear local data and redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
