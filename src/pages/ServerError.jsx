import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ServerError Component (500 Error Page) for Admin Panel
 * Displays when a server error occurs
 */
const ServerError = () => {
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    // Simulate retry with reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
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
    marginBottom: '1.5rem',
  };

  const iconOuterContainerStyle = {
    position: 'relative',
  };

  const iconCircleStyle = {
    width: '8rem',
    height: '8rem',
    borderRadius: '9999px',
    background: 'linear-gradient(to bottom right, #3B82F6, #2563EB)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  };

  const iconStyle = {
    width: '4rem',
    height: '4rem',
    color: '#ffffff',
  };

  const badgeStyle = {
    position: 'absolute',
    top: '-0.5rem',
    right: '-0.5rem',
    width: '3rem',
    height: '3rem',
    backgroundColor: '#EF4444',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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

  const infoListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  };

  const infoItemStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  };

  const infoIconContainerStyle = {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '9999px',
    backgroundColor: '#DBEAFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '0.125rem',
  };

  const infoIconStyle = {
    width: '1rem',
    height: '1rem',
    color: '#2563EB',
  };

  const infoTextStyle = {
    color: '#6B7280',
  };

  const buttonGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
  };

  const retryButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    background: 'linear-gradient(to right, #2563EB, #3B82F6)',
    color: '#ffffff',
    fontWeight: '600',
    border: 'none',
    cursor: isRetrying ? 'not-allowed' : 'pointer',
    opacity: isRetrying ? 0.5 : 1,
    transition: 'all 0.2s',
  };

  const backButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    backgroundColor: 'transparent',
    color: '#2563EB',
    fontWeight: '600',
    border: '2px solid #2563EB',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const dashboardButtonStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    backgroundColor: '#ffffff',
    color: '#374151',
    fontWeight: '600',
    border: '2px solid #D1D5DB',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const buttonIconStyle = {
    width: '1.25rem',
    height: '1.25rem',
  };

  const spinnerStyle = {
    animation: 'spin 1s linear infinite',
    width: '1.25rem',
    height: '1.25rem',
    color: '#ffffff',
  };

  const supportGridStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  };

  const supportDescStyle = {
    color: '#6B7280',
    marginBottom: '1rem',
  };

  const supportLinkContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  };

  const supportLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  };

  const supportLinkIconStyle = {
    width: '1.25rem',
    height: '1.25rem',
  };

  const errorCodeStyle = {
    marginTop: '1.5rem',
    textAlign: 'center',
  };

  const errorCodeTextStyle = {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: '#9CA3AF',
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div style={containerStyle}>
        <div style={contentStyle}>
          {/* Error Illustration */}
          <div style={illustrationContainerStyle}>
            <div style={illustrationInnerStyle}>
              <div style={iconOuterContainerStyle}>
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
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div style={badgeStyle}>
                  500
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div style={messageSectionStyle}>
            <h1 style={headingStyle}>
              Server Error
            </h1>
            <p style={textStyle}>
              The admin panel is experiencing technical difficulties.
            </p>
            <p style={subTextStyle}>
              Our team has been notified and is working to fix the issue. Please try again in a few moments.
            </p>
          </div>

          {/* Error Details Card */}
          <div style={cardStyle}>
            <h2 style={cardHeadingStyle}>
              What happened?
            </h2>
            <div style={infoListStyle}>
              <div style={infoItemStyle}>
                <div style={infoIconContainerStyle}>
                  <svg
                    style={infoIconStyle}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p style={infoTextStyle}>
                  An unexpected error occurred on our servers while processing your request.
                </p>
              </div>
              <div style={infoItemStyle}>
                <div style={infoIconContainerStyle}>
                  <svg
                    style={infoIconStyle}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p style={infoTextStyle}>
                  Your data is safe, and no changes have been made to the system.
                </p>
              </div>
              <div style={infoItemStyle}>
                <div style={infoIconContainerStyle}>
                  <svg
                    style={infoIconStyle}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p style={infoTextStyle}>
                  Please try refreshing the page or come back in a few minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Card */}
          <div style={cardStyle}>
            <h2 style={cardHeadingStyle}>
              What can you do?
            </h2>
            <div style={buttonGridStyle}>
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                style={retryButtonStyle}
                onMouseOver={(e) => {
                  if (!isRetrying) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isRetrying ? (
                  <>
                    <svg
                      style={spinnerStyle}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        style={{ opacity: 0.25 }}
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        style={{ opacity: 0.75 }}
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Retrying...
                  </>
                ) : (
                  <>
                    <svg
                      style={buttonIconStyle}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry {retryCount > 0 && `(${retryCount})`}
                  </>
                )}
              </button>

              <button
                onClick={handleGoBack}
                style={backButtonStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg
                  style={buttonIconStyle}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </button>
            </div>

            <button
              onClick={handleGoToDashboard}
              style={dashboardButtonStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <svg
                style={buttonIconStyle}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Dashboard
            </button>
          </div>

          {/* Support Information Card */}
          <div style={cardStyle}>
            <h2 style={cardHeadingStyle}>
              Still having issues?
            </h2>
            <p style={supportDescStyle}>
              If the problem persists, please contact our technical support team. We're here to help!
            </p>
            <div style={supportLinkContainerStyle}>
              <a
                href="mailto:admin-support@example.com"
                style={supportLinkStyle}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#BFDBFE'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
              >
                <svg
                  style={supportLinkIconStyle}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Technical Support
              </a>
              <a
                href="tel:+1234567890"
                style={supportLinkStyle}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#BFDBFE'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
              >
                <svg
                  style={supportLinkIconStyle}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Support Hotline
              </a>
            </div>
          </div>

          {/* Error Code */}
          <div style={errorCodeStyle}>
            <p style={errorCodeTextStyle}>
              Error Code: 500 - Internal Server Error
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerError;
