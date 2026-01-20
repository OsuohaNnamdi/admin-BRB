import React, { useState, useEffect, useCallback } from 'react';
import '../../../styles/CouponList.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SettingsPanel from '../../../component/SettingsPanel';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';
import CouponModal from './CouponModal';
import SendCouponModal from './SendCouponModal';

const CouponList = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('all');
  const { showSuccess, showError, showWarning, showLoading, removeAlert } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // API functions with useCallback
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ApiService.getAdminCoupons();
      console.log('Coupons fetched:', response.data);
      setCoupons(response.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      showError(
        'Failed to load coupons. Please try again.',
        'Load Error',
        { duration: 5000 }
      );
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const deleteCoupon = async (id) => {
    try {
      await ApiService.deleteCoupon(id);
      console.log('Coupon deleted:', id);
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  };

  const sendCouponToEmails = async (couponId, emails) => {
    try {
      const response = await ApiService.sendCoupon(couponId, emails);
      console.log('Coupon sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending coupon:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setModalOpen(true);
  };

  const handleDelete = (coupon) => {
    setSelectedCoupon(coupon);
    setDeleteModalOpen(true);
  };

  const handleSend = (coupon) => {
    setSelectedCoupon(coupon);
    setSendModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCoupon(null);
    setModalOpen(true);
  };

  const handleModalSubmit = async (couponData) => {
    try {
      let loadingAlertId = showLoading(
        selectedCoupon ? 'Updating coupon...' : 'Creating coupon...',
        'Processing'
      );
      
      if (selectedCoupon) {
        // Update existing coupon
        await ApiService.updateCoupon(selectedCoupon.id, couponData);
        removeAlert(loadingAlertId);
        showSuccess('Coupon updated successfully!', 'Update Successful');
      } else {
        // Create new coupon
        await ApiService.createCoupon(couponData);
        removeAlert(loadingAlertId);
        showSuccess('Coupon created successfully!', 'Create Successful');
      }
      
      // Refresh coupons list
      await fetchCoupons();
      
      setModalOpen(false);
      setSelectedCoupon(null);
      
    } catch (error) {
      console.error('Error saving coupon:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        let errorMessage = 'Failed to save coupon. ';
        
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            errorMessage += `${key}: ${backendErrors[key].join(', ')} `;
          } else {
            errorMessage += `${key}: ${backendErrors[key]} `;
          }
        });
        
        showError(errorMessage.trim(), 'Save Failed', { duration: 6000 });
      } else if (error.response?.status === 400) {
        showError('Invalid coupon data. Please check all fields.', 'Validation Error', { duration: 5000 });
      } else if (error.response?.status === 401) {
        showError('Authentication required. Please login again.', 'Session Expired', { duration: 5000 });
      } else if (error.response?.status === 403) {
        showError('You do not have permission to manage coupons.', 'Access Denied', { duration: 5000 });
      } else if (error.response?.status === 404 && selectedCoupon) {
        showError('Coupon not found. It may have been deleted.', 'Not Found', { duration: 5000 });
      } else if (error.message === 'Network Error') {
        showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
      } else {
        showError('Failed to save coupon. Please try again.', 'Save Failed', { duration: 5000 });
      }
    }
  };

  const handleSendCoupon = async (couponId, emails) => {
    try {
      const loadingAlertId = showLoading('Sending coupon...', 'Processing');
      
      await sendCouponToEmails(couponId, emails);
      removeAlert(loadingAlertId);
      showSuccess(`Coupon sent successfully!`, 'Send Successful');
      
      setSendModalOpen(false);
      setSelectedCoupon(null);
      
    } catch (error) {
      console.error('Error sending coupon:', error);
      
      if (error.response?.data?.error) {
        showError(error.response.data.error, 'Send Failed', { duration: 5000 });
      } else if (error.response?.status === 400) {
        showError('Invalid email addresses. Please check the list.', 'Validation Error', { duration: 5000 });
      } else if (error.response?.status === 404) {
        showError('Coupon not found.', 'Not Found', { duration: 5000 });
      } else if (error.message === 'Network Error') {
        showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
      } else {
        showError('Failed to send coupon. Please try again.', 'Send Failed', { duration: 5000 });
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedCoupon) {
      try {
        const loadingAlertId = showLoading('Deleting coupon...', 'Processing');
        
        await deleteCoupon(selectedCoupon.id);
        removeAlert(loadingAlertId);
        showSuccess('Coupon deleted successfully!', 'Delete Successful');
        
        // Refresh coupons list
        await fetchCoupons();
        
        setDeleteModalOpen(false);
        setSelectedCoupon(null);
        
      } catch (error) {
        console.error('Error deleting coupon:', error);
        
        if (error.response?.data?.error) {
          showError(error.response.data.error, 'Delete Failed', { duration: 5000 });
        } else if (error.response?.status === 401) {
          showError('Authentication required. Please login again.', 'Session Expired', { duration: 5000 });
        } else if (error.response?.status === 403) {
          showError('You do not have permission to delete coupons.', 'Access Denied', { duration: 5000 });
        } else if (error.response?.status === 404) {
          showError('Coupon not found. It may have been deleted.', 'Not Found', { duration: 5000 });
        } else if (error.message === 'Network Error') {
          showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
        } else {
          showError('Failed to delete coupon. Please try again.', 'Delete Failed', { duration: 5000 });
        }
      }
    }
  };

  // Filter coupons based on search and filters
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = 
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && coupon.active) ||
      (statusFilter === 'inactive' && !coupon.active);
    
    const matchesType = discountTypeFilter === 'all' || 
      coupon.discount_type === discountTypeFilter;
    
    // Check if coupon is currently valid
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validTo = new Date(coupon.valid_to);
    const isCurrentlyValid = now >= validFrom && now <= validTo && coupon.active;
    
    const matchesValidity = statusFilter === 'all' || 
      (statusFilter === 'active' && isCurrentlyValid) ||
      (statusFilter === 'expired' && now > validTo) ||
      (statusFilter === 'scheduled' && now < validFrom);
    
    return matchesSearch && matchesStatus && matchesType && matchesValidity;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validTo = new Date(coupon.valid_to);
    
    if (!coupon.active) {
      return <span className="status-badge inactive">Inactive</span>;
    }
    
    if (now < validFrom) {
      return <span className="status-badge scheduled">Scheduled</span>;
    }
    
    if (now > validTo) {
      return <span className="status-badge expired">Expired</span>;
    }
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return <span className="status-badge used">Used Up</span>;
    }
    
    return <span className="status-badge active">Active</span>;
  };

  const getDiscountDisplay = (coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    } else if (coupon.discount_type === 'fixed') {
      return `₦${coupon.discount_value} OFF`;
    }
    return coupon.discount_value;
  };

  const getUsageProgress = (coupon) => {
    if (!coupon.usage_limit) return 100;
    return (coupon.used_count / coupon.usage_limit) * 100;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDiscountTypeFilter('all');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || discountTypeFilter !== 'all';

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
              
              <div className="coupon-list-container">
                <div className="coupon-list-header">
                  <div className="header-content">
                    <h1>Coupon Management</h1>
                    <p>Manage discount coupons for your store</p>
                  </div>
                  <div className="header-actions">
                    <button 
                      className="send-coupon-btn"
                      onClick={() => {
                        if (coupons.length > 0) {
                          setSendModalOpen(true);
                        } else {
                          showWarning('Create coupons first to send them.', 'No Coupons');
                        }
                      }}
                    >
                      <span>📧 Send Coupon</span>
                    </button>
                    <button 
                      className="add-coupon-btn"
                      onClick={handleAdd}
                    >
                      <span>+ Add Coupon</span>
                    </button>
                  </div>
                </div>

                <div className="coupon-list-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search by coupon code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  
                  <div className="filter-controls">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="expired">Expired</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                    
                    <select 
                      value={discountTypeFilter}
                      onChange={(e) => setDiscountTypeFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Types</option>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                    
                    {hasActiveFilters && (
                      <button 
                        className="clear-filters-btn"
                        onClick={clearFilters}
                        title="Clear all filters"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="active-filters">
                    <span className="filters-label">Active filters:</span>
                    {searchTerm && (
                      <span className="filter-tag">
                        Search: "{searchTerm}"
                        <button onClick={() => setSearchTerm('')}>×</button>
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className="filter-tag">
                        Status: {statusFilter}
                        <button onClick={() => setStatusFilter('all')}>×</button>
                      </span>
                    )}
                    {discountTypeFilter !== 'all' && (
                      <span className="filter-tag">
                        Type: {discountTypeFilter}
                        <button onClick={() => setDiscountTypeFilter('all')}>×</button>
                      </span>
                    )}
                  </div>
                )}

                <div className="coupon-list-content">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading coupons...</p>
                    </div>
                  ) : filteredCoupons.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🎫</div>
                      <h3>No coupons found</h3>
                      <p>
                        {hasActiveFilters 
                          ? 'No coupons match your search criteria. Try adjusting your filters.' 
                          : 'Get started by creating your first discount coupon.'
                        }
                      </p>
                      {hasActiveFilters ? (
                        <button 
                          className="add-coupon-btn empty-state-btn"
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button 
                          className="add-coupon-btn empty-state-btn"
                          onClick={handleAdd}
                        >
                          + Create Your First Coupon
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="coupons-table-container">
                      <table className="coupons-table">
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Status</th>
                            <th>Usage</th>
                            <th>Validity Period</th>
                            <th>Min Order</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCoupons.map(coupon => (
                            <tr key={coupon.id}>
                              <td>
                                <div className="coupon-code-cell">
                                  <strong className="coupon-code">{coupon.code}</strong>
                                  <div className="coupon-id">ID: {coupon.id}</div>
                                </div>
                              </td>
                              <td>
                                <div className="discount-cell">
                                  <span className={`discount-badge ${coupon.discount_type}`}>
                                    {getDiscountDisplay(coupon)}
                                  </span>
                                  <div className="discount-type">
                                    {coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                                  </div>
                                </div>
                              </td>
                              <td>
                                {getStatusBadge(coupon)}
                              </td>
                              <td>
                                <div className="usage-cell">
                                  <div className="usage-progress">
                                    <div 
                                      className="usage-progress-bar"
                                      style={{ width: `${getUsageProgress(coupon)}%` }}
                                    ></div>
                                  </div>
                                  <div className="usage-text">
                                    {coupon.used_count || 0} / {coupon.usage_limit || '∞'}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="validity-cell">
                                  <div className="validity-date">
                                    <strong>From:</strong> {formatDate(coupon.valid_from)}
                                  </div>
                                  <div className="validity-date">
                                    <strong>To:</strong> {formatDate(coupon.valid_to)}
                                  </div>
                                </div>
                              </td>
                              <td>
                                {coupon.min_order_amount ? (
                                  <span className="min-order">₦{coupon.min_order_amount}</span>
                                ) : (
                                  <span className="no-min-order">No minimum</span>
                                )}
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    className="action-btn send-btn"
                                    onClick={() => handleSend(coupon)}
                                    title="Send to customers"
                                  >
                                    📧
                                  </button>
                                  <button 
                                    className="action-btn edit-btn"
                                    onClick={() => handleEdit(coupon)}
                                    title="Edit coupon"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    className="action-btn delete-btn"
                                    onClick={() => handleDelete(coupon)}
                                    title="Delete coupon"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {!loading && filteredCoupons.length > 0 && (
                  <div className="coupon-list-footer">
                    <div className="pagination-info">
                      Showing {filteredCoupons.length} of {coupons.length} coupons
                      {hasActiveFilters && ' (filtered)'}
                    </div>
                    <div className="pagination-controls">
                      <button className="pagination-btn" disabled>Previous</button>
                      <button className="pagination-btn active">1</button>
                      <button className="pagination-btn">2</button>
                      <button className="pagination-btn">Next</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* Coupon Modal */}
      <CouponModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCoupon(null);
        }}
        onSubmit={handleModalSubmit}
        coupon={selectedCoupon}
      />
      
      {/* Send Coupon Modal */}
      <SendCouponModal
        isOpen={sendModalOpen}
        onClose={() => {
          setSendModalOpen(false);
          setSelectedCoupon(null);
        }}
        onSubmit={handleSendCoupon}
        coupons={coupons}
        selectedCoupon={selectedCoupon}
      />
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Delete Coupon</h3>
            </div>
            <div className="delete-modal-content">
              <div className="warning-icon">⚠️</div>
              <p>
                Are you sure you want to delete coupon <strong>"{selectedCoupon?.code}"</strong>? 
                This action cannot be undone and may affect active orders.
              </p>
            </div>
            <div className="delete-modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={handleDeleteConfirm}
              >
                Delete Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponList;
