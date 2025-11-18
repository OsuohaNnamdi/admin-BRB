// components/AlertContainer.js
import React, { useEffect, useState } from 'react';
import '../../styles/Alerts.css';
import { useAlert } from './AlertContext';

const AlertContainer = () => {
  const { alerts, removeAlert } = useAlert();
  const [visibleAlerts, setVisibleAlerts] = useState([]);

  useEffect(() => {
    setVisibleAlerts(alerts);
  }, [alerts]);

  const handleRemoveAlert = (id) => {
    // First mark as exiting
    setVisibleAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, exiting: true } : alert
      )
    );
    
    // Then remove after animation
    setTimeout(() => {
      removeAlert(id);
    }, 300);
  };

  const getAlertIcon = (type) => {
    // Your existing icon code...
    switch (type) {
      case 'success':
        return (
          <div className="alert-icon success-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="alert-icon error-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="alert-icon warning-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M1 18H19L10 2L1 18ZM10 16C9.45 16 9 15.55 9 15C9 14.45 9.45 14 10 14C10.55 14 11 14.45 11 15C11 15.55 10.55 16 10 16ZM9 13H11V11H9V13Z" fill="currentColor"/>
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="alert-icon info-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="currentColor"/>
            </svg>
          </div>
        );
      case 'loading':
        return (
          <div className="alert-icon loading-icon">
            <div className="loading-spinner"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const getAlertClass = (type, exiting = false) => {
    const baseClass = 'alert';
    let typeClass = '';
    
    switch (type) {
      case 'success':
        typeClass = 'alert-success';
        break;
      case 'error':
        typeClass = 'alert-error';
        break;
      case 'warning':
        typeClass = 'alert-warning';
        break;
      case 'info':
        typeClass = 'alert-info';
        break;
      case 'loading':
        typeClass = 'alert-loading';
        break;
      default:
        typeClass = 'alert-info';
    }
    
    return `${baseClass} ${typeClass} ${exiting ? 'exiting' : ''}`;
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="alert-container top-right">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={getAlertClass(alert.type, alert.exiting)}
        >
          <div className="alert-content">
            {getAlertIcon(alert.type)}
            <div className="alert-body">
              {alert.title && <div className="alert-title">{alert.title}</div>}
              <div className="alert-message">{alert.message}</div>
            </div>
          </div>
          
          {alert.dismissible !== false && (
            <button
              className="alert-close"
              onClick={() => handleRemoveAlert(alert.id)}
              aria-label="Close alert"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
              </svg>
            </button>
          )}

          {alert.duration !== 0 && alert.type !== 'loading' && (
            <div 
              className="alert-progress"
              style={{ 
                animationDuration: `${alert.duration}ms`,
                animationPlayState: alert.exiting ? 'paused' : 'running'
              }}
            >
              <div className="alert-progress-bar"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AlertContainer;