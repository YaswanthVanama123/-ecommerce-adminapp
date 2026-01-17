import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [notificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return 'A';
  };

  // Styles
  const headerStyle = {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
    boxShadow: isScrolled
      ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
      : '0 2px 8px rgba(0, 0, 0, 0.2)',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const containerStyle = {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '72px',
    gap: '24px',
  };

  const leftSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    flex: '0 0 auto',
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    cursor: 'pointer',
  };

  const logoIconStyle = {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
  };

  const logoTextStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.02em',
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.2',
  };

  const logoSubtextStyle = {
    fontSize: '11px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };

  const centerSectionStyle = {
    flex: '1',
    maxWidth: '600px',
    display: 'flex',
    justifyContent: 'center',
  };

  const searchContainerStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '500px',
  };

  const searchWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: searchFocused
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    border: searchFocused
      ? '2px solid rgba(59, 130, 246, 0.6)'
      : '2px solid transparent',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: searchFocused
      ? '0 4px 16px rgba(59, 130, 246, 0.3)'
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const searchIconStyle = {
    position: 'absolute',
    left: '16px',
    fontSize: '18px',
    color: searchFocused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
    transition: 'color 0.3s ease',
    pointerEvents: 'none',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '12px 48px 12px 48px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#ffffff',
    fontWeight: '400',
    letterSpacing: '0.01em',
  };

  const searchClearStyle = {
    position: 'absolute',
    right: '16px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '6px',
    width: '24px',
    height: '24px',
    display: searchValue ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  };

  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: '0 0 auto',
  };

  const quickActionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const quickActionButtonStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '10px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff',
    fontSize: '18px',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
    position: 'relative',
  };

  const notificationButtonStyle = {
    ...quickActionButtonStyle,
    position: 'relative',
  };

  const notificationBadgeStyle = {
    position: 'absolute',
    top: '6px',
    right: '6px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#ffffff',
    borderRadius: '10px',
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    padding: '0 5px',
    border: '2px solid #1e293b',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
  };

  const dividerStyle = {
    width: '1px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.15)',
  };

  const userSectionStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    padding: '6px 12px 6px 6px',
    borderRadius: '12px',
    background: showUserMenu
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(255, 255, 255, 0.1)',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
    flexShrink: 0,
  };

  const userInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const userNameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: '1.2',
  };

  const userRoleStyle = {
    fontSize: '12px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: '1.2',
  };

  const dropdownIconStyle = {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    transition: 'transform 0.2s ease',
    transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
  };

  const dropdownMenuStyle = {
    position: 'absolute',
    top: '56px',
    right: '0',
    minWidth: '240px',
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    display: showUserMenu ? 'block' : 'none',
    animation: showUserMenu ? 'fadeIn 0.2s ease' : 'none',
  };

  const notificationDropdownStyle = {
    ...dropdownMenuStyle,
    display: showNotifications ? 'block' : 'none',
    minWidth: '320px',
    maxHeight: '400px',
    overflowY: 'auto',
  };

  const dropdownItemStyle = {
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'transparent',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    textDecoration: 'none',
  };

  const dropdownItemIconStyle = {
    fontSize: '18px',
    width: '24px',
    textAlign: 'center',
  };

  const dropdownItemTextStyle = {
    fontSize: '14px',
    fontWeight: '500',
    flex: '1',
  };

  const logoutItemStyle = {
    ...dropdownItemStyle,
    color: '#ef4444',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    borderBottom: 'none',
  };

  const mobileMenuButtonStyle = {
    display: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '10px',
    width: '40px',
    height: '40px',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff',
    fontSize: '20px',
    backdropFilter: 'blur(10px)',
  };

  const mobileMenuStyle = {
    display: 'none',
    position: 'fixed',
    top: '72px',
    left: 0,
    right: 0,
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    padding: '16px',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: 'calc(100vh - 72px)',
    overflowY: 'auto',
  };

  const mobileSearchStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
  };

  const mobileActionStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const notificationItemStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const notificationTitleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '4px',
  };

  const notificationTextStyle = {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '6px',
  };

  const notificationTimeStyle = {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
  };

  // Media query for mobile
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  const isMobile = mediaQuery.matches;

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        {/* Left Section - Logo */}
        <div style={leftSectionStyle}>
          <div style={logoStyle} onClick={() => navigate('/dashboard')}>
            <div style={logoIconStyle}>A</div>
            <div style={logoTextStyle}>
              <span>Admin Portal</span>
              <span style={logoSubtextStyle}>Management System</span>
            </div>
          </div>
        </div>

        {/* Center Section - Search Bar (Desktop) */}
        {!isMobile && (
          <div style={centerSectionStyle}>
            <div style={searchContainerStyle}>
              <div style={searchWrapperStyle}>
                <span style={searchIconStyle}>🔍</span>
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  style={searchInputStyle}
                />
                <button
                  style={searchClearStyle}
                  onClick={() => setSearchValue('')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Section - Actions & User */}
        {!isMobile && (
          <div style={rightSectionStyle}>
            {/* Quick Actions */}
            <div style={quickActionsStyle}>
              <button
                style={quickActionButtonStyle}
                onClick={() => navigate('/dashboard/settings')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                title="Settings"
              >
                ⚙️
              </button>

              <button
                style={quickActionButtonStyle}
                onClick={() => navigate('/dashboard/analytics')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                title="Analytics"
              >
                📊
              </button>

              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  style={notificationButtonStyle}
                  onClick={() => setShowNotifications(!showNotifications)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  title="Notifications"
                >
                  🔔
                  {notificationCount > 0 && (
                    <span style={notificationBadgeStyle}>{notificationCount}</span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <div style={notificationDropdownStyle}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>
                      Notifications
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}>
                      Mark all read
                    </span>
                  </div>
                  <div
                    style={notificationItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={notificationTitleStyle}>New user registered</div>
                    <div style={notificationTextStyle}>John Doe just created an account</div>
                    <div style={notificationTimeStyle}>5 minutes ago</div>
                  </div>
                  <div
                    style={notificationItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={notificationTitleStyle}>System update</div>
                    <div style={notificationTextStyle}>New features are now available</div>
                    <div style={notificationTimeStyle}>1 hour ago</div>
                  </div>
                  <div
                    style={notificationItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={notificationTitleStyle}>Report generated</div>
                    <div style={notificationTextStyle}>Monthly analytics report is ready</div>
                    <div style={notificationTimeStyle}>3 hours ago</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={dividerStyle}></div>

            {/* User Section */}
            <div style={{ position: 'relative' }}>
              <div
                style={userSectionStyle}
                onClick={() => setShowUserMenu(!showUserMenu)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  if (!showUserMenu) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <div style={avatarStyle}>{getUserInitials()}</div>
                <div style={userInfoStyle}>
                  <div style={userNameStyle}>{user?.name || 'Admin User'}</div>
                  <div style={userRoleStyle}>{user?.role || 'Administrator'}</div>
                </div>
                <span style={dropdownIconStyle}>▼</span>
              </div>

              {/* User Dropdown Menu */}
              <div style={dropdownMenuStyle}>
                <div
                  style={dropdownItemStyle}
                  onClick={() => navigate('/dashboard/profile')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={dropdownItemIconStyle}>👤</span>
                  <span style={dropdownItemTextStyle}>My Profile</span>
                </div>
                <div
                  style={dropdownItemStyle}
                  onClick={() => navigate('/dashboard/settings')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={dropdownItemIconStyle}>⚙️</span>
                  <span style={dropdownItemTextStyle}>Account Settings</span>
                </div>
                <div
                  style={dropdownItemStyle}
                  onClick={() => navigate('/dashboard/activity')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={dropdownItemIconStyle}>📋</span>
                  <span style={dropdownItemTextStyle}>Activity Log</span>
                </div>
                <div
                  style={dropdownItemStyle}
                  onClick={() => navigate('/dashboard/help')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={dropdownItemIconStyle}>❓</span>
                  <span style={dropdownItemTextStyle}>Help & Support</span>
                </div>
                <div
                  style={logoutItemStyle}
                  onClick={handleLogout}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={dropdownItemIconStyle}>🚪</span>
                  <span style={dropdownItemTextStyle}>Logout</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            style={{
              ...mobileMenuButtonStyle,
              display: 'flex',
            }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && isMobileMenuOpen && (
        <div style={{
          ...mobileMenuStyle,
          display: 'flex',
        }}>
          {/* Mobile Search */}
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={mobileSearchStyle}
          />

          {/* Mobile User Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
          }}>
            <div style={avatarStyle}>{getUserInitials()}</div>
            <div>
              <div style={userNameStyle}>{user?.name || 'Admin User'}</div>
              <div style={userRoleStyle}>{user?.role || 'Administrator'}</div>
            </div>
          </div>

          {/* Mobile Actions */}
          <button
            style={mobileActionStyle}
            onClick={() => navigate('/dashboard/profile')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <span>👤</span>
            <span>My Profile</span>
          </button>

          <button
            style={mobileActionStyle}
            onClick={() => {
              setShowNotifications(!showNotifications);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <span>🔔</span>
            <span>Notifications</span>
            {notificationCount > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#ef4444',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: '700',
              }}>
                {notificationCount}
              </span>
            )}
          </button>

          <button
            style={mobileActionStyle}
            onClick={() => navigate('/dashboard/settings')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>

          <button
            style={mobileActionStyle}
            onClick={() => navigate('/dashboard/analytics')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <span>📊</span>
            <span>Analytics</span>
          </button>

          <div style={{
            height: '1px',
            background: 'rgba(255, 255, 255, 0.1)',
            margin: '8px 0',
          }}></div>

          <button
            style={{
              ...mobileActionStyle,
              color: '#ef4444',
            }}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Inline Animation Styles */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          @media (max-width: 768px) {
            header > div {
              padding: 0 16px;
              height: 64px;
            }
          }

          /* Scrollbar styles for notifications */
          div::-webkit-scrollbar {
            width: 6px;
          }

          div::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }

          div::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }

          div::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}
      </style>
    </header>
  );
};

export default Header;
