// components/MainContent.js
import React from 'react';
import '../../styles/MainContent.css';
import OrdersTable from '../../component/OrdersTable';
import ProductsTable from '../../component/ProductsTable';
import StatsCards from '../../component/StatsCards';
import ReviewsTable from '../../component/ReviewsTable';


const MainContent = () => {
  return (
    <div className="main-content">
      <div className="main-content-inner">
        <div className="main-content-wrap">
          {/* Stats Section */}
          <div className="content-section">
            <h2 className="section-title">Dashboard Overview</h2>
            <StatsCards />
          </div>

          {/* Charts Section - You can add charts here later */}
          {/* <div className="content-section">
            <ChartsSection />
          </div> */}

          {/* Recent Orders */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Recent Orders</h2>
              <a href="/orders" className="view-all-link">View All</a>
            </div>
            <OrdersTable />
          </div>

          {/* Products Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Popular Products</h2>
              <a href="/products" className="view-all-link">View All</a>
            </div>
            <ProductsTable />
          </div>

          {/* Reviews Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Recent Reviews</h2>
              <a href="/reviews" className="view-all-link">View All</a>
            </div>
            <ReviewsTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;