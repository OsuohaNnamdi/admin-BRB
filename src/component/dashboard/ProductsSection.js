import React from 'react';
import '../../styles/ProductsSection.css';
import { useNavigate } from 'react-router-dom';

const ProductsSection = ({ data }) => {
  const products = data?.recent?.products || [];
  
  const formatCurrency = (price) => {
    if (!price) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const navigate = useNavigate()

  const getStockStatus = (stock) => {
    if (stock > 10) return { class: 'dashboard-in-stock', color: '#10b981' };
    if (stock > 0) return { class: 'dashboard-low-stock', color: '#f59e0b' };
    return { class: 'dashboard-out-of-stock', color: '#ef4444' };
  };

  if (products.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p>No products available</p>
      </div>
    );
  }

  return (
    <div className="dashboard-products-grid">
      {products.map((product) => {
        const stockStatus = getStockStatus(product.stock);
        
        return (
          <div key={product.id} className="dashboard-product-card">
            <div className="dashboard-product-card-image">
              <img 
                src={product.main_image_url} 
                alt={product.name}
                className="dashboard-product-card-img"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                }}
              />
              <div className="dashboard-product-card-overlay"></div>
            </div>
            <div className="dashboard-product-card-content">
              <div className="dashboard-product-card-header">
                <h3 className="dashboard-product-card-name">{product.name}</h3>
                <span className="dashboard-product-card-price">{formatCurrency(product.price)}</span>
              </div>
              
              <div className="dashboard-product-card-meta">
                <span className="dashboard-product-card-category">
                  {product.category?.name || 'Uncategorized'}
                </span>
                <span 
                  className={`dashboard-product-card-stock ${stockStatus.class}`}
                  style={{ color: stockStatus.color }}
                >
                  {stockStatus.class === 'dashboard-in-stock' ? '✓' : '⚠'} {product.stock} in stock
                </span>
              </div>
              
              <p className="dashboard-product-card-description">
                {product.description?.substring(0, 80) || 'No description available'}...
              </p>
              
              <div className="dashboard-product-card-actions">
                <button className="dashboard-btn dashboard-btn-outline" onClick={() => navigate("/product")}>
                  <svg className="dashboard-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
                <button className="dashboard-btn dashboard-btn-primary" onClick={() => navigate("/product")}>
                  <svg className="dashboard-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  View
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductsSection;