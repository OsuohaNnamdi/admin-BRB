// components/Sidebar.js
import React, { useState, useEffect } from 'react';
import '../../styles/Sidebar.css';

const Sidebar = ({ isOpen, onToggle, onClose }) => {
  const [openMenus, setOpenMenus] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleCloseMobileMenu = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Menu items
  const menuItems = [
    {
      title: "Dashboard",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
      ),
      href: "/",
      type: "link"
    },
    {
      title: "Products",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
        </svg>
      ),
      type: "submenu",
      items: [
        { text: "Add Product", href: "/add-product" },
        { text: "List Products", href: "/product" }
      ]
    },
     {
    title: "Banners",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v2H2V4z"/>
        <path fillRule="evenodd" d="M2 8h16v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8zm4 2a1 1 0 11-2 0 1 1 0 012 0zm9-1a1 1 0 100 2 1 1 0 000-2zm-5 5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
      </svg>
    ),
    type: "submenu",
    items: [
      { text: "Add Banner", href: "/add-banner" },
      { text: "List Banners", href: "/banner" }
    ]
  },
    {
      title: "Categories",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M17 10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h12a1 1 0 011 1v6zm0 4a1 1 0 01-1 1H4a1 1 0 01-1-1v-1h14v1zM3 16a1 1 0 001 1h12a1 1 0 001-1v-1H3v1z" clipRule="evenodd"/>
        </svg>
      ),
      type: "submenu",
      items: [
        { text: "Add Category", href: "/add-category" },
        { text: "List Categories", href: "/category" }
      ]
    },
    {
      title: "Orders",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
        </svg>
      ),
      href: "/orders",
      type: "link"
    },
    {
      title: "Reviews",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd"/>
        </svg>
      ),
      href: "/reviews",
      type: "link"
    },
    {
      title: "Support",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd"/>
        </svg>
      ),
      href: "/support",
      type: "link"
    },
    {
      title: "Inventory",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
        </svg>
      ),
      href: "/inventory",
      type: "link"
    }
  ];

  const renderMenuItem = (item, index) => {
    if (item.type === "submenu") {
      const isOpen = openMenus[item.title];
      return (
        <li key={index} className={`menu-item has-children ${isOpen ? 'open' : ''}`}>
          <button 
            className="menu-item-button" 
            onClick={() => toggleMenu(item.title)}
            aria-expanded={isOpen}
          >
            <div className="menu-icon">{item.icon}</div>
            <span className="menu-text">{item.title}</span>
            <div className="menu-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
          </button>
          <ul className="sub-menu">
            {item.items.map((subItem, subIndex) => (
              <li key={subIndex} className="sub-menu-item">
                <a 
                  href={subItem.href} 
                  onClick={handleCloseMobileMenu}
                  className="sub-menu-link"
                >
                  {subItem.text}
                </a>
              </li>
            ))}
          </ul>
        </li>
      );
    } else {
      return (
        <li key={index} className="menu-item">
          <a 
            href={item.href} 
            className="menu-item-link"
            onClick={handleCloseMobileMenu}
          >
            <div className="menu-icon">{item.icon}</div>
            <span className="menu-text">{item.title}</span>
          </a>
        </li>
      );
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <span>BRB</span>
            </div>
            <span className="brand-text">BRB Beauty</span>
          </div>
          <button 
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M18.278 16.864a1 1 0 01-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 01-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 011.414-1.414l4.829 4.828 4.828-4.828a1 1 0 111.414 1.414l-4.828 4.829 4.828 4.828z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="menu-list">
            {menuItems.map(renderMenuItem)}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;