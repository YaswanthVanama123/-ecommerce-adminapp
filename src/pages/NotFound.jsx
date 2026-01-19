import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * NotFound Component (404 Error Page) for Admin Panel
 * Displays when admin navigates to a non-existent route
 */
const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Inline styles
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: '1rem',
  };

  const contentStyle = {
    maxWidth: '48rem',
    width: '100%',
  };

  const illustrationContainerStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const illustrationInnerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const numberStyle = {
    fontSize: '9rem',
    lineHeight: '1',
    fontWeight: '700',
    color: '#2563EB',
    textShadow: '0 10px 15px rgba(37, 99, 235, 0.3)',
  };

  const iconContainerStyle = {
    margin: '0 1rem',
    position: 'relative',
  };

  const iconCircleStyle = {
    width: '6rem',
    height: '6rem',
    borderRadius: '9999px',
    background: 'linear-gradient(to bottom right, #3B82F6, #2563EB)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'bounce 1s infinite',
  };

  const iconStyle = {
    width: '3rem',
    height: '3rem',
    color: '#ffffff',
  };

  const messageSectionStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const headingStyle = {
    fontSize: '2.25rem',
    lineHeight: '2.5rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '1rem',
  };

  const textStyle = {
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    color: '#6B7280',
    marginBottom: '0.5rem',
  };

  const subTextStyle = {
    color: '#9CA3AF',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  };

  const cardHeadingStyle = {
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem',
  };

  const linkGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
  };

  const linkItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid #E5E7EB',
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
  };

  const linkIconContainerStyle = {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '9999px',
    backgroundColor: '#DBEAFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  };

  const linkIconStyle = {
    width: '1.25rem',
    height: '1.25rem',
    color: '#2563EB',
  };

  const linkTextStyle = {
    fontWeight: '500',
    color: '#374151',
    transition: 'color 0.2s',
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const primaryButtonStyle = {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(to right, #2563EB, #3B82F6)',
    color: '#ffffff',
    fontWeight: '600',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s',
  };

  const secondaryButtonStyle = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ffffff',
    color: '#2563EB',
    fontWeight: '600',
    borderRadius: '0.5rem',
    border: '2px solid #2563EB',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const supportTextStyle = {
    marginTop: '2rem',
    textAlign: 'center',
  };

  const supportLinkStyle = {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: '#9CA3AF',
  };

  const supportAnchorStyle = {
    color: '#2563EB',
    fontWeight: '500',
    textDecoration: 'none',
  };

  const handleLinkClick = (path) => {
    navigate(path);
  };

  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
      <div style={containerStyle}>
        <div style={contentStyle}>
          {/* 404 Illustration */}
          <div style={illustrationContainerStyle}>
            <div style={illustrationInnerStyle}>
              <span style={numberStyle}>4</span>
              <div style={iconContainerStyle}>
                <div style={iconCircleStyle}>
                  <svg
                    style={iconStyle}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <span style={numberStyle}>4</span>
            </div>
          </div>

          {/* Error Message */}
          <div style={messageSectionStyle}>
            <h1 style={headingStyle}>
              Page Not Found
            </h1>
            <p style={textStyle}>
              The admin page you're looking for doesn't exist.
            </p>
            <p style={subTextStyle}>
              It might have been moved, deleted, or the URL might be incorrect.
            </p>
          </div>

          {/* Quick Links */}
          <div style={cardStyle}>
            <h2 style={cardHeadingStyle}>
              Quick Links
            </h2>
            <div style={linkGridStyle}>
              <div
                onClick={() => handleLinkClick('/dashboard')}
                style={linkItemStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={linkIconContainerStyle}>
                  <svg
                    style={linkIconStyle}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span style={linkTextStyle}>Dashboard</span>
              </div>

              <div
                onClick={() => handleLinkClick('/products')}
                style={linkItemStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={linkIconContainerStyle}>
                  <svg
                    style={linkIconStyle}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span style={linkTextStyle}>Products</span>
              </div>

              <div
                onClick={() => handleLinkClick('/orders')}
                style={linkItemStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={linkIconContainerStyle}>
                  <svg
                    style={linkIconStyle}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span style={linkTextStyle}>Orders</span>
              </div>

              <div
                onClick={() => handleLinkClick('/analytics')}
                style={linkItemStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={linkIconContainerStyle}>
                  <svg
                    style={linkIconStyle}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span style={linkTextStyle}>Analytics</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={buttonContainerStyle}>
            <button
              onClick={handleGoToDashboard}
              style={primaryButtonStyle}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleGoBack}
              style={secondaryButtonStyle}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#EFF6FF';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#ffffff';
              }}
            >
              Go Back
            </button>
          </div>

          {/* Support Information */}
          <div style={supportTextStyle}>
            <p style={supportLinkStyle}>
              Need help?{' '}
              <a
                href="mailto:admin-support@example.com"
                style={supportAnchorStyle}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Contact Technical Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
