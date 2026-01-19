import React from 'react';

/**
 * ErrorBoundary Component for Admin Panel
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI with inline styles
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Send error to error reporting service
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    // Send to error reporting service
    if (import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true') {
      // Sentry integration
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        });
      }

      // Custom error endpoint
      if (import.meta.env.VITE_ERROR_REPORTING_ENDPOINT) {
        fetch(import.meta.env.VITE_ERROR_REPORTING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: {
              message: error.toString(),
              stack: error.stack,
            },
            errorInfo: {
              componentStack: errorInfo.componentStack,
            },
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            source: 'admin-webapp',
          }),
        }).catch(() => {}); // Silently fail
      }
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI from props
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
        });
      }

      // Inline styles
      const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        padding: '1rem',
      };

      const cardStyle = {
        maxWidth: '32rem',
        width: '100%',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        borderRadius: '0.5rem',
        padding: '2rem',
      };

      const iconContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '4rem',
        height: '4rem',
        margin: '0 auto 1rem',
        backgroundColor: '#FEE2E2',
        borderRadius: '9999px',
      };

      const iconStyle = {
        width: '2rem',
        height: '2rem',
        color: '#DC2626',
      };

      const headingStyle = {
        fontSize: '1.5rem',
        lineHeight: '2rem',
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: '0.5rem',
      };

      const textStyle = {
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: '1.5rem',
      };

      const errorBoxStyle = {
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '0.375rem',
      };

      const errorTitleStyle = {
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        fontWeight: '600',
        color: '#991B1B',
        marginBottom: '0.5rem',
      };

      const errorTextStyle = {
        fontSize: '0.75rem',
        lineHeight: '1rem',
        color: '#B91C1C',
        fontFamily: 'monospace',
        overflowX: 'auto',
      };

      const detailsStyle = {
        marginTop: '0.5rem',
      };

      const summaryStyle = {
        fontSize: '0.75rem',
        lineHeight: '1rem',
        color: '#B91C1C',
        cursor: 'pointer',
      };

      const preStyle = {
        fontSize: '0.75rem',
        lineHeight: '1rem',
        color: '#DC2626',
        marginTop: '0.5rem',
        overflowX: 'auto',
        maxHeight: '10rem',
      };

      const buttonContainerStyle = {
        display: 'flex',
        gap: '0.75rem',
      };

      const primaryButtonStyle = {
        flex: '1',
        backgroundColor: '#2563EB',
        color: '#ffffff',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      };

      const secondaryButtonStyle = {
        flex: '1',
        backgroundColor: '#E5E7EB',
        color: '#1F2937',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      };

      const warningStyle = {
        marginTop: '1rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        color: '#DC2626',
        textAlign: 'center',
      };

      const linkStyle = {
        marginTop: '1.5rem',
        textAlign: 'center',
      };

      const linkAnchorStyle = {
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        color: '#2563EB',
        textDecoration: 'none',
      };

      // Default fallback UI
      return (
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={iconContainerStyle}>
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

            <h2 style={headingStyle}>
              Oops! Something went wrong
            </h2>

            <p style={textStyle}>
              We're sorry for the inconvenience. An unexpected error has occurred in the admin panel.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div style={errorBoxStyle}>
                <p style={errorTitleStyle}>
                  Error Details:
                </p>
                <p style={errorTextStyle}>
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details style={detailsStyle}>
                    <summary style={summaryStyle}>
                      Component Stack
                    </summary>
                    <pre style={preStyle}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div style={buttonContainerStyle}>
              <button
                onClick={this.handleReset}
                style={primaryButtonStyle}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1D4ED8'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2563EB'}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                style={secondaryButtonStyle}
                onMouseOver={(e) => e.target.style.backgroundColor = '#D1D5DB'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#E5E7EB'}
              >
                Reload Page
              </button>
            </div>

            {this.state.errorCount > 2 && (
              <p style={warningStyle}>
                This error has occurred multiple times. Please contact technical support if the problem persists.
              </p>
            )}

            <div style={linkStyle}>
              <a
                href="/dashboard"
                style={linkAnchorStyle}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export const withErrorBoundary = (Component, fallback) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

/**
 * Hook to programmatically trigger error boundary
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};

export default ErrorBoundary;
