// components/Header.js
import React, { useState, useRef, useEffect } from 'react';
import '../../styles/Header.css';

const Header = ({ onToggleSidebar, onSettingsClick }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close other dropdowns when one opens
  const openDropdown = (dropdownName) => {
    setShowNotifications(dropdownName === 'notifications');
    setShowMessages(dropdownName === 'messages');
    setShowUserMenu(dropdownName === 'user');
  };

  const handleHamburgerClick = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header-container">
        {/* Left Section */}
        <div className="admin-header-left">
          {/* Hamburger Menu - Only visible on mobile */}
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
                onFocus={() => setShowSearch(true)}
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearch && (
              <div className="admin-search-results">
                <div className="admin-search-section">
                  <h4 className="admin-section-title">Quick Links</h4>
                  <div className="admin-search-item">
                    <div className="admin-menu-icon">📊</div>
                    <div className="admin-product-info">
                      <span className="admin-product-name">View Analytics Dashboard</span>
                      <span className="admin-product-category">Dashboard</span>
                    </div>
                  </div>
                  <div className="admin-search-item">
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
          <div className="admin-header-item admin-dropdown-container">
            <button 
              className="admin-icon-button admin-notification-button"
              onClick={() => openDropdown('notifications')}
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
                  <div className="admin-notification-item admin-unread">
                    <div className="admin-notification-icon">⭐</div>
                    <div className="admin-notification-content">
                      <p className="admin-notification-title">New Product Review</p>
                      <p className="admin-notification-message">Customer left a 5-star review</p>
                      <span className="admin-notification-time">1 hour ago</span>
                    </div>
                  </div>
                </div>
                <div className="admin-dropdown-footer">
                  <a href="/notifications" className="admin-view-all">View all notifications</a>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="admin-header-item admin-dropdown-container">
            <button 
              className="admin-icon-button admin-message-button"
              onClick={() => openDropdown('messages')}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <path d="M2 2a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H2zm12 1a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1h12zM3 5.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zM3 8a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5A.5.5 0 013 8z"/>
              </svg>
              <span className="admin-notification-badge">2</span>
            </button>

            {showMessages && (
              <div className="admin-dropdown-menu admin-message-menu">
                <div className="admin-dropdown-header">
                  <h3>Messages</h3>
                  <span className="admin-badge">2 unread</span>
                </div>
                <div className="admin-dropdown-content">
                  <div className="admin-message-item admin-unread">
                    <div className="admin-message-avatar">
                      <div className="admin-avatar-placeholder">SJ</div>
                    </div>
                    <div className="admin-message-content">
                      <div className="admin-message-header">
                        <span className="admin-message-sender">Sarah Johnson</span>
                        <span className="admin-message-time">5 min ago</span>
                      </div>
                      <p className="admin-message-preview">Hi, I have a question about my order...</p>
                    </div>
                  </div>
                </div>
                <div className="admin-dropdown-footer">
                  <a href="/messages" className="admin-view-all">View all messages</a>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="admin-header-item admin-dropdown-container">
            <button 
              className="admin-user-menu-button"
              onClick={() => openDropdown('user')}
            >
              <div className="admin-user-avatar">
                <div className="admin-avatar-placeholder">KW</div>
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">Kristin Watson</span>
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
                    <div className="admin-avatar-placeholder">KW</div>
                  </div>
                  <div className="admin-user-details">
                    <span className="admin-user-name">Kristin Watson</span>
                    <span className="admin-user-email">kristin@brbbeauty.com</span>
                  </div>
                </div>
                <div className="admin-dropdown-content">
                  <a href="/profile" className="admin-menu-item">
                    <span className="admin-menu-icon">👤</span>
                    <span className="admin-menu-text">Profile</span>
                  </a>
                  <a href="/settings" className="admin-menu-item">
                    <span className="admin-menu-icon">⚙️</span>
                    <span className="admin-menu-text">Settings</span>
                  </a>
                  <a href="/billing" className="admin-menu-item">
                    <span className="admin-menu-icon">💳</span>
                    <span className="admin-menu-text">Billing</span>
                  </a>
                  <div className="admin-menu-divider" />
                  <a href="/logout" className="admin-menu-item admin-danger">
                    <span className="admin-menu-icon">🚪</span>
                    <span className="admin-menu-text">Logout</span>
                  </a>
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