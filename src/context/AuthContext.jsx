import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const savedUser = localStorage.getItem('adminUser');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });

      // Handle both response structures: response.data.data and response.data
      const responseData = response.data?.data || response.data;
      const { token, accessToken, user: userData } = responseData;

      // Use either token or accessToken
      const authToken = token || accessToken;

      // Validate response
      if (!authToken || !userData) {
        throw new Error('Invalid response from server');
      }

      // Check if user has admin role
      if (!['admin', 'superadmin'].includes(userData.role)) {
        throw new Error('Unauthorized. Admin access required.');
      }

      localStorage.setItem('adminToken', authToken);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
