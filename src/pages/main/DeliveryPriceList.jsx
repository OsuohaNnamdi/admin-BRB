// pages/main/DeliveryPriceList.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/DeliveryPriceList.css';
import Header from './Header';
import Sidebar from './Sidebar';
import SettingsPanel from '../../component/SettingsPanel';
import ApiService from '../../config/ApiService';
import { useAlert } from '../../context/alert/AlertContext';
import DeliveryPriceModal from '../../component/delivery/DeliveryPriceModal';

const DeliveryPriceList = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, showLoading, removeAlert } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch delivery prices
  const fetchDeliveryPrices = useCallback(async () => {
    setLoading(true);
    let loadingAlertId = null;
    
    try {
      loadingAlertId = showLoading('Loading delivery prices...', 'Fetching Data');
      
      const response = await ApiService.getAdminDeliveryPrices();
      console.log('Delivery prices fetched:', response.data);
      
      const pricesData = response.data.delivery_prices || response.data || [];
      setPrices(pricesData);
      
      if (loadingAlertId) removeAlert(loadingAlertId);
      
    } catch (error) {
      console.error('Error fetching delivery prices:', error);
      
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      if (error.response?.status === 401) {
        showError('Your session has expired. Please login again.', 'Authentication Required');
      } else if (error.response?.status === 403) {
        showError('You do not have permission to view delivery prices.', 'Access Denied');
      } else if (error.message === 'Network Error') {
        showError('Unable to connect to the server.', 'Connection Error');
      } else {
        showError('Failed to load delivery prices. Please try refreshing.', 'Load Failed');
      }
      
      setPrices([]);
    } finally {
      setLoading(false);
    }
  }, [showLoading, showError, removeAlert]);

  const createDeliveryPrice = async (priceData) => {
    const response = await ApiService.createDeliveryPrice(priceData);
    return response.data;
  };

  const updateDeliveryPrice = async (id, priceData) => {
    const response = await ApiService.updateDeliveryPrice(id, priceData);
    return response.data;
  };

  const deleteDeliveryPrice = async (id) => {
    await ApiService.deleteDeliveryPrice(id);
  };

  useEffect(() => {
    fetchDeliveryPrices();
  }, [fetchDeliveryPrices]);

  const handleEdit = (price) => {
    setSelectedPrice(price);
    setModalOpen(true);
  };

  const handleDelete = (price) => {
    setSelectedPrice(price);
    setDeleteModalOpen(true);
  };

  const handleAdd = () => {
    navigate('/add-delivery');
  };

  const handleModalSubmit = async (priceData) => {
    let loadingAlertId = null;
    
    try {
      loadingAlertId = showLoading(
        selectedPrice ? 'Updating delivery price...' : 'Creating delivery price...', 
        'Processing'
      );
      
      if (selectedPrice) {
        await updateDeliveryPrice(selectedPrice.id, priceData);
        if (loadingAlertId) removeAlert(loadingAlertId);
        showSuccess('Delivery price updated successfully!', 'Update Successful');
      } else {
        await createDeliveryPrice(priceData);
        if (loadingAlertId) removeAlert(loadingAlertId);
        showSuccess('Delivery price created successfully!', 'Creation Successful');
      }
      
      await fetchDeliveryPrices();
      setModalOpen(false);
      setSelectedPrice(null);
      
    } catch (error) {
      console.error('Error saving delivery price:', error);
      
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      if (error.response?.data?.error) {
        showError(error.response.data.error, selectedPrice ? 'Update Failed' : 'Creation Failed');
      } else if (error.response?.status === 400) {
        showError('Invalid data. Please check your inputs.', 'Validation Error');
      } else if (error.response?.status === 401) {
        showError('Your session has expired. Please login again.', 'Authentication Required');
      } else if (error.response?.status === 403) {
        showError('You do not have permission to manage delivery prices.', 'Access Denied');
      } else if (error.response?.status === 409) {
        showWarning('A delivery price for this location already exists.', 'Duplicate Entry');
      } else {
        showError(`Failed to ${selectedPrice ? 'update' : 'create'} delivery price.`, 'Operation Failed');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedPrice) {
      setDeleteLoading(true);
      let loadingAlertId = null;
      
      try {
        loadingAlertId = showLoading('Deleting delivery price...', 'Processing');
        
        await deleteDeliveryPrice(selectedPrice.id);
        
        if (loadingAlertId) removeAlert(loadingAlertId);
        showSuccess('Delivery price deleted successfully!', 'Deletion Successful');
        
        await fetchDeliveryPrices();
        setDeleteModalOpen(false);
        setSelectedPrice(null);
        
      } catch (error) {
        console.error('Error deleting delivery price:', error);
        
        if (loadingAlertId) removeAlert(loadingAlertId);
        
        if (error.response?.data?.error) {
          showError(error.response.data.error, 'Deletion Failed');
        } else if (error.response?.status === 400) {
          showWarning('Cannot delete this delivery price. It may be in use.', 'Cannot Delete');
        } else if (error.response?.status === 401) {
          showError('Your session has expired. Please login again.', 'Authentication Required');
        } else if (error.response?.status === 403) {
          showError('You do not have permission to delete delivery prices.', 'Access Denied');
        } else if (error.response?.status === 404) {
          showError('Delivery price not found. It may have been already deleted.', 'Not Found');
        } else {
          showError('Failed to delete delivery price. Please try again.', 'Deletion Failed');
        }
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Filter prices based on search and status
  const filteredPrices = prices.filter(price => {
    const matchesSearch = 
      price.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && price.is_active) ||
      (statusFilter === 'inactive' && !price.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(parseFloat(price));
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
              
              <div className="delivery-price-list-container">
                <div className="delivery-price-list-header">
                  <div className="header-content">
                    <h1>Delivery Prices</h1>
                    <p>Manage delivery pricing for different locations</p>
                  </div>
                  <button 
                    className="add-delivery-price-btn"
                    onClick={handleAdd}
                  >
                    <span>+ Add Delivery Price</span>
                  </button>
                </div>

                <div className="delivery-price-list-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search by city, state, or country..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  
                  <div className="filter-controls">
                    <select 
                      className="filter-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="delivery-price-list-content">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading delivery prices...</p>
                    </div>
                  ) : filteredPrices.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <h3>No delivery prices found</h3>
                      <p>
                        {searchTerm || statusFilter !== 'all'
                          ? 'No delivery prices match your filters. Try different criteria.'
                          : 'Get started by adding your first delivery price configuration.'
                        }
                      </p>
                      {!searchTerm && statusFilter === 'all' && (
                        <button 
                          className="add-delivery-price-btn empty-state-btn"
                          onClick={handleAdd}
                        >
                          + Add Your First Delivery Price
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="delivery-prices-grid">
                      {filteredPrices.map(price => (
                        <div key={price.id} className="delivery-price-card">
                          <div className="delivery-price-card-header">
                            <div className="location-info">
                              <h3 className="city-name">{price.city}</h3>
                              <span className="state-name">{price.state}, {price.country}</span>
                            </div>
                            <span className={`status-badge ${price.is_active ? 'active' : 'inactive'}`}>
                              {price.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="delivery-price-card-body">
                            <div className="price-display">
                              <span className="price-label">Delivery Fee:</span>
                              <span className="price-value">{formatPrice(price.price)}</span>
                            </div>
                          </div>
                          
                          <div className="delivery-price-card-actions">
                            <button 
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(price)}
                            >
                              <span>Edit</span>
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(price)}
                            >
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!loading && filteredPrices.length > 0 && (
                  <div className="delivery-price-list-footer">
                    <div className="pagination-info">
                      Showing {filteredPrices.length} of {prices.length} delivery prices
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* Delivery Price Modal */}
      <DeliveryPriceModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPrice(null);
        }}
        onSubmit={handleModalSubmit}
        deliveryPrice={selectedPrice}
      />
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Delete Delivery Price</h3>
            </div>
            <div className="delete-modal-content">
              <div className="warning-icon">⚠️</div>
              <p>
                Are you sure you want to delete the delivery price for{' '}
                <strong>"{selectedPrice?.city}, {selectedPrice?.state}"</strong>?
              </p>
            </div>
            <div className="delete-modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedPrice(null);
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <span className="delete-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPriceList;