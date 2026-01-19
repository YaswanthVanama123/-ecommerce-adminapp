import React from 'react';

const ShippingTimeline = ({ shipment }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'picked_up':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        );
      case 'in_transit':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13"/>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        );
      case 'out_for_delivery':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        );
      case 'delivered':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'picked_up':
        return '#3b82f6';
      case 'in_transit':
        return '#8b5cf6';
      case 'out_for_delivery':
        return '#f59e0b';
      case 'delivered':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatStatusLabel = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const timeline = shipment?.statusHistory || [];
  const currentStatus = shipment?.shippingStatus || 'pending';

  const containerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  };

  const headerStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const timelineContainerStyle = {
    position: 'relative',
    paddingLeft: '40px'
  };

  const timelineLineStyle = {
    position: 'absolute',
    left: '19px',
    top: '40px',
    bottom: '0',
    width: '2px',
    background: 'linear-gradient(to bottom, #e5e7eb 0%, #f3f4f6 100%)'
  };

  const timelineItemStyle = (isLast, status) => ({
    position: 'relative',
    marginBottom: isLast ? '0' : '32px',
    paddingBottom: isLast ? '0' : '0'
  });

  const timelineIconContainerStyle = (status, isActive) => ({
    position: 'absolute',
    left: '-40px',
    top: '0',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: isActive ? getStatusColor(status) : '#f3f4f6',
    border: `3px solid ${isActive ? '#ffffff' : '#e5e7eb'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isActive ? '#ffffff' : '#9ca3af',
    boxShadow: isActive ? `0 0 20px ${getStatusColor(status)}40` : '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease'
  });

  const timelineContentStyle = {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '16px 20px',
    border: '1px solid #e5e7eb'
  };

  const statusLabelStyle = (status, isActive) => ({
    fontSize: '0.938rem',
    fontWeight: '600',
    color: isActive ? getStatusColor(status) : '#64748b',
    marginBottom: '8px',
    textTransform: 'capitalize'
  });

  const locationStyle = {
    fontSize: '0.875rem',
    color: '#475569',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const noteStyle = {
    fontSize: '0.813rem',
    color: '#64748b',
    marginBottom: '8px',
    fontStyle: 'italic'
  };

  const timestampStyle = {
    fontSize: '0.75rem',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Shipping Timeline
        </div>
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#94a3b8'
        }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: '0 auto 12px' }}
          >
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: '0.938rem', margin: 0 }}>No shipping updates available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Shipping Timeline
      </div>

      <div style={timelineContainerStyle}>
        {timeline.length > 1 && <div style={timelineLineStyle} />}

        {timeline.map((item, index) => {
          const isLast = index === timeline.length - 1;
          const isActive = item.status === currentStatus || index === 0;

          return (
            <div key={index} style={timelineItemStyle(isLast, item.status)}>
              <div style={timelineIconContainerStyle(item.status, isActive)}>
                {getStatusIcon(item.status)}
              </div>

              <div style={timelineContentStyle}>
                <div style={statusLabelStyle(item.status, isActive)}>
                  {formatStatusLabel(item.status)}
                </div>

                {item.location && (
                  <div style={locationStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {item.location}
                  </div>
                )}

                {item.note && (
                  <div style={noteStyle}>
                    "{item.note}"
                  </div>
                )}

                <div style={timestampStyle}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {new Date(item.timestamp).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShippingTimeline;
