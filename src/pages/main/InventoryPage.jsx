import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/ProductList.css';
import '../../styles/Inventory.css';
import Header from './Header';
import Sidebar from './Sidebar';
import SettingsPanel from '../../component/SettingsPanel';
import ApiService from '../../config/ApiService';
import { useAlert } from '../../context/alert/AlertContext';

const InventoryPage = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // API functions - Updated to handle paginated response
  const fetchProducts = useCallback(async (page = 1, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await ApiService.getAdminInventory(page);
      // // console.log('Inventory fetched:', response.data);
      
      // Handle the paginated response format
      const { results, count, total_pages, current_page, page_size } = response.data;
      
      const productsData = results || [];
      
      if (append) {
        setProducts(prevProducts => [...prevProducts, ...productsData]);
      } else {
        setProducts(productsData);
        setFilteredProducts(productsData);
      }
      
      // Update pagination state
      setPagination({
        currentPage: current_page || page,
        totalPages: total_pages || 1,
        totalCount: count || 0,
        pageSize: page_size || 10
      });
      
    } catch (error) {
      // console.error('Error fetching inventory:', error);
      showError(
        'Failed to load inventory. Please try again.',
        'Load Error',
        { duration: 5000 }
      );
      if (!append) {
        setProducts([]);
        setFilteredProducts([]);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [showError]);

  const loadMoreProducts = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages && !isLoadingMore) {
      fetchProducts(pagination.currentPage + 1, true);
    }
  }, [pagination.currentPage, pagination.totalPages, isLoadingMore, fetchProducts]);

  const searchProducts = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchedProducts([]);
      return;
    }

    try {
      // Use the search endpoint with pagination
      const response = await ApiService.searchProducts(searchQuery, 1, 10);
      
      // Handle search response format (might be paginated too)
      const searchResults = response.data.results || response.data.products || response.data || [];
      setSearchedProducts(searchResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      // console.error('Error searching products:', error);
      // Fallback to client-side search if API fails
      const filtered = products.filter(product => 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchedProducts(filtered.slice(0, 10));
    }
  }, [products]);

  // Updated to use the inventory adjustment endpoint
  const adjustStock = useCallback(async (productId, adjustment) => {
    try {
      const response = await ApiService.adjustInventory(productId, adjustment);
      
      const updatedProduct = response.data;
      return updatedProduct.stock;
    } catch (error) {
      // console.error('Error adjusting stock:', error);
      throw error;
    }
  }, []);

  const addStock = useCallback(async (productId, quantityToAdd) => {
    return await adjustStock(productId, parseInt(quantityToAdd));
  }, [adjustStock]);

  // Initial load
  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Filter products when search/filters change
  useEffect(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(product =>
        product.category?.id?.toString() === categoryFilter ||
        product.category?.name?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Apply stock filter
    if (stockFilter) {
      switch (stockFilter) {
        case 'out-of-stock':
          filtered = filtered.filter(product => parseInt(product.stock) === 0);
          break;
        case 'low-stock':
          filtered = filtered.filter(product => parseInt(product.stock) > 0 && parseInt(product.stock) < 10);
          break;
        case 'in-stock':
          filtered = filtered.filter(product => parseInt(product.stock) >= 10);
          break;
        default:
          break;
      }
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const handleAddStockClick = () => {
    setAddStockModalOpen(true);
    setProductSearchTerm('');
    setSearchedProducts([]);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setProductSearchTerm(product.name);
    setSearchedProducts([]);
  };

  const handleAddStockSubmit = async () => {
    if (!selectedProduct || quantity < 1) {
      showError('Please select a product and enter a valid quantity', 'Invalid Input');
      return;
    }

    try {
      const loadingAlertId = showLoading('Adding stock...', 'Processing');
      const newStock = await addStock(selectedProduct.id, quantity);
      removeAlert(loadingAlertId);
      
      showSuccess(`Added ${quantity} units to ${selectedProduct.name}. New stock: ${newStock}`, 'Stock Updated');
      
      // Refresh products - reset to page 1
      await fetchProducts(1, false);
      setAddStockModalOpen(false);
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      showError('Failed to add stock. Please try again.', 'Update Failed');
    }
  };

  const handleQuickAdjust = async (productId, figure, stock) => {
    const adjustment = stock + figure;

    try {
      const loadingAlertId = showLoading('Updating stock...', 'Processing');
      const newStock = await adjustStock(productId, adjustment);
      removeAlert(loadingAlertId);
      
      showSuccess(`Stock updated to ${newStock}`, 'Stock Adjusted');
      
      // Update the product in the local state without refetching
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, stock: newStock }
            : product
        )
      );
    } catch (error) {
      showError('Failed to update stock. Please try again.', 'Update Failed');
    }
  };

  const getStockBadge = (stock) => {
    const stockValue = parseInt(stock);
    if (stockValue === 0) return 'out-of-stock';
    if (stockValue < 10) return 'low-stock';
    return 'in-stock';
  };

  const getStockText = (stock) => {
    const stockValue = parseInt(stock);
    if (stockValue === 0) return 'Out of stock';
    if (stockValue < 10) return `${stockValue} left`;
    return `${stockValue} in stock`;
  };

  const formatPrice = (price) => {
    if (!price) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStockFilter('');
  };

  const hasActiveFilters = searchTerm || categoryFilter || stockFilter;

  // Get unique categories for filter
  const categories = [...new Set(products
    .map(product => product.category?.name || product.category)
    .filter(Boolean)
  )];

  // Handle scroll for infinite loading
  const handleScroll = useCallback((e) => {
    const target = e.target;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    
    if (bottom && !hasActiveFilters && !loading && !isLoadingMore && 
        pagination.currentPage < pagination.totalPages) {
      loadMoreProducts();
    }
  }, [hasActiveFilters, loading, isLoadingMore, pagination.currentPage, pagination.totalPages, loadMoreProducts]);

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
              
              <div className="product-list-container" onScroll={handleScroll}>
                <div className="product-list-header">
                  <div className="header-content">
                    <h1>Inventory Management</h1>
                    <p>Manage your product stock levels and inventory</p>
                  </div>
                  <button 
                    className="add-product-btn"
                    onClick={handleAddStockClick}
                  >
                    <span>+ Add Stock</span>
                  </button>
                </div>

                <div className="product-list-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search products by name, SKU, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  
                  <div className="filter-controls">
                    <select 
                      className="filter-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    
                    <select 
                      className="filter-select"
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                    >
                      <option value="">All Stock Levels</option>
                      <option value="out-of-stock">Out of Stock</option>
                      <option value="low-stock">Low Stock (1-9)</option>
                      <option value="in-stock">In Stock (10+)</option>
                    </select>

                    {hasActiveFilters && (
                      <button 
                        className="clear-filters-btn"
                        onClick={clearFilters}
                        title="Clear all filters"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="active-filters">
                    <span className="filters-label">Active filters:</span>
                    {searchTerm && (
                      <span className="filter-tag">
                        Search: "{searchTerm}"
                        <button onClick={() => setSearchTerm('')}>×</button>
                      </span>
                    )}
                    {categoryFilter && (
                      <span className="filter-tag">
                        Category: {categoryFilter}
                        <button onClick={() => setCategoryFilter('')}>×</button>
                      </span>
                    )}
                    {stockFilter && (
                      <span className="filter-tag">
                        Stock: {stockFilter.replace('-', ' ')}
                        <button onClick={() => setStockFilter('')}>×</button>
                      </span>
                    )}
                  </div>
                )}

                <div className="product-list-content">
                  {loading && products.length === 0 ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading inventory...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <h3>No products found</h3>
                      <p>
                        {hasActiveFilters 
                          ? 'No products match your current filters. Try adjusting your search criteria.' 
                          : 'No products available in inventory.'
                        }
                      </p>
                      {hasActiveFilters && (
                        <button 
                          className="add-product-btn empty-state-btn"
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="products-table-container">
                      <table className="products-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Current Stock</th>
                            <th>Price</th>
                            <th>Stock Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map(product => (
                            <tr key={product.id}>
                              <td>
                                <div className="product-info">
                                  <img 
                                    src={product.main_image_url || product.main_image || product.image || 'https://via.placeholder.com/60x60'} 
                                    alt={product.name}
                                    className="product-image"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/60x60';
                                    }}
                                  />
                                  <div className="product-details">
                                    <div className="product-name">{product.name || 'Unnamed Product'}</div>
                                    {product.sku && (
                                      <div className="product-sku">SKU: {product.sku}</div>
                                    )}
                                  </div>
                                </div>
                               </td>
                              <td>
                                <span className="category-badge">
                                  {product.category?.name || product.category || 'Uncategorized'}
                                </span>
                               </td>
                              <td>
                                <span className={`stock-badge ${getStockBadge(product.stock)}`}>
                                  {getStockText(product.stock)}
                                </span>
                               </td>
                              <td>
                                <div className="price">{formatPrice(product.price)}</div>
                               </td>
                              <td>
                                <div className="stock-actions">
                                  <button 
                                    className="stock-btn minus-btn"
                                    onClick={() => handleQuickAdjust(product.id, -1, product.stock)}
                                    title="Reduce stock by 1"
                                    disabled={parseInt(product.stock) <= 0}
                                  >
                                    -
                                  </button>
                                  <span className="stock-quantity">
                                    {product.stock}
                                  </span>
                                  <button 
                                    className="stock-btn plus-btn"
                                    onClick={() => handleQuickAdjust(product.id, 1, product.stock)}
                                    title="Add stock by 1"
                                  >
                                    +
                                  </button>
                                  <button 
                                    className="stock-btn bulk-add-btn"
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setQuantity(1);
                                      setAddStockModalOpen(true);
                                    }}
                                    title="Add bulk stock"
                                  >
                                    Add More
                                  </button>
                                </div>
                               </td>
                             </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {/* Loading more indicator */}
                      {isLoadingMore && (
                        <div className="loading-more">
                          <div className="loading-spinner-small"></div>
                          <p>Loading more products...</p>
                        </div>
                      )}
                      
                      {/* Pagination info */}
                      {!hasActiveFilters && pagination.totalPages > 1 && (
                        <div className="pagination-info">
                          <span>
                            Showing {products.length} of {pagination.totalCount} products
                            {pagination.currentPage < pagination.totalPages && ' (scroll for more)'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!loading && filteredProducts.length > 0 && !hasActiveFilters && (
                  <div className="product-list-footer">
                    <div className="pagination-info">
                      Page {pagination.currentPage} of {pagination.totalPages}
                      {pagination.currentPage < pagination.totalPages && (
                        <button 
                          className="load-more-btn"
                          onClick={loadMoreProducts}
                          disabled={isLoadingMore}
                        >
                          {isLoadingMore ? 'Loading...' : 'Load More'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* Add Stock Modal */}
      {addStockModalOpen && (
        <div className="modal-overlay">
          <div className="add-stock-modal">
            <div className="modal-header">
              <h3>Add Stock to Inventory</h3>
              <button 
                className="close-btn"
                onClick={() => setAddStockModalOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              {/* Product Search */}
              <div className="form-group">
                <label>Search Product</label>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search by product name, SKU..."
                    value={productSearchTerm}
                    onChange={(e) => {
                      setProductSearchTerm(e.target.value);
                      searchProducts(e.target.value);
                    }}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
                
                {/* Search Results */}
                {searchedProducts.length > 0 && (
                  <div className="search-results">
                    {searchedProducts.map(product => (
                      <div 
                        key={product.id}
                        className={`search-result-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                        onClick={() => handleProductSelect(product)}
                      >
                        <img 
                          src={product.main_image_url || product.main_image || product.image || 'https://via.placeholder.com/40x40'} 
                          alt={product.name}
                          className="product-thumb"
                        />
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-details">
                            <span className="current-stock">Current: {product.stock || 0}</span>
                            {product.sku && <span className="product-sku">SKU: {product.sku}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Product Display */}
              {selectedProduct && (
                <div className="selected-product">
                  <div className="selected-product-header">
                    <h4>Selected Product</h4>
                  </div>
                  <div className="selected-product-info">
                    <img 
                      src={selectedProduct.main_image_url || selectedProduct.main_image || selectedProduct.image || 'https://via.placeholder.com/50x50'} 
                      alt={selectedProduct.name}
                      className="product-image"
                    />
                    <div className="product-details">
                      <div className="product-name">{selectedProduct.name}</div>
                      <div className="product-meta">
                        <span>Current Stock: {selectedProduct.stock || 0}</span>
                        {selectedProduct.sku && <span>SKU: {selectedProduct.sku}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Input */}
              <div className="form-group">
                <label>Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="quantity-input"
                  placeholder="Enter quantity"
                />
              </div>

              {/* Summary */}
              {selectedProduct && (
                <div className="stock-summary">
                  <div className="summary-item">
                    <span>Current Stock:</span>
                    <span>{selectedProduct.stock || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span>Adding:</span>
                    <span>+{quantity}</span>
                  </div>
                  <div className="summary-item total">
                    <span>New Total:</span>
                    <span>{(parseInt(selectedProduct.stock) || 0) + parseInt(quantity)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setAddStockModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleAddStockSubmit}
                disabled={!selectedProduct || quantity < 1}
              >
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;