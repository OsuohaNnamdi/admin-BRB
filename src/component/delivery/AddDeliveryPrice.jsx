// pages/main/AddDeliveryPrice.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/DeliveryPriceForm.css';
import Header from '../../pages/main/Header';
import Sidebar from '../../pages/main/Sidebar';
import DeliveryPriceForm from './DeliveryPriceForm';
import ApiService from '../../config/ApiService';
import { useAlert } from '../../context/alert/AlertContext';
import SettingsPanel from '../SettingsPanel';

const AddDeliveryPrice = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    let loadingAlertId = null;
    
    try {
      loadingAlertId = showLoading('Creating delivery price...', 'Processing');
      
      await ApiService.createDeliveryPrice(formData);
      
      if (loadingAlertId) removeAlert(loadingAlertId);
      showSuccess('Delivery price created successfully!', 'Success');
      
      // Navigate back to delivery prices list
      navigate('/admin/delivery-prices');
      
    } catch (error) {
      console.error('Error creating delivery price:', error);
      
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      if (error.response?.data?.error) {
        showError(error.response.data.error, 'Creation Failed');
      } else if (error.response?.status === 400) {
        showError('Invalid data. Please check your inputs.', 'Validation Error');
      } else if (error.response?.status === 401) {
        showError('Your session has expired. Please login again.', 'Authentication Required');
      } else if (error.response?.status === 403) {
        showError('You do not have permission to create delivery prices.', 'Access Denied');
      } else if (error.message === 'Network Error') {
        showError('Unable to connect to the server. Please check your connection.', 'Connection Error');
      } else {
        showError('Failed to create delivery price. Please try again.', 'Creation Failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="__variable_9eb1a5 body">
      <div className="menu-style"></div>
      <div className="layout-width"></div>
      
      <div id="wrapper">
        <div id="page">
          <div className="layout-wrap">
            <Sidebar 
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              onClose={closeSidebar}
            />
            <div className="section-content-right">
              <Header
                onToggleSidebar={toggleSidebar}
                onSettingsClick={() => setSettingsOpen(true)} 
              />
              
              <div className="delivery-price-page-container">
                <div className="delivery-price-page-header">
                  <div className="header-content">
                    <h1>Add New Delivery Price</h1>
                    <p>Configure delivery pricing for specific locations</p>
                  </div>
                  <button 
                    className="back-btn"
                    onClick={() => navigate('/delivery-prices')}
                  >
                    ← Back to List
                  </button>
                </div>
                
                <DeliveryPriceForm 
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default AddDeliveryPrice;