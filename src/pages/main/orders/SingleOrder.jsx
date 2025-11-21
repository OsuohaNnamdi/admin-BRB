import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../../styles/OrderList.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SettingsPanel from '../../../component/SettingsPanel';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';

const SingleOrder = () => {
  // const { orderId } = useParams();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();

  const orderId = 1;



  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // API functions
  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getAdminOrder(orderId);
      console.log('Order fetched:', response.data);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      showError(
        'Failed to load order details. Please try again.',
        'Load Error',
        { duration: 5000 }
      );
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const loadingAlertId = showLoading('Updating order status...', 'Processing');
      await ApiService.updateOrderStatus(orderId, { status: newStatus });
      removeAlert(loadingAlertId);
      showSuccess('Order status updated successfully!', 'Update Successful');
      
      // Update local state
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating order status:', error);
      handleUpdateError(error);
    } finally {
      setUpdating(false);
    }
  };
  

  const handleUpdateError = (error) => {
    if (error.response?.data) {
      const backendErrors = error.response.data;
      let errorMessage = 'Failed to update order. ';
      
      Object.keys(backendErrors).forEach(key => {
        if (Array.isArray(backendErrors[key])) {
          errorMessage += `${key}: ${backendErrors[key].join(', ')} `;
        } else {
          errorMessage += `${key}: ${backendErrors[key]} `;
        }
      });
      
      showError(errorMessage.trim(), 'Update Failed', { duration: 6000 });
    } else if (error.response?.status === 400) {
      showError('Invalid status data.', 'Validation Error', { duration: 5000 });
    } else if (error.response?.status === 401) {
      showError('Authentication required. Please login again.', 'Session Expired', { duration: 5000 });
    } else if (error.response?.status === 403) {
      showError('You do not have permission to update orders.', 'Access Denied', { duration: 5000 });
    } else if (error.response?.status === 404) {
      showError('Order not found.', 'Not Found', { duration: 5000 });
      navigate('/admin/orders');
    } else if (error.message === 'Network Error') {
      showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
    } else {
      showError('Failed to update order. Please try again.', 'Update Failed', { duration: 5000 });
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'pending',
      confirmed: 'confirmed',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled'
    };
    return statusMap[status] || 'pending';
  };

  const formatPrice = (price) => {
    if (!price) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };
    return statusFlow[currentStatus] || [];
  };

  const getTotalItems = () => {
    return order?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const getSubtotal = () => {
    return order?.items?.reduce((total, item) => total + (parseFloat(item.unit_price) * item.quantity), 0) || 0;
  };

  if (loading) {
    return (
      <div className="__variable_9eb1a5 body">
        <div className="loading-state full-page">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

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
              
              <div className="single-order-container">
                <div className="order-header">
                  <div className="header-left">
                    <button 
                      className="back-btn"
                      onClick={() => navigate('/admin/orders')}
                    >
                      ← Back to Orders
                    </button>
                    <div className="header-content">
                      <h1>Order #{order.id}</h1>
                      <p>Placed on {formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="header-actions">
                    <button 
                      className="refresh-btn"
                      onClick={fetchOrder}
                      title="Refresh order"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>

                <div className="order-overview">
                  <div className="overview-card">
                    <div className="overview-item">
                      <span className="overview-label">Status</span>
                      <span className={`status-badge large ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="overview-item">
                      <span className="overview-label">Total Amount</span>
                      <span className="overview-value total">{formatPrice(order.total)}</span>
                    </div>
                    <div className="overview-item">
                      <span className="overview-label">Items</span>
                      <span className="overview-value">{getTotalItems()}</span>
                    </div>
                    <div className="overview-item">
                      <span className="overview-label">Last Updated</span>
                      <span className="overview-value">{formatDate(order.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-details-grid">
                  {/* Order Items Section */}
                  <div className="order-section">
                    <h3>Order Items</h3>
                    <div className="items-table">
                      <div className="table-header">
                        <div className="col-product">Product</div>
                        <div className="col-price">Unit Price</div>
                        <div className="col-quantity">Quantity</div>
                        <div className="col-total">Total</div>
                      </div>
                      <div className="table-body">
                        {order.items?.map(item => (
                          <div key={item.id} className="table-row">
                            <div className="col-product">
                              <div className="product-info">
                                <div className="product-name">{item.product_name}</div>
                              </div>
                            </div>
                            <div className="col-price">
                              {formatPrice(item.unit_price)}
                            </div>
                            <div className="col-quantity">
                              {item.quantity}
                            </div>
                            <div className="col-total">
                              {formatPrice(parseFloat(item.unit_price) * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="table-footer">
                        <div className="footer-row">
                          <span>Subtotal:</span>
                          <span>{formatPrice(getSubtotal())}</span>
                        </div>
                        <div className="footer-row">
                          <span>Shipping:</span>
                          <span>{formatPrice(0)}</span>
                        </div>
                        <div className="footer-row total">
                          <span>Total:</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions Section */}
                  <div className="order-actions-section">
                    <div className="action-card">
                      <h4>Update Status</h4>
                      <div className="status-control-group">
                        <label htmlFor="status-select">Current Status: </label>
                        <select 
                          id="status-select"
                          className="status-select"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(e.target.value)}
                          disabled={updating}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {updating && <div className="updating-spinner"></div>}
                      </div>
                      <div className="status-help">
                        <p>Next available statuses:</p>
                        <div className="available-statuses">
                          {getStatusOptions(order.status).map(status => (
                            <span key={status} className="available-status">
                              {status}
                            </span>
                          ))}
                          {getStatusOptions(order.status).length === 0 && (
                            <span className="no-status">No further status changes available</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="action-card">
                      <h4>Order Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Order ID:</span>
                          <span className="info-value">#{order.id}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Created:</span>
                          <span className="info-value">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Last Updated:</span>
                          <span className="info-value">{formatDate(order.updated_at)}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Tracking Token:</span>
                          <span className="info-value">
                            {order.tracking_token || 'Not assigned'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="action-card">
                      <h4>Quick Actions</h4>
                      <div className="quick-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => window.print()}
                        >
                          Print Order
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={fetchOrder}
                        >
                          Refresh Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="order-section">
                  <h3>Order Timeline</h3>
                  <div className="timeline">
                    <div className={`timeline-item ${order.status === 'pending' ? 'active' : 'completed'}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Order Placed</h4>
                        <p>{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className={`timeline-item ${order.status === 'confirmed' ? 'active' : order.status === 'pending' ? 'pending' : 'completed'}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Order Confirmed</h4>
                        <p>Waiting for confirmation</p>
                      </div>
                    </div>
                    <div className={`timeline-item ${order.status === 'processing' ? 'active' : ['pending', 'confirmed'].includes(order.status) ? 'pending' : 'completed'}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Processing</h4>
                        <p>Order being prepared</p>
                      </div>
                    </div>
                    <div className={`timeline-item ${order.status === 'shipped' ? 'active' : ['pending', 'confirmed', 'processing'].includes(order.status) ? 'pending' : 'completed'}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Shipped</h4>
                        <p>Order in transit</p>
                      </div>
                    </div>
                    <div className={`timeline-item ${order.status === 'delivered' ? 'active' : order.status === 'cancelled' ? 'cancelled' : 'pending'}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Delivered</h4>
                        <p>Order completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bottom-page">
                <div className="body-text">Copyright © 2025 Remos. Design with</div>
                <i className="icon-heart"></i>
                <div className="body-text">by <a href="https://themeforest.net/user/themesflat/404">Themesflat</a> All rights reserved.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default SingleOrder;