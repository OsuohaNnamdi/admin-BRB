// components/BestSellingProducts.js
import React from 'react';
import '../../styles/BestSellingProducts.css';

const BestSellingProducts = ({ data }) => {
  const products = data?.best_selling_products || [];
  
  if (products.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p>No sales data available</p>
      </div>
    );
  }

  const totalSold = products.reduce((sum, product) => sum + product.total_sold, 0);

  return (
    <div className="dashboard-best-selling-section">
      <div className="dashboard-products-list">
        {products.map((product, index) => {
          const percentage = ((product.total_sold / totalSold) * 100).toFixed(1);
          
          return (
            <div key={product.product__id} className="dashboard-product-item">
              <div className="dashboard-product-item-header">
                <div className="dashboard-product-item-rank">
                  <span className="dashboard-rank-badge">#{index + 1}</span>
                  <div className="dashboard-product-item-info">
                    <h4 className="dashboard-product-item-name">{product.product__name}</h4>
                    <span className="dashboard-product-item-sales">{product.total_sold} sold</span>
                  </div>
                </div>
                <span className="dashboard-product-item-percentage">{percentage}%</span>
              </div>
              <div className="dashboard-product-item-progress">
                <div 
                  className="dashboard-product-item-progress-bar"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BestSellingProducts;