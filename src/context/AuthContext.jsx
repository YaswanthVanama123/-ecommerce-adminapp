import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('adminUser');

      if (savedUser) {
        try {
          // Set user from localStorage first for instant UI
          setUser(JSON.parse(savedUser));

          // Then verify with backend (uses cookies for auth)
          try {
            const response = await authAPI.getProfile();
            const freshUser = response.data?.data || response.data;
            if (freshUser && ['admin', 'superadmin'].includes(freshUser.role)) {
              setUser(freshUser);
              localStorage.setItem('adminUser', JSON.stringify(freshUser));
            } else {
              throw new Error('Invalid user role');
            }
          } catch (verifyError) {
            // Cookie invalid, clear everything
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setUser(null);
        }
      } else {
        // Try to fetch user from backend (in case cookies exist)
        try {
          const response = await authAPI.getProfile();
          const userData = response.data?.data || response.data;
          if (userData && ['admin', 'superadmin'].includes(userData.role)) {
            setUser(userData);
            localStorage.setItem('adminUser', JSON.stringify(userData));
          }
        } catch (error) {
          // No valid session
          setUser(null);
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
      const { user: userData } = responseData;

      // Validate response
      if (!userData) {
        throw new Error('Invalid response from server');
      }

      // Check if user has admin role
      if (!['admin', 'superadmin'].includes(userData.role)) {
        throw new Error('Unauthorized. Admin access required.');
      }

      // Store only user data (tokens are in HttpOnly cookies)
      // Keep adminToken for backward compatibility with Authorization header
      const legacyToken = responseData.token || responseData.accessToken;
      if (legacyToken) {
        localStorage.setItem('adminToken', legacyToken);
      }
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

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user data (cookies cleared by backend)
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setUser(null);
    }
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
