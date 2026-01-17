import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Build navigation items - Banners menu is only visible to superadmin
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      badge: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    },
    {
      name: 'Products',
      href: '/products',
      badge: 124,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    },
    {
      name: 'Orders',
      href: '/orders',
      badge: 23,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )
    },
    {
      name: 'Categories',
      href: '/categories',
      badge: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      )
    },
    // Banners menu item - superadmin only access
    ...(user?.role === 'superadmin' ? [{
      name: 'Banners',
      href: '/banners',
      badge: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
          <polyline points="17 2 12 7 7 2"></polyline>
        </svg>
      )
    }] : []),
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Main sidebar container - fixed on desktop, overlay on mobile
  const sidebarContainerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: isMobile ? '280px' : (isCollapsed ? '80px' : '280px'),
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRight: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.05), 2px 0 4px -1px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // Overlay for mobile menu
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 999,
    display: isMobile && isMobileMenuOpen ? 'block' : 'none',
    opacity: isMobile && isMobileMenuOpen ? 1 : 0,
    transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // Mobile menu button
  const mobileMenuButtonStyle = {
    position: 'fixed',
    top: '16px',
    left: '16px',
    zIndex: 998,
    display: isMobile ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s ease-in-out',
  };

  // Logo/Brand section
  const logoSectionStyle = {
    padding: isCollapsed ? '28px 16px' : '28px 24px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#f3f4f6'}`,
    backgroundColor: isDarkMode ? '#111827' : '#fafafa',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    gap: '12px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const logoIconStyle = {
    width: '40px',
    height: '40px',
    backgroundColor: '#3b82f6',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px -1px rgba(59, 130, 246, 0.4)',
    transition: 'all 0.3s ease-in-out',
  };

  const logoTextContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    opacity: isCollapsed ? 0 : 1,
    transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const logoTitleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: isDarkMode ? '#f9fafb' : '#111827',
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    transition: 'color 0.3s ease-in-out',
  };

  const logoSubtitleStyle = {
    fontSize: '12px',
    fontWeight: '500',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    marginTop: '2px',
    transition: 'color 0.3s ease-in-out',
  };

  // Navigation section
  const navSectionStyle = {
    flex: 1,
    padding: isCollapsed ? '24px 8px' : '24px 16px',
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const navLabelStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: isDarkMode ? '#6b7280' : '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '0 12px',
    marginBottom: '12px',
    opacity: isCollapsed ? 0 : 1,
    transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const navListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const getLinkStyle = (itemHref) => {
    const active = isActive(itemHref);
    const hovered = hoveredItem === itemHref;

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      gap: '12px',
      padding: isCollapsed ? '12px' : '12px 16px',
      fontSize: '14px',
      fontWeight: active ? '600' : '500',
      borderRadius: '12px',
      textDecoration: 'none',
      position: 'relative',
      overflow: 'visible',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: active
        ? (isDarkMode ? '#1e40af' : '#eff6ff')
        : hovered
          ? (isDarkMode ? '#374151' : '#f9fafb')
          : 'transparent',
      color: active
        ? (isDarkMode ? '#ffffff' : '#2563eb')
        : hovered
          ? (isDarkMode ? '#f9fafb' : '#111827')
          : (isDarkMode ? '#d1d5db' : '#4b5563'),
      transform: hovered && !active && !isCollapsed ? 'translateX(4px)' : 'translateX(0)',
      boxShadow: active
        ? (isDarkMode
            ? '0 4px 14px 0 rgba(37, 99, 235, 0.3), 0 0 20px 0 rgba(37, 99, 235, 0.2)'
            : '0 4px 14px 0 rgba(37, 99, 235, 0.15), 0 0 20px 0 rgba(37, 99, 235, 0.1)')
        : 'none',
    };
  };

  const getIconContainerStyle = (itemHref) => {
    const active = isActive(itemHref);

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
      height: '20px',
      color: active ? (isDarkMode ? '#ffffff' : '#3b82f6') : 'inherit',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      filter: active ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))' : 'none',
    };
  };

  const activeIndicatorStyle = (itemHref) => {
    const active = isActive(itemHref);

    return {
      position: 'absolute',
      left: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4px',
      height: active ? '28px' : '0px',
      backgroundColor: isDarkMode ? '#60a5fa' : '#3b82f6',
      borderRadius: '0 6px 6px 0',
      opacity: active ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: active ? '0 0 12px rgba(59, 130, 246, 0.6)' : 'none',
    };
  };

  const badgeStyle = (isActive) => ({
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    backgroundColor: isActive
      ? (isDarkMode ? '#3b82f6' : '#2563eb')
      : (isDarkMode ? '#4b5563' : '#e5e7eb'),
    color: isActive
      ? '#ffffff'
      : (isDarkMode ? '#d1d5db' : '#6b7280'),
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isCollapsed ? 0 : 1,
    transform: isCollapsed ? 'scale(0)' : 'scale(1)',
    boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
  });

  const tooltipStyle = (show) => ({
    position: 'absolute',
    left: '70px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: isDarkMode ? '#374151' : '#111827',
    color: '#ffffff',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    opacity: show ? 1 : 0,
    pointerEvents: 'none',
    zIndex: 1001,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: show ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-10px)',
  });

  const tooltipArrowStyle = {
    position: 'absolute',
    left: '-4px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '0',
    height: '0',
    borderTop: '5px solid transparent',
    borderBottom: '5px solid transparent',
    borderRight: `5px solid ${isDarkMode ? '#374151' : '#111827'}`,
  };

  // Footer section
  const footerStyle = {
    padding: isCollapsed ? '16px 12px' : '16px 24px',
    borderTop: `1px solid ${isDarkMode ? '#374151' : '#f3f4f6'}`,
    backgroundColor: isDarkMode ? '#111827' : '#fafafa',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const footerContentStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'space-between',
    gap: '12px',
    padding: isCollapsed ? '12px' : '12px',
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: '12px',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isDarkMode
      ? '0 2px 8px rgba(0, 0, 0, 0.3)'
      : '0 1px 3px rgba(0, 0, 0, 0.05)',
  };

  const avatarStyle = {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease-in-out',
  };

  const userInfoStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    opacity: isCollapsed ? 0 : 1,
    transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const userNameStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: isDarkMode ? '#f9fafb' : '#111827',
    lineHeight: '1.3',
    transition: 'color 0.3s ease-in-out',
  };

  const userRoleStyle = {
    fontSize: '11px',
    fontWeight: '500',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    marginTop: '2px',
    transition: 'color 0.3s ease-in-out',
  };

  const profileMenuIconStyle = {
    flexShrink: 0,
    opacity: isCollapsed ? 0 : 1,
    transform: isCollapsed ? 'scale(0)' : 'scale(1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // Collapse toggle button
  const collapseButtonStyle = {
    position: 'absolute',
    top: '50%',
    right: '-12px',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
    border: `2px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
    borderRadius: '50%',
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 1001,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  // Dark mode toggle
  const darkModeToggleContainerStyle = {
    padding: isCollapsed ? '8px 12px' : '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'space-between',
    gap: '12px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const darkModeToggleLabelStyle = {
    fontSize: '13px',
    fontWeight: '500',
    color: isDarkMode ? '#d1d5db' : '#6b7280',
    opacity: isCollapsed ? 0 : 1,
    transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const darkModeToggleButtonStyle = (hovered) => ({
    width: '52px',
    height: '28px',
    backgroundColor: isDarkMode ? '#3b82f6' : '#e5e7eb',
    borderRadius: '14px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isDarkMode
      ? '0 0 20px rgba(59, 130, 246, 0.4)'
      : '0 2px 4px rgba(0, 0, 0, 0.1)',
    transform: hovered ? 'scale(1.05)' : 'scale(1)',
  });

  const darkModeToggleKnobStyle = {
    width: '22px',
    height: '22px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    position: 'absolute',
    top: '3px',
    left: isDarkMode ? '27px' : '3px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        style={mobileMenuButtonStyle}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isMobileMenuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      <div
        style={overlayStyle}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <div style={sidebarContainerStyle}>
        {/* Collapse Toggle Button */}
        <button
          style={collapseButtonStyle}
          onClick={() => setIsCollapsed(!isCollapsed)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDarkMode ? '#d1d5db' : '#6b7280'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Logo/Brand Section */}
        <div style={logoSectionStyle}>
          <div style={logoContainerStyle}>
            <div
              style={logoIconStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                e.currentTarget.style.boxShadow = '0 6px 20px -1px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.boxShadow = '0 4px 12px -1px rgba(59, 130, 246, 0.4)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            {!isCollapsed && (
              <div style={logoTextContainerStyle}>
                <div style={logoTitleStyle}>Admin Panel</div>
                <div style={logoSubtitleStyle}>Management Hub</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav style={navSectionStyle}>
          {!isCollapsed && <div style={navLabelStyle}>Main Menu</div>}
          <div style={navListStyle}>
            {navigation.map((item) => (
              <div
                key={item.name}
                style={{ position: 'relative' }}
                onMouseEnter={() => {
                  setHoveredItem(item.href);
                  if (isCollapsed) setHoveredTooltip(item.name);
                }}
                onMouseLeave={() => {
                  setHoveredItem(null);
                  setHoveredTooltip(null);
                }}
              >
                <Link
                  to={item.href}
                  style={getLinkStyle(item.href)}
                  onClick={() => isMobile && setIsMobileMenuOpen(false)}
                >
                  <div style={activeIndicatorStyle(item.href)} />
                  <div style={getIconContainerStyle(item.href)}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <>
                      <span style={{
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: 1,
                        transform: 'translateX(0)',
                      }}>
                        {item.name}
                      </span>
                      {item.badge && (
                        <div style={badgeStyle(isActive(item.href))}>
                          {item.badge}
                        </div>
                      )}
                    </>
                  )}
                </Link>
                {/* Tooltip for collapsed state */}
                {isCollapsed && hoveredTooltip === item.name && (
                  <div style={tooltipStyle(true)}>
                    <div style={tooltipArrowStyle}></div>
                    {item.name}
                    {item.badge && ` (${item.badge})`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Dark Mode Toggle */}
        <div style={darkModeToggleContainerStyle}>
          {!isCollapsed && (
            <div style={darkModeToggleLabelStyle}>
              Dark Mode
            </div>
          )}
          <div
            style={darkModeToggleButtonStyle(false)}
            onClick={() => setIsDarkMode(!isDarkMode)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={darkModeToggleKnobStyle}>
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isDarkMode ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div style={footerStyle}>
          <div
            style={footerContentStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 1px 3px rgba(0, 0, 0, 0.05)';
            }}
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          >
            <div
              style={avatarStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
            >
              AD
            </div>
            {!isCollapsed && (
              <>
                <div style={userInfoStyle}>
                  <div style={userNameStyle}>Admin User</div>
                  <div style={userRoleStyle}>Administrator</div>
                </div>
                <div style={profileMenuIconStyle}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isDarkMode ? '#9ca3af' : '#9ca3af'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: profileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
