// components/Header.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Header.css';
import ApiService from '../../config/ApiService';
import { useAlert } from '../../context/alert/AlertContext';

const Header = ({ onToggleSidebar, onSettingsClick }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);
  const userMenuRef = useRef(null);
  
  const navigate = useNavigate();
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await ApiService.getProfile();
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setShowMessages(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close dropdowns when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowMessages(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  // Close other dropdowns when one opens
  const openDropdown = (dropdownName) => {
    setShowNotifications(dropdownName === 'notifications');
    setShowMessages(dropdownName === 'messages');
    setShowUserMenu(dropdownName === 'user');
    setShowSearch(dropdownName === 'search');
  };

  const handleHamburgerClick = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const loadingAlertId = showLoading('Signing out...', 'Logout');

    try {
      await ApiService.adminLogout();
      removeAlert(loadingAlertId);
      showSuccess('You have been successfully logged out.', 'Goodbye!');
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      console.error('Logout failed:', error);
      removeAlert(loadingAlertId);
      await ApiService.removeToken();
      
      showError(
        'There was an issue during logout, but you have been signed out locally.',
        'Logout Warning',
        { duration: 4000 }
      );
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    setShowUserMenu(false);
    navigate('/profile');
  };

  const getInitials = () => {
    if (!userProfile) return 'U';
    const first = userProfile.first_name?.charAt(0) || '';
    const last = userProfile.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getFullName = () => {
    if (!userProfile) return 'User';
    return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'User';
  };

  const getDisplayName = () => {
    if (!userProfile) return 'Loading...';
    return userProfile.first_name || userProfile.email?.split('@')[0] || 'User';
  };

  return (
    <header className="admin-header">
      <div className="admin-header-container">
        {/* Left Section */}
        <div className="admin-header-left">
          {isMobile && (
            <button 
              className="admin-sidebar-toggle"
              onClick={handleHamburgerClick}
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* Search Bar */}
          <div className="admin-search-container" ref={searchRef}>
            <div className="admin-search-input-wrapper">
              <svg className="admin-search-icon" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className="admin-search-input"
                onFocus={() => openDropdown('search')}
              />
            </div>

            {showSearch && (
              <div className="admin-search-results">
                <div className="admin-search-section">
                  <h4 className="admin-section-title">Quick Links</h4>
                  <div 
                    className="admin-search-item"
                   // onClick={() => handleQuickLinkClick('/')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="admin-menu-icon">📊</div>
                    <div className="admin-product-info">
                      <span className="admin-product-name">View Analytics Dashboard</span>
                      <span className="admin-product-category">Dashboard</span>
                    </div>
                  </div>
                  <div 
                    className="admin-search-item"
                   // onClick={() => handleQuickLinkClick('/product')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="admin-menu-icon">🛍️</div>
                    <div className="admin-product-info">
                      <span className="admin-product-name">Manage Products</span>
                      <span className="admin-product-category">Products</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="admin-header-right">
          {/* Notifications */}
          <div className="admin-header-item admin-dropdown-container" ref={notificationsRef}>
            <button 
              className="admin-icon-button admin-notification-button"
              onClick={() => openDropdown('notifications')}
              disabled={isLoggingOut}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L14 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
              </svg>
              <span className="admin-notification-badge">3</span>
            </button>

            {showNotifications && (
              <div className="admin-dropdown-menu admin-notification-menu">
                <div className="admin-dropdown-header">
                  <h3>Notifications</h3>
                  <span className="admin-badge">3 unread</span>
                </div>
                <div className="admin-dropdown-content">
                  <div className="admin-notification-item admin-unread">
                    <div className="admin-notification-icon">📦</div>
                    <div className="admin-notification-content">
                      <p className="admin-notification-title">New Order Received</p>
                      <p className="admin-notification-message">Order #BRB-2024-001 has been placed</p>
                      <span className="admin-notification-time">2 min ago</span>
                    </div>
                  </div>
                </div>
                <div className="admin-dropdown-footer">
                  <button className="admin-view-all">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="admin-header-item admin-dropdown-container" ref={userMenuRef}>
            <button 
              className="admin-user-menu-button"
              onClick={() => openDropdown('user')}
              disabled={isLoggingOut}
            >
              <div className="admin-user-avatar">
                <div className="admin-avatar-placeholder">{getInitials()}</div>
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">{getDisplayName()}</span>
                <span className="admin-user-role">Administrator</span>
              </div>
              <svg className="admin-chevron" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {showUserMenu && (
              <div className="admin-dropdown-menu admin-user-menu">
                <div className="admin-user-menu-header">
                  <div className="admin-user-avatar admin-large">
                    <div className="admin-avatar-placeholder">{getInitials()}</div>
                  </div>
                  <div className="admin-user-details">
                    <span className="admin-user-name">{getFullName()}</span>
                    <span className="admin-user-email">{userProfile?.email || 'Loading...'}</span>
                  </div>
                </div>
                <div className="admin-dropdown-content">
                  <button 
                    className="admin-menu-item"
                    onClick={handleProfileClick}
                  >
                    <span className="admin-menu-icon">👤</span>
                    <span className="admin-menu-text">Profile</span>
                  </button>
                  
                  <div className="admin-menu-divider" />
                  <button 
                    className="admin-menu-item admin-danger"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <span className="admin-menu-icon">
                      {isLoggingOut ? '⏳' : '🚪'}
                    </span>
                    <span className="admin-menu-text">
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;