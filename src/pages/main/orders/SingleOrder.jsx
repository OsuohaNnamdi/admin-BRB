import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/OrderList.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SettingsPanel from '../../../component/SettingsPanel';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';
import { useOrder } from '../../../context/OrderContext';
import logo from '../../../assets/BRB Logo.png';
import './Receipt.css';

const SingleOrder = () => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [addressData, setAddressData] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();
  const {
    selectedOrder,
    updateOrderStatus: updateOrderInContext,
    clearSelectedOrder
  } = useOrder();

  // Fetch address using your getUserAddress method
  useEffect(() => {
    const fetchAddress = async () => {
      const addressId = selectedOrder?.address;
      
      if (!addressId || !selectedOrder) {
        // console.log('No address ID found in order');
        return;
      }
      
      setLoadingAddress(true);
      try {
        const response = await ApiService.getUserAddress(addressId);
        setAddressData(response.data);
        // console.log('Address fetched successfully:', response.data);
      } catch (error) {
        // console.error('Error fetching address:', error);
      } finally {
        setLoadingAddress(false);
      }
    };
    
    fetchAddress();
  }, [selectedOrder?.address, selectedOrder]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleBack = () => {
    clearSelectedOrder();
    navigate('/orders');
  };

  const updateOrderStatus = async (newStatus) => {
    if (!selectedOrder?.id) {
      showError('No order selected', 'Error', { duration: 5000 });
      return;
    }
    
    setUpdating(true);
    try {
      const loadingAlertId = showLoading('Updating order status...', 'Processing');
      const statusData = { status: newStatus };
      
      await ApiService.updateOrderStatus(selectedOrder.id, statusData);
      updateOrderInContext(selectedOrder.id, newStatus);
      
      removeAlert(loadingAlertId);
      showSuccess('Order status updated successfully!', 'Update Successful');
    } catch (error) {
      // console.error('Error updating order status:', error);
      handleUpdateError(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateError = (error) => {
    if (error.response?.data) {
      const backendErrors = error.response.data;
      let errorMessage = 'Failed to update order. ';
      
      if (typeof backendErrors === 'object') {
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            errorMessage += `${key}: ${backendErrors[key].join(', ')} `;
          } else if (typeof backendErrors[key] === 'string') {
            errorMessage += `${key}: ${backendErrors[key]} `;
          }
        });
      } else if (typeof backendErrors === 'string') {
        errorMessage = backendErrors;
      }
      
      showError(errorMessage.trim(), 'Update Failed', { duration: 6000 });
    } else if (error.response?.status === 404) {
      showError('Order not found.', 'Not Found', { duration: 5000 });
      navigate('/orders');
    } else if (error.message === 'Network Error') {
      showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
    } else {
      showError(`Failed to update order: ${error.message}`, 'Update Failed', { duration: 5000 });
    }
  };

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

  const getNextStatuses = (currentStatus) => {
    if (!currentStatus) return [];
    const workflow = {
      pending: ['paid'],
      paid: ['shipped'],
      shipped: ['completed'],
      completed: [],
      cancelled: []
    };
    return workflow[currentStatus] || [];
  };

  const canCancel = (currentStatus) => {
    const cancellableStatuses = ['pending', 'paid', 'shipped'];
    return cancellableStatuses.includes(currentStatus);
  };

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

  const isDelivered = (status) => {
    return status === 'completed' || status === 'delivered';
  };

  const isTimelineStepCompleted = (currentStatus, stepName) => {
    const stepOrder = ['pending', 'paid', 'shipped', 'completed'];
    const currentIndex = stepOrder.indexOf(currentStatus);
    const stepIndex = stepOrder.indexOf(stepName);
    if (currentStatus === 'cancelled') return stepName === 'pending';
    return stepIndex <= currentIndex;
  };

  const isTimelineStepActive = (currentStatus, stepName) => {
    if (currentStatus === 'cancelled') return false;
    return currentStatus === stepName;
  };

  const getFormattedAddress = () => {
    if (addressData) {
      const parts = [
        addressData.line1,
        addressData.line2,
        addressData.city,
        addressData.state,
        addressData.postal_code,
        addressData.country
      ].filter(part => part && part.trim() !== '');
      return parts.join(', ');
    }
    return 'Address not available';
  };

  const getCustomerName = () => {
    return selectedOrder?.user_name || 
           selectedOrder?.customer_name || 
           selectedOrder?.customer?.name || 
           selectedOrder?.user?.name || 
           'Customer';
  };

  const getCustomerEmail = () => {
    return selectedOrder?.user_email || 
           selectedOrder?.customer_email || 
           selectedOrder?.customer?.email || 
           selectedOrder?.user?.email || 
           'customer@example.com';
  };

  const getCustomerPhone = () => {
    return selectedOrder?.user_phone || 
           selectedOrder?.customer_phone || 
           selectedOrder?.phone || 
           'Not provided';
  };

  const getReceiptData = () => {
    if (!selectedOrder) return null;
    
    const subtotal = getSubtotal();
    const tax = selectedOrder.tax || selectedOrder.tax_amount || 0;
    const total = selectedOrder.total || 0;
    const discountTotal = selectedOrder.discount_total || 0;
    const deliveryPrice = selectedOrder.delivery_price || 0;
    const grandTotal = selectedOrder.grand_total || total + deliveryPrice;
    
    return {
      invoiceNo: `INV-${selectedOrder.id.toString().padStart(4, '0')}`,
      orderNo: selectedOrder.tracking_token || `ORD-${selectedOrder.id}`,
      date: selectedOrder.created_at,
      customerName: getCustomerName(),
      customerPhone: getCustomerPhone(),
      customerEmail: getCustomerEmail(),
      customerAddress: getFormattedAddress(),
      addressLabel: addressData?.label || null,
      items: selectedOrder.items?.map(item => ({
        name: item.product_name || item.product?.name || 'Product',
        quantity: item.quantity || 1,
        rate: parseFloat(item.unit_price || 0),
        amount: parseFloat(item.unit_price || 0) * (item.quantity || 1)
      })) || [],
      subtotal: subtotal,
      tax: typeof tax === 'number' ? tax : 0,
      discountTotal: discountTotal,
      deliveryPrice: deliveryPrice,
      total: total,
      grandTotal: grandTotal,
      status: selectedOrder.status
    };
  };

  const exportToPDF = () => {
    const printContent = document.getElementById('receiptPrintArea').innerHTML;
    const originalTitle = document.title;
    document.title = `Receipt_${selectedOrder?.tracking_token || selectedOrder?.id}`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Beauty Receipt - ${selectedOrder?.tracking_token || selectedOrder?.id}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', 'Segoe UI', sans-serif;
              background: white;
              padding: 2rem;
              display: flex;
              justify-content: center;
            }
            .receipt-print-container {
              max-width: 800px;
              width: 100%;
              margin: 0 auto;
              background: white;
            }
            .receipt-container {
              background: white;
              border-radius: 16px;
              overflow: hidden;
            }
            .receipt-header {
              text-align: center;
              padding: 1rem 0;
              margin-bottom: 1rem;
              border-bottom: 2px solid #A9C3A4;
            }
            .receipt-brand-row {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 1rem;
              margin-bottom: 0.5rem;
            }
            .receipt-logo {
              display: flex;
              align-items: center;
            }
            .receipt-logo-img {
              width: 50px;
              height: auto;
              object-fit: contain;
            }
            .receipt-brand-text {
              text-align: left;
            }
            .receipt-brand-text h1 {
              font-size: 1.5rem;
              font-weight: 800;
              margin: 0;
              color: #1a1a1a;
            }
            .receipt-brand-text span {
              font-size: 0.7rem;
              color: #577a52;
              font-weight: 600;
            }
            .receipt-contact {
              font-size: 0.75rem;
              color: #4A4A4A;
              margin-top: 0.25rem;
            }
            .receipt-info-section {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 1rem;
              margin-bottom: 1.5rem;
              padding: 0.75rem;
              background: #F5F5F5;
              border-radius: 12px;
            }
            .receipt-billed-to {
              flex: 1;
            }
            .receipt-billed-to p:first-child {
              font-size: 0.7rem;
              font-weight: 700;
              color: #577a52;
              margin-bottom: 0.25rem;
            }
            .receipt-customer-name {
              font-weight: 700;
              font-size: 1rem;
              margin-bottom: 0.25rem;
            }
            .receipt-detail-line {
              font-size: 0.75rem;
              color: #4A4A4A;
              margin: 0.2rem 0;
            }
            .receipt-detail-line i {
              width: 1rem;
              margin-right: 0.25rem;
            }
            .receipt-order-info {
              text-align: right;
            }
            .receipt-order-info p {
              font-size: 0.8rem;
              margin: 0.25rem 0;
            }
            .receipt-status-badge {
              background: #e9f3e6;
              padding: 0.2rem 0.6rem;
              border-radius: 20px;
              font-size: 0.7rem;
              font-weight: 700;
              color: #577a52;
              display: inline-block;
            }
            .receipt-items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1rem;
            }
            .receipt-items-table th {
              text-align: left;
              padding: 0.5rem 0;
              border-bottom: 2px solid #A9C3A4;
              font-size: 0.7rem;
              font-weight: 700;
              color: #4A4A4A;
            }
            .receipt-items-table td {
              padding: 0.75rem 0;
              border-bottom: 1px solid #E8E8E8;
              font-size: 0.85rem;
            }
            .receipt-item-name {
              font-weight: 600;
            }
            .receipt-text-center {
              text-align: center;
            }
            .receipt-text-right {
              text-align: right;
            }
            .receipt-totals {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 1.5rem;
            }
            .receipt-totals-box {
              width: 280px;
              padding: 0.75rem;
              background: #FCFDFB;
              border-radius: 16px;
              border: 1px solid #E8E8E8;
            }
            .receipt-total-row {
              display: flex;
              justify-content: space-between;
              padding: 0.3rem 0;
              font-size: 0.85rem;
            }
            .receipt-total-row.discount {
              color: #DC2626;
            }
            .receipt-grand-total {
              display: flex;
              justify-content: space-between;
              padding: 0.6rem 0 0.3rem 0;
              border-top: 1px dashed #A9C3A4;
              margin-top: 0.3rem;
              font-weight: 800;
              font-size: 1.1rem;
              color: #577a52;
            }
            .receipt-thankyou {
              text-align: center;
              padding: 1rem;
              background: #F5F5F5;
              border-radius: 12px;
            }
            .receipt-thankyou h3 {
              font-size: 1.1rem;
              font-weight: 700;
              color: #577a52;
            }
            .receipt-thankyou p {
              font-size: 0.75rem;
              color: #4A4A4A;
            }
            @media print {
              body { padding: 0; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-print-container">
            ${printContent}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    document.title = originalTitle;
  };

  if (!selectedOrder) {
    return (
      <div className="__variable_9eb1a5 body">
        <div className="error-state full-page">
          <div className="error-icon">❌</div>
          <h3>No Order Selected</h3>
          <p>Please select an order from the orders list.</p>
          <button className="back-btn" onClick={() => navigate('/orders')}>
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
  const receiptData = getReceiptData();

  return (
    <div className="__variable_9eb1a5 body">
      <div className="menu-style"></div>
      <div className="layout-width"></div>
      
      <div id="wrapper">
        <div id="page">
          <div className="layout-wrap">
            <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onClose={closeSidebar} />
            <div className="section-content-right">
              <Header onToggleSidebar={toggleSidebar} onSettingsClick={() => setSettingsOpen(true)} />
              
              <div className="single-order-container">
                <div className="order-header">
                  <div className="header-left">
                    <div className="header-content">
                      <h1>Order #{order.tracking_token || `ORD-${order.id.toString().padStart(4, '0')}`}</h1>
                      <p>Placed on {formatDate(order?.created_at)}</p>
                    </div>
                  </div>
                  <div className="header-actions">
                    <button className="refresh-btn" onClick={handleBack}>
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
                      <span className="overview-value total">{formatPrice(order?.grand_total || order?.total || 0)}</span>
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
                            <div className="col-price">{formatPrice(item.unit_price)}</div>
                            <div className="col-quantity">{item.quantity || 1}</div>
                            <div className="col-total">{formatPrice(parseFloat(item.unit_price || 0) * (item.quantity || 1))}</div>
                          </div>
                        ))}
                      </div>
                      <div className="table-footer">
                        <div className="footer-row"><span>Subtotal:</span><span>{formatPrice(getSubtotal())}</span></div>
                        <div className="footer-row"><span>Delivery:</span><span>{formatPrice(order?.delivery_price || 0)}</span></div>
                        {order?.discount_total > 0 && (
                          <div className="footer-row"><span>Discount:</span><span>-{formatPrice(order?.discount_total)}</span></div>
                        )}
                        <div className="footer-row total"><span>Grand Total:</span><span>{formatPrice(order?.grand_total || order?.total || 0)}</span></div>
                      </div>
                    </div>
                  </div>

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
                                  <button key={status} className={`next-status-btn ${status}`} onClick={() => updateOrderStatus(status)} disabled={updating}>
                                    Move to {getStatusDisplayName(status)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {showCancelOption && (
                            <div className="cancel-action">
                              <button className="cancel-status-btn" onClick={() => updateOrderStatus('cancelled')} disabled={updating}>
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
                            {order?.status === 'completed' ? '✅ This order has been completed and delivered.' : '❌ This order has been cancelled.'}
                          </p>
                          <p className="terminal-note">No further status updates are available.</p>
                        </div>
                      )}
                    </div>

                    <div className="action-card">
                      <h4>Customer Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Customer Name:</span>
                          <span className="info-value">{getCustomerName()}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Email:</span>
                          <span className="info-value">{getCustomerEmail()}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Phone:</span>
                          <span className="info-value">{getCustomerPhone()}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Order ID:</span>
                          <span className="info-value">#{order?.tracking_token || order?.id}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Created:</span>
                          <span className="info-value">{formatDate(order?.created_at)}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Shipping Address:</span>
                          <span className="info-value">
                            {loadingAddress ? 'Loading address...' : getFormattedAddress()}
                          </span>
                        </div>
                        {addressData && addressData.label && (
                          <div className="info-item">
                            <span className="info-label">Address Label:</span>
                            <span className="info-value">{addressData.label}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="action-card">
                      <h4>Quick Actions</h4>
                      <div className="quick-actions">
                        <button className="btn-primary" onClick={() => setShowReceiptModal(true)} style={{ background: '#577a52', color: 'white' }}>
                          <i className="fas fa-receipt"></i> View Receipt
                        </button>
                        <button className="btn-secondary" onClick={handleBack}>Back to Orders</button>
                      </div>
                    </div>
                  </div>
                </div>

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
                        <p>{isTimelineStepCompleted(order?.status, 'paid') ? 'Payment received' : order?.status === 'cancelled' ? 'Order cancelled' : isTimelineStepActive(order?.status, 'paid') ? 'Payment confirmed' : 'Awaiting payment'}</p>
                        {isTimelineStepActive(order?.status, 'paid') && <span className="timeline-status">Current</span>}
                      </div>
                    </div>
                    <div className={`timeline-item ${isTimelineStepCompleted(order?.status, 'shipped') ? 'completed' : ''} ${isTimelineStepActive(order?.status, 'shipped') ? 'active' : ''}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Shipped</h4>
                        <p>{isTimelineStepCompleted(order?.status, 'shipped') ? 'Order in transit' : order?.status === 'cancelled' ? 'Order cancelled' : isTimelineStepActive(order?.status, 'shipped') ? 'Order shipped' : 'Not yet shipped'}</p>
                        {isTimelineStepActive(order?.status, 'shipped') && <span className="timeline-status">Current</span>}
                      </div>
                    </div>
                    <div className={`timeline-item ${isDelivered(order?.status) ? 'active' : isTimelineStepCompleted(order?.status, 'completed') ? 'completed' : ''}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Delivered</h4>
                        <p>{order?.status === 'completed' ? '✅ Order completed and delivered' : order?.status === 'cancelled' ? '❌ Order cancelled' : isTimelineStepActive(order?.status, 'completed') ? 'Delivery in progress' : 'Not yet delivered'}</p>
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
      
      {/* Receipt Modal - Logo integrated with text */}
      {showReceiptModal && receiptData && (
        <div className="receipt-modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal-header">
              <h3><i className="fas fa-receipt"></i> Receipt</h3>
              <button className="close-modal-btn" onClick={() => setShowReceiptModal(false)}>✕</button>
            </div>
            <div className="receipt-modal-body" id="receiptPrintArea">
              <div className="receipt-container">
                {/* Header with Logo and Text together in a row */}
                <div className="receipt-header">
                  <div className="receipt-brand-row">
                    <div className="receipt-logo">
                      <img src={logo} alt="BRB Beauty Logo" className="receipt-logo-img" />
                    </div>
                    <div className="receipt-brand-text">
                      <h1>BRB BEAUTY</h1>
                      <span>Curated Skincare That Works</span>
                    </div>
                  </div>
                  <div className="receipt-contact">
                    Lagos Nigeria | Tel: +234 906 469 0292
                  </div>
                </div>

                {/* Invoice Info with Customer Details */}
                <div className="receipt-info-section">
                  <div className="receipt-billed-to">
                    <p>BILLED TO</p>
                    <p className="receipt-customer-name">{receiptData.customerName}</p>
                    <p className="receipt-detail-line"><i className="fas fa-phone"></i> {receiptData.customerPhone}</p>
                    <p className="receipt-detail-line"><i className="fas fa-envelope"></i> {receiptData.customerEmail}</p>
                    <p className="receipt-detail-line"><i className="fas fa-map-marker-alt"></i> {receiptData.customerAddress}</p>
                    {receiptData.addressLabel && (
                      <p className="receipt-detail-line"><i className="fas fa-tag"></i> {receiptData.addressLabel}</p>
                    )}
                  </div>
                  <div className="receipt-order-info">
                    <p><strong>Invoice No:</strong> {receiptData.invoiceNo}</p>
                    <p><strong>Order Ref:</strong> {receiptData.orderNo}</p>
                    <p><strong>Date:</strong> {formatDate(receiptData.date)}</p>
                    <p><strong>Status:</strong> <span className="receipt-status-badge">{receiptData.status?.toUpperCase()}</span></p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="receipt-items-table">
                  <thead>
                    <tr>
                      <th>DESCRIPTION</th>
                      <th className="receipt-text-center">QTY</th>
                      <th className="receipt-text-right">RATE</th>
                      <th className="receipt-text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="receipt-item-name">{item.name}</td>
                        <td className="receipt-text-center">{item.quantity}</td>
                        <td className="receipt-text-right">{formatPrice(item.rate)}</td>
                        <td className="receipt-text-right">{formatPrice(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="receipt-totals">
                  <div className="receipt-totals-box">
                    <div className="receipt-total-row"><span>Subtotal:</span><span>{formatPrice(receiptData.subtotal)}</span></div>
                    {receiptData.discountTotal > 0 && (
                      <div className="receipt-total-row discount"><span>Discount:</span><span>-{formatPrice(receiptData.discountTotal)}</span></div>
                    )}
                    {receiptData.tax > 0 && (
                      <div className="receipt-total-row"><span>Tax:</span><span>{formatPrice(receiptData.tax)}</span></div>
                    )}
                    {receiptData.deliveryPrice > 0 && (
                      <div className="receipt-total-row"><span>Delivery:</span><span>{formatPrice(receiptData.deliveryPrice)}</span></div>
                    )}
                    <div className="receipt-grand-total">
                      <span>TOTAL:</span>
                      <span>{formatPrice(receiptData.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Thank You */}
                <div className="receipt-thankyou">
                  <h3>Thank You for Shopping with BRB Beauty!</h3>
                  <p>We appreciate your business — glowing beauty, guaranteed elegance.</p>
                </div>
              </div>
            </div>
            <div className="receipt-modal-footer">
              <button className="btn-print" onClick={exportToPDF}><i className="fas fa-file-pdf"></i> Export PDF</button>
              <button className="btn-close" onClick={() => setShowReceiptModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      <style>{`
        .receipt-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }
        .receipt-modal-content {
          background: white;
          border-radius: 24px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          animation: fadeInUp 0.3s ease;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .receipt-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #E8E8E8;
          background: #F5F5F5;
          border-radius: 24px 24px 0 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .receipt-modal-header h3 { margin: 0; color: #577a52; }
        .close-modal-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #4A4A4A; }
        .receipt-modal-body { padding: 1.5rem; background: white; }
        .receipt-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #E8E8E8;
          background: #F5F5F5;
          border-radius: 0 0 24px 24px;
          position: sticky;
          bottom: 0;
          z-index: 10;
        }
        .btn-print, .btn-close {
          padding: 0.6rem 1.5rem;
          border-radius: 40px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-print { background: #577a52; color: white; display: inline-flex; align-items: center; gap: 0.5rem; }
        .btn-close { background: #E8E8E8; color: #1a1a1a; }
        .btn-primary {
          background: #577a52;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media print {
          .receipt-modal-overlay, .receipt-modal-header, .receipt-modal-footer,
          .close-modal-btn, .btn-print, .btn-close { display: none !important; }
          .receipt-modal-content { box-shadow: none; padding: 0; margin: 0; }
          .receipt-modal-body { padding: 0; }
        }
      `}</style>
    </div>
  );
};

export default SingleOrder;