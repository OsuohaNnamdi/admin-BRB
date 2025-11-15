// components/ProductsTable.js
import React from 'react';
import '../styles/Tables.css';

const ProductsTable = () => {
  const products = [
    {
      id: "PRD-001",
      name: "Matte Liquid Lipstick",
      category: "Makeup",
      price: "$24.99",
      stock: 45,
      sales: 234,
      rating: 4.8
    },
    {
      id: "PRD-002",
      name: "Hydrating Face Serum",
      category: "Skincare",
      price: "$39.99",
      stock: 23,
      sales: 189,
      rating: 4.9
    },
    {
      id: "PRD-003",
      name: "Volume Mascara",
      category: "Makeup",
      price: "$19.99",
      stock: 67,
      sales: 312,
      rating: 4.7
    },
    {
      id: "PRD-004",
      name: "Anti-Aging Cream",
      category: "Skincare",
      price: "$49.99",
      stock: 12,
      sales: 156,
      rating: 4.6
    },
    {
      id: "PRD-005",
      name: "Eyeshadow Palette",
      category: "Makeup",
      price: "$34.99",
      stock: 34,
      sales: 278,
      rating: 4.8
    }
  ];

  const getStockStatus = (stock) => {
    if (stock > 50) return 'in-stock';
    if (stock > 20) return 'low-stock';
    return 'out-of-stock';
  };

  const getStockText = (stock) => {
    if (stock > 50) return 'In Stock';
    if (stock > 20) return 'Low Stock';
    return 'Out of Stock';
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Sales</th>
            <th>Rating</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td className="font-mono">{product.id}</td>
              <td>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                </div>
              </td>
              <td>
                <span className="category-badge">{product.category}</span>
              </td>
              <td className="font-semibold">{product.price}</td>
              <td>
                <span className={`stock-badge ${getStockStatus(product.stock)}`}>
                  {getStockText(product.stock)}
                </span>
              </td>
              <td>{product.sales}</td>
              <td>
                <div className="rating">
                  <span className="rating-stars">★★★★★</span>
                  <span className="rating-value">{product.rating}</span>
                </div>
              </td>
              <td>
                <button className="action-button edit-button">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;