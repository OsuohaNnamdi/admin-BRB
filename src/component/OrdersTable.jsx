// components/OrdersTable.js
import React from 'react';
import '../styles/Tables.css';

const OrdersTable = () => {
  const orders = [
    {
      id: "BRB-2024-001",
      customer: "Sarah Johnson",
      date: "2024-01-15",
      amount: "$124.99",
      status: "completed",
      items: 3
    },
    {
      id: "BRB-2024-002",
      customer: "Mike Chen",
      date: "2024-01-15",
      amount: "$89.50",
      status: "processing",
      items: 2
    },
    {
      id: "BRB-2024-003",
      customer: "Emily Davis",
      date: "2024-01-14",
      amount: "$156.75",
      status: "completed",
      items: 4
    },
    {
      id: "BRB-2024-004",
      customer: "Alex Rodriguez",
      date: "2024-01-14",
      amount: "$67.25",
      status: "pending",
      items: 1
    },
    {
      id: "BRB-2024-005",
      customer: "Jessica Brown",
      date: "2024-01-13",
      amount: "$234.00",
      status: "completed",
      items: 5
    }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'pending': return 'Pending';
      default: return 'Pending';
    }
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Items</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index}>
              <td className="font-mono">{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.date}</td>
              <td className="font-semibold">{order.amount}</td>
              <td>{order.items} items</td>
              <td>
                <span className={`status-badge ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </td>
              <td>
                <button className="action-button view-button">
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

export default OrdersTable;