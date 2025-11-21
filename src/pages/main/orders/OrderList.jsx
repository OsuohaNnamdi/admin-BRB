import React, { useState, useEffect } from 'react';
import '../../../styles/OrderList.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SettingsPanel from '../../../component/SettingsPanel';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';
import { useNavigate } from 'react-router-dom';

const OrderList = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navigate = useNavigate();

  // API functions - Updated to match the correct endpoint
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getAdminOrders();
      console.log('Orders fetched:', response.data);
      
      // Handle different response formats
      const ordersData = response.data.orders || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError(
        'Failed to load orders. Please try again.',
        'Load Error',
        { duration: 5000 }
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Updated to match the API endpoint structure
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const loadingAlertId = showLoading('Updating order status...', 'Processing');
      
      // Create the status data object as expected by the API
      const statusData = {
        status: newStatus
      };
      
      await ApiService.updateOrderStatus(orderId, statusData);
      removeAlert(loadingAlertId);
      showSuccess('Order status updated successfully!', 'Update Successful');
      await fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating order status:', error);
      handleUpdateError(error);
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
    } else if (error.message === 'Network Error') {
      showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
    } else {
      showError('Failed to update order. Please try again.', 'Update Failed', { duration: 5000 });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search term and filters
  const filteredOrders = orders.filter(order => {
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

  // Date helper functions
  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  };

  const isThisMonth = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'pending',
      confirmed: 'confirmed',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled',
      completed: 'completed',
      refunded: 'refunded'
    };
    return statusMap[status?.toLowerCase()] || 'pending';
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'completed'],
      delivered: ['completed'],
      completed: [],
      cancelled: [],
      refunded: []
    };
    return statusFlow[currentStatus] || [];
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

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

  const handleStatusChange = async (orderId, currentStatus, newStatus) => {
    if (newStatus !== currentStatus) {
      await updateOrderStatus(orderId, newStatus);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter || dateFilter;

  const getTotalItems = (order) => {
    return order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  };

  const getOrderTotal = (order) => {
    return order.total_amount || order.total || order.grand_total || 0;
  };

  const getCustomerName = (order) => {
    return order.customer_name || order.customer?.name || order.user?.name || 'N/A';
  };

  const getProductName = (item) => {
    return item.product_name || item.product?.name || 'Unknown Product';
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
                    >
                      🔄 Refresh
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
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
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
                                    #{order.order_number || order.id}
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
                                      <option value="confirmed">Confirmed</option>
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="completed">Completed</option>
                                      <option value="cancelled">Cancelled</option>
                                      <option value="refunded">Refunded</option>
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
                                       onClick={() => navigate(`/order`)}
                                      // onClick={() => navigate(`/order/${order.id}`)}
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
                                  <option value="confirmed">Confirmed</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="refunded">Refunded</option>
                                </select>
                              </div>
                              <button 
                                className="action-btn view-btn"
                                 onClick={() => navigate(`/order`)}
                                // onClick={() => navigate(`/order/${order.id}`)}
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

export default OrderList;