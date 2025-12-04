// components/AnalyticsSection.js
import React from 'react';
import '../../styles/AnalyticsSection.css';

const AnalyticsSection = ({ data }) => {
  const productMetrics = [
    {
      label: "Total Products",
      value: data?.analysis?.products?.total_products || 0,
      color: "#3b82f6",
      icon: "📦"
    },
    {
      label: "Active Products",
      value: data?.analysis?.products?.active_products || 0,
      color: "#10b981",
      icon: "✅"
    },
    {
      label: "Inactive Products",
      value: data?.analysis?.products?.inactive_products || 0,
      color: "#6b7280",
      icon: "⏸️"
    },
    {
      label: "Low Stock",
      value: data?.analysis?.products?.low_stock || 0,
      color: "#f59e0b",
      icon: "⚠️"
    }
  ];

  const orderMetrics = [
    {
      label: "Pending",
      value: data?.analysis?.orders?.pending || 0,
      color: "#f59e0b",
      icon: "⏳"
    },
    {
      label: "Completed",
      value: data?.analysis?.orders?.completed || 0,
      color: "#10b981",
      icon: "✅"
    },
    {
      label: "Cancelled",
      value: data?.analysis?.orders?.cancelled || 0,
      color: "#ef4444",
      icon: "❌"
    },
    {
      label: "Refunded",
      value: data?.analysis?.orders?.refunded || 0,
      color: "#8b5cf6",
      icon: "↩️"
    }
  ];

  return (
    <div className="dashboard-analytics-section">
      <h3 className="dashboard-analytics-title">Analytics Overview</h3>
      <div className="dashboard-analytics-grid">
        <div className="dashboard-analytics-card">
          <div className="dashboard-analytics-card-header">
            <h4 className="dashboard-analytics-card-title">Product Analytics</h4>
            <span className="dashboard-analytics-card-subtitle">Inventory Status</span>
          </div>
          <div className="dashboard-analytics-card-metrics">
            {productMetrics.map((metric, index) => (
              <div key={index} className="dashboard-metric-item">
                <div 
                  className="dashboard-metric-item-icon" 
                  style={{ backgroundColor: `${metric.color}15`, color: metric.color }}
                >
                  {metric.icon}
                </div>
                <div className="dashboard-metric-item-content">
                  <span className="dashboard-metric-item-value">{metric.value}</span>
                  <span className="dashboard-metric-item-label">{metric.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-analytics-card">
          <div className="dashboard-analytics-card-header">
            <h4 className="dashboard-analytics-card-title">Order Analytics</h4>
            <span className="dashboard-analytics-card-subtitle">Order Status</span>
          </div>
          <div className="dashboard-analytics-card-metrics">
            {orderMetrics.map((metric, index) => (
              <div key={index} className="dashboard-metric-item">
                <div 
                  className="dashboard-metric-item-icon" 
                  style={{ backgroundColor: `${metric.color}15`, color: metric.color }}
                >
                  {metric.icon}
                </div>
                <div className="dashboard-metric-item-content">
                  <span className="dashboard-metric-item-value">{metric.value}</span>
                  <span className="dashboard-metric-item-label">{metric.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;