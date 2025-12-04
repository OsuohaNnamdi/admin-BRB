import React from 'react';
import '../../styles/RecentOrders.css';
import { useOrder } from '../../context/OrderContext';
import { useNavigate } from 'react-router-dom';

const RecentOrders = ({ data }) => {
  const orders = data?.recent?.orders || [];
  const { selectOrder,} = useOrder();

  const navigate = useNavigate();

  const handleViewOrder = (order) => {
    // Store order in context
    selectOrder(order);
    
    // Navigate to single order page
    navigate('/order');
  };
  
  const formatCurrency = (price) => {
    if (!price) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'dashboard-status-completed';
      case 'processing': return 'dashboard-status-processing';
      case 'pending': return 'dashboard-status-pending';
      case 'cancelled': return 'dashboard-status-cancelled';
      case 'refunded': return 'dashboard-status-refunded';
      default: return 'dashboard-status-pending';
    }
  };

  const getStatusText = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending';
  };

  const getTotalItems = (items) => {
    return items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  if (orders.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p>No recent orders</p>
      </div>
    );
  }

  return (
    <div className="dashboard-table-container">
      <table className="dashboard-data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Items</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="dashboard-table-row">
              <td className="dashboard-order-id">ORD-{order.id.toString().padStart(4, '0')}</td>
              <td className="dashboard-order-date">{formatDate(order.created_at)}</td>
              <td className="dashboard-order-total">{formatCurrency(order.total)}</td>
              <td className="dashboard-order-items">{getTotalItems(order.items)} items</td>
              <td className="dashboard-order-status">
                <span className={`dashboard-status-badge ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </td>
              <td className="dashboard-order-action">
                <button className="dashboard-action-button dashboard-view-button" onClick={() => handleViewOrder(order)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrders;