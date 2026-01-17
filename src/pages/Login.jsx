import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);

    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
    setIsLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Branding */}
      <div style={{
        display: 'none',
        width: '50%',
        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
        padding: '3rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }} className="lg-show">
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'white',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <svg style={{ width: '32px', height: '32px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span style={{ fontSize: '2rem', fontWeight: '700' }}>StyleHub</span>
          </div>

          {/* Welcome Text */}
          <div style={{ marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem', lineHeight: '1.2' }}>
              Welcome to<br />Admin Panel
            </h1>
            <p style={{ fontSize: '1.125rem', opacity: 0.9, lineHeight: '1.7' }}>
              Manage your e-commerce platform with powerful tools and real-time insights.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>1000+</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Products</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>5K+</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Customers</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>99%</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '450px' }}>
          {/* Mobile Logo */}
          <div className="lg-hide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.75rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <svg style={{ width: '28px', height: '28px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>StyleHub</span>
          </div>

          {/* Login Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '2.5rem'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                Admin Sign In
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Enter your credentials to access the admin panel
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg style={{ width: '20px', height: '20px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.75rem',
                      border: errors.email ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      background: errors.email ? '#fef2f2' : 'white',
                      transition: 'all 0.2s'
                    }}
                    placeholder="admin@stylehub.com"
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => {
                      if (!errors.email) e.target.style.borderColor = '#d1d5db';
                    }}
                  />
                </div>
                {errors.email && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                    <svg style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg style={{ width: '20px', height: '20px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                      border: errors.password ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      background: errors.password ? '#fef2f2' : 'white',
                      transition: 'all 0.2s'
                    }}
                    placeholder="Enter your password"
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => {
                      if (!errors.password) e.target.style.borderColor = '#d1d5db';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#9ca3af'
                    }}
                  >
                    {showPassword ? (
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                    <svg style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ marginRight: '0.5rem', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  Remember me
                </label>
                <a href="#" style={{ fontSize: '0.875rem', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: isLoading ? '#93c5fd' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.target.style.background = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.target.style.background = '#2563eb';
                }}
              >
                {isLoading ? (
                  <>
                    <svg style={{ width: '16px', height: '16px', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <svg style={{ width: '16px', height: '16px', marginLeft: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div style={{
              marginTop: '1.5rem',
              padding: '0.75rem',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start'
            }}>
              <svg style={{ width: '20px', height: '20px', color: '#2563eb', marginRight: '0.75rem', marginTop: '2px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e3a8a', marginBottom: '0.25rem' }}>Secure Access</h3>
                <p style={{ fontSize: '0.75rem', color: '#1e40af', lineHeight: '1.5' }}>
                  This admin panel is protected. Only authorized personnel can access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (min-width: 1024px) {
          .lg-show {
            display: flex !important;
            flex-direction: column;
          }
          .lg-hide {
            display: none !important;
          }
        }

        @media (max-width: 1023px) {
          .lg-show {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
