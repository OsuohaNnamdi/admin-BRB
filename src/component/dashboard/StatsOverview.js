// components/StatsOverview.js
import React from 'react';
import '../../styles/StatsOverview.css';

const StatsOverview = ({ data }) => {

  const formatCurrency = (price) => {
    if (!price) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getChangeClass = (value) => {
    if (value > 0) return 'dashboard-stat-change--positive';
    if (value < 0) return 'dashboard-stat-change--negative';
    return 'dashboard-stat-change--neutral';
  };

  const cards = [
    {
      title: "Total Users",
      value: data?.totals?.users?.value || 0,
      change: data?.totals?.users?.percentage_change || 0,
      icon: (
        <svg className="dashboard-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
          <path d="M16 3.13a4 4 0 010 7.75"></path>
        </svg>
      ),
      color: "#3b82f6"
    },
    {
      title: "Total Orders",
      value: data?.totals?.orders?.value || 0,
      change: data?.totals?.orders?.percentage_change || 0,
      icon: (
        <svg className="dashboard-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
          <path d="M3 6h18"></path>
          <path d="M16 10a4 4 0 01-8 0"></path>
        </svg>
      ),
      color: "#10b981"
    },
    {
      title: "Units Sold",
      value: data?.totals?.sales?.units_sold?.this_month || 0,
      change: data?.totals?.sales?.units_sold?.percentage_change || 0,
      icon: (
        <svg className="dashboard-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      ),
      color: "#8b5cf6"
    },
    {
      title: "Revenue",
      value: data?.totals?.revenue?.this_month || 0,
      change: data?.totals?.revenue?.percentage_change || 0,
      icon: (
        <svg className="dashboard-stat-icon" viewBox="0 0 24 24" fill="currentColor">
          <text x="12" y="18" textAnchor="middle" fontSize="16" fontWeight="bold">₦</text>
        </svg>
      ),
      color: "#f59e0b"
    }
  ];

  return (
    <div className="dashboard-stats-grid">
      {cards.map((stat, index) => (
        <div key={index} className="dashboard-stat-card" style={{ borderLeftColor: stat.color }}>
          <div className="dashboard-stat-icon-container" style={{ color: stat.color }}>
            {stat.icon}
          </div>
          <div className="dashboard-stat-content">
            <h3 className="dashboard-stat-value">
              {stat.title === 'Revenue' ? formatCurrency(stat.value) : stat.value}
            </h3>
            <p className="dashboard-stat-title">{stat.title}</p>
            <div className={`dashboard-stat-change ${getChangeClass(stat.change)}`}>
              {formatPercentage(stat.change)} from last month
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;