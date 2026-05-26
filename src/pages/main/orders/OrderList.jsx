import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../../../styles/OrderList.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SettingsPanel from '../../../component/SettingsPanel';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../../context/OrderContext';

const OrderList = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  
  // Refs to prevent unnecessary re-renders
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();
  const {
    orders,
    loading,
    selectOrder,
    updateOrders,
    updateOrderStatus,
    setLoading
  } = useOrder();
  
  const navigate = useNavigate();

  // Stabilize alert functions to prevent re-renders
  const showErrorStable = useCallback((message, title, options) => {
    showError(message, title, options);
  }, [showError]);

  const showSuccessStable = useCallback((message, title) => {
    showSuccess(message, title);
  }, [showSuccess]);

  const showLoadingStable = useCallback((message, title) => {
    return showLoading(message, title);
  }, [showLoading]);

  const removeAlertStable = useCallback((id) => {
    if (id) removeAlert(id);
  }, [removeAlert]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Stabilized fetchOrders function
  const fetchOrders = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetching) return;
    
    setIsFetching(true);
    setLoading(true);
    
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await ApiService.getAdminOrders({
        signal: abortControllerRef.current.signal
      });
      
      if (!isMountedRef.current) return;
      
      console.log('Orders fetched:', response.data);
      const ordersData = response.data.orders || response.data || [];
      updateOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      if (!isMountedRef.current) return;
      
      if (error.name !== 'AbortError') {
        console.error('Error fetching orders:', error);
        showErrorStable(
          'Failed to load orders. Please try again.',
          'Load Error',
          { duration: 5000 }
        );
        updateOrders([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  }, [setLoading, updateOrders, showErrorStable, isFetching]);

  // Updated updateOrderStatusAPI with proper error handling
  const updateOrderStatusAPI = useCallback(async (orderId, newStatus) => {
    let loadingAlertId;
    try {
      loadingAlertId = showLoadingStable('Updating order status...', 'Processing');
      
      const statusData = {
        status: newStatus
      };
      
      await ApiService.updateOrderStatus(orderId, statusData);
      
      if (!isMountedRef.current) return;
      
      // Update the order status in context
      updateOrderStatus(orderId, newStatus);
      
      if (loadingAlertId) {
        removeAlertStable(loadingAlertId);
      }
      showSuccessStable('Order status updated successfully!', 'Update Successful');
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error('Error updating order status:', error);
      if (loadingAlertId) {
        removeAlertStable(loadingAlertId);
      }
      handleUpdateError(error);
    }
  }, [updateOrderStatus, showLoadingStable, removeAlertStable, showSuccessStable]);

  const handleUpdateError = useCallback((error) => {
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
      
      showErrorStable(errorMessage.trim(), 'Update Failed', { duration: 6000 });
    } else if (error.response?.status === 400) {
      showErrorStable('Invalid status data.', 'Validation Error', { duration: 5000 });
    } else if (error.response?.status === 401) {
      showErrorStable('Authentication required. Please login again.', 'Session Expired', { duration: 5000 });
    } else if (error.response?.status === 403) {
      showErrorStable('You do not have permission to update orders.', 'Access Denied', { duration: 5000 });
    } else if (error.response?.status === 404) {
      showErrorStable('Order not found.', 'Not Found', { duration: 5000 });
    } else if (error.message === 'Network Error') {
      showErrorStable('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
    } else {
      showErrorStable('Failed to update order. Please try again.', 'Update Failed', { duration: 5000 });
    }
  }, [showErrorStable]);

  // Handle view order
  const handleViewOrder = useCallback((order) => {
    selectOrder(order);
    navigate('/order');
  }, [selectOrder, navigate]);

  // Setup and cleanup
  useEffect(() => {
    isMountedRef.current = true;
    fetchOrders();
    
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchOrders]);

  // Filter orders with memoization to prevent unnecessary recalculations
  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id?.toString().includes(searchTerm) ||
        order.order_number?.toString().includes(searchTerm) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => 
          item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus = 
        !statusFilter || 
        order.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesDate = 
        !dateFilter || 
        (dateFilter === 'today' && isToday(order.created_at || order.order_date)) ||
        (dateFilter === 'week' && isThisWeek(order.created_at || order.order_date)) ||
        (dateFilter === 'month' && isThisMonth(order.created_at || order.order_date));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  // Date helper functions (memoized)
  const isToday = useCallback((dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  const isThisWeek = useCallback((dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  }, []);

  const isThisMonth = useCallback((dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }, []);

  // Fixed status badge mapping
  const getStatusBadge = useCallback((status) => {
    const statusMap = {
      pending: 'pending',
      paid: 'paid', // Fixed from 'paided' to 'paid'
      shipped: 'shipped',
      completed: 'completed',
      cancelled: 'cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'pending';
  }, []);

  // Formatting functions (memoized)
  const formatPrice = useCallback((price) => {
    if (!price) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const handleStatusChange = useCallback(async (orderId, currentStatus, newStatus) => {
    if (newStatus !== currentStatus) {
      await updateOrderStatusAPI(orderId, newStatus);
    }
  }, [updateOrderStatusAPI]);

  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleDateFilterChange = useCallback((e) => {
    setDateFilter(e.target.value);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
  }, []);

  const hasActiveFilters = searchTerm || statusFilter || dateFilter;

  const getTotalItems = useCallback((order) => {
    return order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  }, []);

  const getOrderTotal = useCallback((order) => {
    return order.total_amount || order.total || order.grand_total || 0;
  }, []);

  const getCustomerName = useCallback((order) => {
    return order.customer_name || order.customer?.name || order.user?.name || 'N/A';
  }, []);

  const getProductName = useCallback((item) => {
    return item.product_name || item.product?.name || 'Unknown Product';
  }, []);

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
              
              <div className="order-list-container">
                <div className="order-list-header">
                  <div className="header-content">
                    <h1>Orders</h1>
                    <p>Manage customer orders and track order status</p>
                  </div>
                  <div className="header-actions">
                    <button 
                      className="refresh-btn"
                      onClick={fetchOrders}
                      title="Refresh orders"
                      disabled={isFetching}
                    >
                      {isFetching ? '🔄 Loading...' : '🔄 Refresh'}
                    </button>
                  </div>
                </div>

                <div className="order-list-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search by order ID, customer name, email, or product..."
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
                      onChange={handleStatusFilterChange}
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <select 
                      className="filter-select"
                      value={dateFilter}
                      onChange={handleDateFilterChange}
                    >
                      <option value="">All Dates</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
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
                    {statusFilter && (
                      <span className="filter-tag">
                        Status: {statusFilter}
                        <button onClick={() => setStatusFilter('')}>×</button>
                      </span>
                    )}
                    {dateFilter && (
                      <span className="filter-tag">
                        Date: {dateFilter}
                        <button onClick={() => setDateFilter('')}>×</button>
                      </span>
                    )}
                  </div>
                )}

                <div className="order-list-content">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading orders...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <h3>No orders found</h3>
                      <p>
                        {hasActiveFilters 
                          ? 'No orders match your current filters. Try adjusting your search criteria.' 
                          : 'No orders have been placed yet.'
                        }
                      </p>
                      {hasActiveFilters && (
                        <button 
                          className="refresh-btn empty-state-btn"
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="orders-container">
                      {/* Desktop Table View */}
                      <div className="orders-table-container desktop-view">
                        <table className="orders-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Items</th>
                              <th>Total</th>
                              <th>Status</th>
                              <th>Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.map(order => (
                              <tr key={order.id}>
                                <td>
                                  <div className="order-id">
                                    ORD-{order.id.toString().padStart(4, '0')}
                                  </div>
                                </td>
                                <td>
                                  <div className="customer-info">
                                    <div className="customer-name">
                                      {getCustomerName(order)}
                                    </div>
                                    {order.customer_email && (
                                      <div className="customer-email">
                                        {order.customer_email}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="order-items">
                                    <div className="items-count">
                                      {getTotalItems(order)} items
                                    </div>
                                    <div className="items-preview">
                                      {order.items?.slice(0, 2).map((item, index) => (
                                        <span key={item.id || index} className="item-name">
                                          {getProductName(item)}
                                          {index < Math.min(order.items.length - 1, 1) && ', '}
                                        </span>
                                      ))}
                                      {order.items?.length > 2 && (
                                        <span className="more-items">+{order.items.length - 2} more</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="order-total">
                                    {formatPrice(getOrderTotal(order))}
                                  </div>
                                </td>
                                <td>
                                  <div className="status-control">
                                    <span className={`status-badge ${getStatusBadge(order.status)}`}>
                                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                    </span>
                                    <select 
                                      className="status-select"
                                      value={order.status || 'pending'}
                                      onChange={(e) => handleStatusChange(order.id, order.status, e.target.value)}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="paid">Paid</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="completed">Completed</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                </td>
                                <td>
                                  <div className="order-date">
                                    {formatDate(order.created_at || order.order_date)}
                                  </div>
                                </td>
                                <td>
                                  <div className="action-buttons">
                                    <button 
                                      className="action-btn view-btn"
                                      onClick={() => handleViewOrder(order)}
                                      title="View order details"
                                    >
                                      👁️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="orders-cards-container mobile-view">
                        {filteredOrders.map(order => (
                          <div key={order.id} className="order-card">
                            <div className="card-header">
                              <div className="order-id">Order #{order.order_number || order.id}</div>
                              <div className="order-date">
                                {formatDate(order.created_at || order.order_date)}
                              </div>
                            </div>
                            <div className="card-content">
                              <div className="customer-info-mobile">
                                <strong>{getCustomerName(order)}</strong>
                                {order.customer_email && (
                                  <div className="customer-email">{order.customer_email}</div>
                                )}
                              </div>
                              <div className="order-items-mobile">
                                <strong>{getTotalItems(order)} items</strong>
                                <div className="items-list">
                                  {order.items?.slice(0, 3).map((item, index) => (
                                    <div key={item.id || index} className="mobile-item">
                                      {item.quantity || 1}x {getProductName(item)}
                                    </div>
                                  ))}
                                  {order.items?.length > 3 && (
                                    <div className="more-items">+{order.items.length - 3} more items</div>
                                  )}
                                </div>
                              </div>
                              <div className="order-total-mobile">
                                Total: {formatPrice(getOrderTotal(order))}
                              </div>
                            </div>
                            <div className="card-footer">
                              <div className="status-control-mobile">
                                <span className={`status-badge ${getStatusBadge(order.status)}`}>
                                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                </span>
                                <select 
                                  className="status-select"
                                  value={order.status || 'pending'}
                                  onChange={(e) => handleStatusChange(order.id, order.status, e.target.value)}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="paid">Paid</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                              <button 
                                className="action-btn view-btn"
                                onClick={() => handleViewOrder(order)}
                                title="View order details"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!loading && filteredOrders.length > 0 && (
                  <div className="order-list-footer">
                    <div className="pagination-info">
                      Showing {filteredOrders.length} of {orders.length} orders
                      {hasActiveFilters && ' (filtered)'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default OrderList;
