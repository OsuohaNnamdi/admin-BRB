// contexts/AlertContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    console.warn('useAlert must be used within an AlertProvider');
    // Return a mock implementation for debugging
    return {
      alerts: [],
      addAlert: () => Date.now(),
      removeAlert: () => {},
      clearAlerts: () => {},
      showSuccess: (message, title) => {
        console.log('SUCCESS:', title, message);
        return Date.now();
      },
      showError: (message, title) => {
        console.log('ERROR:', title, message);
        return Date.now();
      },
      showWarning: (message, title) => {
        console.log('WARNING:', title, message);
        return Date.now();
      },
      showInfo: (message, title) => {
        console.log('INFO:', title, message);
        return Date.now();
      },
      showLoading: (message, title) => {
        console.log('LOADING:', title, message);
        return Date.now();
      },
    };
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((alert) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      type: 'info',
      duration: 5000,
      dismissible: true,
      position: 'top-right',
      ...alert,
      timestamp: Date.now(),
    };
    
    setAlerts(prev => [...prev, newAlert]);

    // Auto remove after duration
    if (newAlert.duration !== 0 && newAlert.type !== 'loading') {
      setTimeout(() => {
        removeAlert(id);
      }, newAlert.duration);
    }

    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Predefined alert methods
  const showSuccess = useCallback((message, title = 'Success', options = {}) => {
    return addAlert({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addAlert]);

  const showError = useCallback((message, title = 'Error', options = {}) => {
    return addAlert({
      type: 'error',
      title,
      message,
      ...options,
    });
  }, [addAlert]);

  const showWarning = useCallback((message, title = 'Warning', options = {}) => {
    return addAlert({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [addAlert]);

  const showInfo = useCallback((message, title = 'Information', options = {}) => {
    return addAlert({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addAlert]);

  const showLoading = useCallback((message, title = 'Loading', options = {}) => {
    return addAlert({
      type: 'loading',
      title,
      message,
      duration: 0, // Don't auto-remove loading alerts
      ...options,
    });
  }, [addAlert]);

  const value = {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};