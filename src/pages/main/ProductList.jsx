// pages/main/ProductList.js
import React, { useState, useEffect } from 'react';
import '../../styles/ProductList.css';
import Header from './Header';
import Sidebar from './Sidebar';
import SettingsPanel from '../../component/SettingsPanel';
import ProductModal from '../../component/ProductModal';

const ProductList = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Mock API functions
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockProducts = [
        {
          id: 1,
          name: 'Wireless Bluetooth Headphones',
          category: 'Electronics',
          price: 79.99,
          stock: 45,
          status: 'active',
          image: 'https://via.placeholder.com/60x60'
        },
        {
          id: 2,
          name: 'Running Shoes',
          category: 'Sports',
          price: 129.99,
          stock: 23,
          status: 'active',
          image: 'https://via.placeholder.com/60x60'
        },
        {
          id: 3,
          name: 'Coffee Maker',
          category: 'Home',
          price: 49.99,
          stock: 0,
          status: 'inactive',
          image: 'https://via.placeholder.com/60x60'
        },
        {
          id: 4,
          name: 'Smart Watch',
          category: 'Electronics',
          price: 199.99,
          stock: 15,
          status: 'active',
          image: 'https://via.placeholder.com/60x60'
        },
        {
          id: 5,
          name: 'Yoga Mat',
          category: 'Sports',
          price: 29.99,
          stock: 67,
          status: 'active',
          image: 'https://via.placeholder.com/60x60'
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProduct = {
        id: Math.max(...products.map(p => p.id)) + 1,
        ...productData,
        image: 'https://via.placeholder.com/60x60'
      };
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (error) {
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(prev => prev.map(product => 
        product.id === id ? { ...product, ...productData } : product
      ));
    } catch (error) {
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleModalSubmit = async (productData) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      setModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      await deleteProduct(selectedProduct.id);
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    return status === 'active' ? 'active' : 'inactive';
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
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
              
              <div className="product-list-container">
                <div className="product-list-header">
                  <div className="header-content">
                    <h1>Products</h1>
                    <p>Manage your product inventory and listings</p>
                  </div>
                  <button 
                    className="add-product-btn"
                    onClick={handleAdd}
                  >
                    <span>+ Add Product</span>
                  </button>
                </div>

                <div className="product-list-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  
                  <div className="filter-controls">
                    <select className="filter-select">
                      <option value="">All Categories</option>
                      <option value="electronics">Electronics</option>
                      <option value="sports">Sports</option>
                      <option value="home">Home</option>
                    </select>
                    
                    <select className="filter-select">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="product-list-content">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading products...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <h3>No products found</h3>
                      <p>Try adjusting your search or add a new product</p>
                    </div>
                  ) : (
                    <div className="products-table-container">
                      <table className="products-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map(product => (
                            <tr key={product.id}>
                              <td>
                                <div className="product-info">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="product-image"
                                  />
                                  <div className="product-details">
                                    <div className="product-name">{product.name}</div>
                                    <div className="product-id">ID: {product.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="category-badge">{product.category}</span>
                              </td>
                              <td>
                                <div className="price">${product.price}</div>
                              </td>
                              <td>
                                <span className={`stock-badge ${getStockBadge(product.stock)}`}>
                                  {product.stock} in stock
                                </span>
                              </td>
                              <td>
                                <span className={`status-badge ${getStatusBadge(product.status)}`}>
                                  {product.status}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    className="action-btn edit-btn"
                                    onClick={() => handleEdit(product)}
                                    title="Edit product"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    className="action-btn delete-btn"
                                    onClick={() => handleDelete(product)}
                                    title="Delete product"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {!loading && filteredProducts.length > 0 && (
                  <div className="product-list-footer">
                    <div className="pagination-info">
                      Showing {filteredProducts.length} of {products.length} products
                    </div>
                    <div className="pagination-controls">
                      <button className="pagination-btn" disabled>Previous</button>
                      <button className="pagination-btn active">1</button>
                      <button className="pagination-btn">2</button>
                      <button className="pagination-btn">Next</button>
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
      
      {/* Product Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleModalSubmit}
        product={selectedProduct}
      />
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Delete Product</h3>
            </div>
            <div className="delete-modal-content">
              <div className="warning-icon">⚠️</div>
              <p>
                Are you sure you want to delete <strong>"{selectedProduct?.name}"</strong>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="delete-modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={handleDeleteConfirm}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;