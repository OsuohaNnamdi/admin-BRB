// components/Dashboard.js (Complete)
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatsOverview from '../../component/dashboard/StatsOverview';
import AnalyticsSection from '../../component/dashboard/AnalyticsSection';
import RecentOrders from '../../component/dashboard/RecentOrders';
import BestSellingProducts from '../../component/dashboard/BestSellingProducts';
import '../../styles/Dashboard.css';
import SettingsPanel from '../../component/SettingsPanel';
import ApiService from '../../config/ApiService';
import ProductsSection from '../../component/dashboard/ProductsSection';

const Dashboard = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAdminDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-gradient-bar"></div>
      
      <div className="dashboard-wrapper">
        <div className="dashboard-page">
          <div className="dashboard-layout">
            <Sidebar 
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              onClose={closeSidebar}
            />
            <div className="dashboard-content">
              <Header 
                onToggleSidebar={toggleSidebar}
                onSettingsClick={() => setSettingsOpen(true)} 
                onRefresh={fetchDashboardData}
              />
              
              {loading ? (
                <div className="dashboard-loading-container">
                  <div className="dashboard-loading-spinner"></div>
                  <p className="dashboard-loading-text">Loading dashboard data...</p>
                </div>
              ) : error ? (
                <div className="dashboard-error-container">
                  <div className="dashboard-error-icon">⚠️</div>
                  <h3 className="dashboard-error-title">{error}</h3>
                  <button 
                    onClick={fetchDashboardData} 
                    className="dashboard-retry-button"
                  >
                    Retry
                  </button>
                </div>
              ) : dashboardData ? (
                <div className="dashboard-main-content">
                  <div className="dashboard-content-wrap">
                    {/* Stats Overview */}
                    <div className="dashboard-section">
                      <h2 className="dashboard-section-title">Dashboard Overview</h2>
                      <StatsOverview data={dashboardData} />
                    </div>

                    {/* Analytics Grid */}
                    <div className="dashboard-section">
                      <AnalyticsSection data={dashboardData} />
                    </div>

                    {/* Recent Activity Grid */}
                    <div className="dashboard-section dashboard-grid-section">
                      <div className="dashboard-sub-section">
                        <div className="dashboard-section-header">
                          <h2 className="dashboard-section-title">Recent Orders</h2>
                          <a href="/admin/orders" className="dashboard-view-all-link">View All</a>
                        </div>
                        <RecentOrders data={dashboardData} />
                      </div>

                      <div className="dashboard-sub-section">
                        <div className="dashboard-section-header">
                          <h2 className="dashboard-section-title">Best Selling Products</h2>
                          <a href="/admin/products" className="dashboard-view-all-link">View All</a>
                        </div>
                        <BestSellingProducts data={dashboardData} />
                      </div>
                    </div>

                    {/* Products Section */}
                    <div className="dashboard-section">
                      <div className="dashboard-section-header">
                        <h2 className="dashboard-section-title">Recent Products</h2>
                        <a href="/admin/products" className="dashboard-view-all-link">View All</a>
                      </div>
                      <ProductsSection data={dashboardData} />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default Dashboard;