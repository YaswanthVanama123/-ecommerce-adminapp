import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../api';
import { toast } from 'react-toastify';

const StatusUpdateModal = ({ isOpen, onClose, order, onUpdate }) => {
  const [status, setStatus] = useState(order?.status || '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHover, setSelectedHover] = useState(null);

  useEffect(() => {
    if (isOpen && order?.status) {
      setStatus(order.status);
    }
  }, [isOpen, order]);

  const statusOptions = [
    {
      value: 'pending',
      label: 'Pending',
      icon: '⏳',
      bgColor: '#FEF3C7',
      textColor: '#92400E',
      borderColor: '#FDE68A',
      description: 'Order is awaiting processing'
    },
    {
      value: 'processing',
      label: 'Processing',
      icon: '🔄',
      bgColor: '#DBEAFE',
      textColor: '#1E3A8A',
      borderColor: '#93C5FD',
      description: 'Order is being prepared'
    },
    {
      value: 'shipped',
      label: 'Shipped',
      icon: '📦',
      bgColor: '#E9D5FF',
      textColor: '#581C87',
      borderColor: '#C4B5FD',
      description: 'Order is on its way'
    },
    {
      value: 'delivered',
      label: 'Delivered',
      icon: '✅',
      bgColor: '#D1FAE5',
      textColor: '#065F46',
      borderColor: '#6EE7B7',
      description: 'Order has been delivered'
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      icon: '❌',
      bgColor: '#FEE2E2',
      textColor: '#991B1B',
      borderColor: '#FCA5A5',
      description: 'Order has been cancelled'
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === order.status) {
      toast.info('No changes made');
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      await ordersAPI.updateStatus(order._id, status);
      toast.success('Order status updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
    animation: 'fadeIn 0.2s ease-out',
  };

  const modalStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    animation: 'slideUp 0.3s ease-out',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px 28px',
    borderBottom: '1px solid #E5E7EB',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  };

  const titleContainerStyle = {
    flex: 1,
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px',
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    fontWeight: '500',
  };

  const closeButtonStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '28px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.15)',
    cursor: 'pointer',
    padding: '4px 10px',
    lineHeight: '1',
    transition: 'all 0.2s ease',
    borderRadius: '8px',
    fontWeight: '300',
    marginLeft: '16px',
  };

  const formStyle = {
    padding: '28px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '16px',
    letterSpacing: '-0.2px',
  };

  const optionsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  };

  const getOptionLabelStyle = (option) => {
    const isSelected = status === option.value;
    const isHovered = selectedHover === option.value;

    return {
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      border: `2px solid ${isSelected ? option.borderColor : '#E5E7EB'}`,
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: isSelected ? option.bgColor : (isHovered ? '#F9FAFB' : '#ffffff'),
      boxShadow: isSelected
        ? `0 0 0 3px ${option.bgColor}`
        : (isHovered ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'),
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    };
  };

  const radioContainerStyle = {
    position: 'relative',
    width: '22px',
    height: '22px',
    marginRight: '14px',
    flexShrink: 0,
  };

  const radioStyle = {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    margin: 0,
  };

  const customRadioStyle = (option) => {
    const isSelected = status === option.value;
    return {
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      border: `2px solid ${isSelected ? option.textColor : '#D1D5DB'}`,
      backgroundColor: isSelected ? option.textColor : '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      position: 'relative',
    };
  };

  const radioInnerDotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
  };

  const iconStyle = {
    fontSize: '24px',
    marginRight: '12px',
    flexShrink: 0,
  };

  const optionContentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const optionTextStyle = (option) => ({
    fontWeight: '600',
    fontSize: '15px',
    color: status === option.value ? option.textColor : '#1F2937',
    letterSpacing: '-0.2px',
  });

  const optionDescriptionStyle = (option) => ({
    fontSize: '13px',
    color: status === option.value ? option.textColor : '#6B7280',
    fontWeight: '400',
  });

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '20px',
    borderTop: '1px solid #E5E7EB',
  };

  const baseButtonStyle = {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '-0.2px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  };

  const secondaryButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#F3F4F6',
    color: '#374151',
  };

  const primaryButtonStyle = {
    ...baseButtonStyle,
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    color: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.3)',
  };

  const buttonDisabledStyle = {
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={headerStyle}>
            <div style={titleContainerStyle}>
              <h2 style={titleStyle}>Update Order Status</h2>
              <p style={subtitleStyle}>Order #{order?._id?.slice(-8).toUpperCase()}</p>
            </div>
            <button
              onClick={onClose}
              style={closeButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.target.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} style={formStyle}>
            <label style={labelStyle}>
              Select New Status
            </label>
            <div style={optionsContainerStyle}>
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  style={getOptionLabelStyle(option)}
                  onMouseEnter={() => setSelectedHover(option.value)}
                  onMouseLeave={() => setSelectedHover(null)}
                >
                  <div style={radioContainerStyle}>
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(e) => setStatus(e.target.value)}
                      style={radioStyle}
                    />
                    <div style={customRadioStyle(option)}>
                      {status === option.value && <div style={radioInnerDotStyle} />}
                    </div>
                  </div>
                  <span style={iconStyle}>{option.icon}</span>
                  <div style={optionContentStyle}>
                    <span style={optionTextStyle(option)}>{option.label}</span>
                    <span style={optionDescriptionStyle(option)}>{option.description}</span>
                  </div>
                </label>
              ))}
            </div>

            <div style={buttonContainerStyle}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  ...secondaryButtonStyle,
                  ...(isLoading ? buttonDisabledStyle : {}),
                }}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = '#E5E7EB';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = '#F3F4F6';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  ...primaryButtonStyle,
                  ...(isLoading ? buttonDisabledStyle : {}),
                }}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(102, 126, 234, 0.3)';
                  }
                }}
              >
                {isLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default StatusUpdateModal;
