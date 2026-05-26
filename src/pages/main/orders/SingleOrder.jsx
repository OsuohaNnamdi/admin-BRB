import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/OrderList.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SettingsPanel from '../../../component/SettingsPanel';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';
import { useOrder } from '../../../context/OrderContext';

const SingleOrder = () => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();
  const {
    selectedOrder,
    updateOrderStatus: updateOrderInContext,
    clearSelectedOrder
  } = useOrder();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Handle back navigation
  const handleBack = () => {
    clearSelectedOrder();
    navigate('/orders');
  };

  // Update order status - both in API and context
  const updateOrderStatus = async (newStatus) => {
    if (!selectedOrder?.id) {
      showError('No order selected', 'Error', { duration: 5000 });
      return;
    }
    
    setUpdating(true);
    try {
      const loadingAlertId = showLoading('Updating order status...', 'Processing');
      
      // Update in API - Ensure proper data format
      const statusData = {
        status: newStatus
      };
      
      console.log('Updating order status:', {
        orderId: selectedOrder.id,
        statusData: statusData
      });
      
      await ApiService.updateOrderStatus(selectedOrder.id, statusData);
      
      // Update in context
      updateOrderInContext(selectedOrder.id, newStatus);
      
      removeAlert(loadingAlertId);
      showSuccess('Order status updated successfully!', 'Update Successful');

    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      handleUpdateError(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateError = (error) => {
    console.log('Full error object:', error);
    
    if (error.response?.data) {
      const backendErrors = error.response.data;
      let errorMessage = 'Failed to update order. ';
      
      // Check if backendErrors is an object
      if (typeof backendErrors === 'object') {
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            errorMessage += `${key}: ${backendErrors[key].join(', ')} `;
          } else if (typeof backendErrors[key] === 'string') {
            errorMessage += `${key}: ${backendErrors[key]} `;
          } else {
            errorMessage += `${key}: ${JSON.stringify(backendErrors[key])} `;
          }
        });
      } else if (typeof backendErrors === 'string') {
        errorMessage = backendErrors;
      }
      
      showError(errorMessage.trim(), 'Update Failed', { duration: 6000 });
    } else if (error.response?.status === 400) {
      showError('Bad request. Invalid status data.', 'Validation Error', { duration: 5000 });
    } else if (error.response?.status === 404) {
      showError('Order not found. The order may have been deleted.', 'Not Found', { duration: 5000 });
      navigate('/orders');
    } else if (error.message === 'Network Error') {
      showError('Network error. Please check your internet connection.', 'Connection Error', { duration: 5000 });
    } else if (error.code === 'ECONNABORTED') {
      showError('Request timeout. Please try again.', 'Timeout Error', { duration: 5000 });
    } else if (!error.response) {
      showError('No response from server. Please check if the server is running.', 'Server Error', { duration: 5000 });
    } else {
      showError(`Failed to update order: ${error.message}`, 'Update Failed', { duration: 5000 });
    }
  };

  console.log('Selected order data:', selectedOrder);

  const getStatusBadge = (status) => {
    if (!status) return 'pending';
    const statusMap = {
      pending: 'pending',
      paid: 'paid',
      shipped: 'shipped',
      completed: 'completed',
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get only the next available statuses (no previous or current)
  const getNextStatuses = (currentStatus) => {
    if (!currentStatus) return [];
    
    // Define the forward-only workflow
    const workflow = {
      pending: ['paid'],  // Only next: paid (no cancellation allowed here - handle separately)
      paid: ['shipped'],  // Only next: shipped
      shipped: ['completed'], // Only next: completed
      completed: [],      // No next status
      cancelled: []       // No next status (terminal)
    };
    
    return workflow[currentStatus] || [];
  };

  // Check if cancellation is allowed for current status
  const canCancel = (currentStatus) => {
    const cancellableStatuses = ['pending', 'paid', 'shipped'];
    return cancellableStatuses.includes(currentStatus);
  };

  // Get display name for status
  const getStatusDisplayName = (status) => {
    const names = {
      pending: 'Pending',
      paid: 'Paid',
      shipped: 'Shipped',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return names[status] || status;
  };

  const getTotalItems = () => {
    if (!selectedOrder?.items) return 0;
    return selectedOrder.items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getSubtotal = () => {
    if (!selectedOrder?.items) return 0;
    return selectedOrder.items.reduce((total, item) => total + (parseFloat(item.unit_price || 0) * (item.quantity || 1)), 0);
  };

  // Helper function to check if a status is completed or should be treated as delivered
  const isDelivered = (status) => {
    return status === 'completed' || status === 'delivered';
  };

  // Check if a timeline step is completed
  const isTimelineStepCompleted = (currentStatus, stepName) => {
    const stepOrder = ['pending', 'paid', 'shipped', 'completed'];
    const currentIndex = stepOrder.indexOf(currentStatus);
    const stepIndex = stepOrder.indexOf(stepName);
    
    if (currentStatus === 'cancelled') {
      return stepName === 'pending'; // Only first step shows as completed if cancelled
    }
    
    return stepIndex <= currentIndex;
  };

  // Check if timeline step is active (current)
  const isTimelineStepActive = (currentStatus, stepName) => {
    if (currentStatus === 'cancelled') return false;
    return currentStatus === stepName;
  };

  // If no order is selected, show error
  if (!selectedOrder) {
    return (
      <div className="__variable_9eb1a5 body">
        <div className="error-state full-page">
          <div className="error-icon">❌</div>
          <h3>No Order Selected</h3>
          <p>Please select an order from the orders list.</p>
          <button 
            className="back-btn"
            onClick={() => navigate('/orders')}
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const order = selectedOrder;
  const nextStatuses = getNextStatuses(order?.status);
  const showCancelOption = canCancel(order?.status);
  const isTerminalStatus = order?.status === 'completed' || order?.status === 'cancelled';

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
                    <div className="header-content">
                      <h1>Order #ORD-{order.id.toString().padStart(4, '0')}</h1>
                      <p>Placed on {formatDate(order?.created_at)}</p>
                    </div>
                  </div>
                  <div className="header-actions">
                    <button 
                      className="refresh-btn"
                      onClick={handleBack}
                      title="Go back to orders"
                    >
                      ← Back
                    </button>
                  </div>
                </div>

                <div className="order-overview">
                  <div className="overview-card">
                    <div className="overview-item">
                      <span className="overview-label">Status</span>
                      <span className={`status-badge large ${getStatusBadge(order?.status)}`}>
                        {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                      </span>
                    </div>
                    <div className="overview-item">
                      <span className="overview-label">Total Amount</span>
                      <span className="overview-value total">{formatPrice(order?.total_amount || order?.total || 0)}</span>
                    </div>
                    <div className="overview-item">
                      <span className="overview-label">Items</span>
                      <span className="overview-value">{getTotalItems()}</span>
                    </div>
                    <div className="overview-item">
                      <span className="overview-label">Last Updated</span>
                      <span className="overview-value">{formatDate(order?.updated_at)}</span>
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
                        {order?.items?.map(item => (
                          <div key={item.id} className="table-row">
                            <div className="col-product">
                              <div className="product-info">
                                <div className="product-name">{item.product_name || item.product?.name || 'Unknown Product'}</div>
                              </div>
                            </div>
                            <div className="col-price">
                              {formatPrice(item.unit_price)}
                            </div>
                            <div className="col-quantity">
                              {item.quantity || 1}
                            </div>
                            <div className="col-total">
                              {formatPrice(parseFloat(item.unit_price || 0) * (item.quantity || 1))}
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
                          <span>{formatPrice(order?.shipping_fee || 0)}</span>
                        </div>
                        <div className="footer-row total">
                          <span>Total:</span>
                          <span>{formatPrice(order?.total_amount || order?.total || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions Section */}
                  <div className="order-actions-section">
                    <div className="action-card">
                      <h4>Update Status</h4>
                      
                      {!isTerminalStatus && (
                        <>
                          <div className="current-status-display">
                            <p className="current-status-label">Current Status:</p>
                            <span className={`status-badge ${getStatusBadge(order?.status)}`}>
                              {getStatusDisplayName(order?.status)}
                            </span>
                          </div>

                          {nextStatuses.length > 0 && (
                            <div className="next-statuses-container">
                              <p className="next-status-label">Next Available Update:</p>
                              <div className="next-status-buttons">
                                {nextStatuses.map(status => (
                                  <button
                                    key={status}
                                    className={`next-status-btn ${status}`}
                                    onClick={() => updateOrderStatus(status)}
                                    disabled={updating}
                                  >
                                    Move to {getStatusDisplayName(status)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {showCancelOption && (
                            <div className="cancel-action">
                              <button
                                className="cancel-status-btn"
                                onClick={() => updateOrderStatus('cancelled')}
                                disabled={updating}
                              >
                                Cancel Order
                              </button>
                              <small className="cancel-warning">⚠️ This action cannot be undone</small>
                            </div>
                          )}

                          {updating && <div className="updating-spinner"></div>}
                        </>
                      )}

                      {isTerminalStatus && (
                        <div className="terminal-status-message">
                          <p className="terminal-message">
                            {order?.status === 'completed' 
                              ? '✅ This order has been completed and delivered.' 
                              : '❌ This order has been cancelled.'}
                          </p>
                          <p className="terminal-note">No further status updates are available.</p>
                        </div>
                      )}
                    </div>

                    <div className="action-card">
                      <h4>Order Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Order ID:</span>
                          <span className="info-value">#{order?.order_number || order?.id || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Created:</span>
                          <span className="info-value">{formatDate(order?.created_at)}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Last Updated:</span>
                          <span className="info-value">{formatDate(order?.updated_at)}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Customer:</span>
                          <span className="info-value">
                            {order?.customer_name || order?.customer?.name || order?.user?.name || 'N/A'}
                          </span>
                        </div>
                        {order?.customer_email && (
                          <div className="info-item">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{order.customer_email}</span>
                          </div>
                        )}
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
                          onClick={handleBack}
                        >
                          Back to Orders
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Timeline - Shows full history with forward-only progression */}
                <div className="order-section">
                  <h3>Order Timeline</h3>
                  <div className="timeline">
                    <div className={`timeline-item ${isTimelineStepCompleted(order?.status, 'pending') ? 'completed' : ''} ${isTimelineStepActive(order?.status, 'pending') ? 'active' : ''}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Order Placed</h4>
                        <p>{formatDate(order?.created_at)}</p>
                        {isTimelineStepActive(order?.status, 'pending') && <span className="timeline-status">Current</span>}
                      </div>
                    </div>
                    
                    <div className={`timeline-item ${isTimelineStepCompleted(order?.status, 'paid') ? 'completed' : ''} ${isTimelineStepActive(order?.status, 'paid') ? 'active' : ''}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Payment Confirmed</h4>
                        <p>{isTimelineStepCompleted(order?.status, 'paid') ? 'Payment received' : 
                              order?.status === 'cancelled' ? 'Order cancelled' : 
                              isTimelineStepActive(order?.status, 'paid') ? 'Payment confirmed - Awaiting shipment' : 'Awaiting payment'}</p>
                        {isTimelineStepActive(order?.status, 'paid') && <span className="timeline-status">Current</span>}
                      </div>
                    </div>
                    
                    <div className={`timeline-item ${isTimelineStepCompleted(order?.status, 'shipped') ? 'completed' : ''} ${isTimelineStepActive(order?.status, 'shipped') ? 'active' : ''}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Shipped</h4>
                        <p>{isTimelineStepCompleted(order?.status, 'shipped') ? 'Order in transit' : 
                              order?.status === 'cancelled' ? 'Order cancelled' : 
                              isTimelineStepActive(order?.status, 'shipped') ? 'Order shipped - In transit' : 'Not yet shipped'}</p>
                        {isTimelineStepActive(order?.status, 'shipped') && <span className="timeline-status">Current</span>}
                      </div>
                    </div>
                    
                    <div className={`timeline-item ${isDelivered(order?.status) ? 'active' : isTimelineStepCompleted(order?.status, 'completed') ? 'completed' : ''}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Delivered</h4>
                        <p>{order?.status === 'completed' ? '✅ Order completed and delivered' : 
                              order?.status === 'cancelled' ? '❌ Order cancelled' : 
                              isTimelineStepActive(order?.status, 'completed') ? 'Delivery in progress' : 'Not yet delivered'}</p>
                        {order?.status === 'completed' && <span className="timeline-status">Completed</span>}
                        {order?.status === 'cancelled' && <span className="timeline-status cancelled">Cancelled</span>}
                      </div>
                    </div>
                  </div>
                </div>
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