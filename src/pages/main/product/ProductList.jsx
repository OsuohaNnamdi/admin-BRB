import React, { useState, useEffect, useCallback } from 'react';
import '../../../styles/ProductList.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SettingsPanel from '../../../component/SettingsPanel';
import ProductModal from '../../../component/ProductModal';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';

const ProductList = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch a single page of products
  const fetchProductsPage = useCallback(async (page = 1, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await ApiService.getAdminProducts(page, 20); // 20 items per page
      const responseData = response.data;
      
      console.log(`Fetched page ${page}:`, responseData);
      
      // Handle paginated response
      if (responseData.results && Array.isArray(responseData.results)) {
        const newProducts = responseData.results;
        
        if (append) {
          setProducts(prevProducts => [...prevProducts, ...newProducts]);
        } else {
          setProducts(newProducts);
        }
        
        setTotalPages(responseData.total_pages || 1);
        setTotalProducts(responseData.count || 0);
        setCurrentPage(responseData.current_page || page);
        
        return newProducts;
      } else if (Array.isArray(responseData)) {
        if (append) {
          setProducts(prevProducts => [...prevProducts, ...responseData]);
        } else {
          setProducts(responseData);
        }
        return responseData;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      showError(
        'Failed to load products. Please try again.',
        'Load Error',
        { duration: 5000 }
      );
      if (!append) {
        setProducts([]);
      }
      return [];
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [showError]);

  // Load next page
  const loadMoreProducts = useCallback(async () => {
    if (currentPage < totalPages && !isLoadingMore && !loading) {
      await fetchProductsPage(currentPage + 1, true);
    }
  }, [currentPage, totalPages, isLoadingMore, loading, fetchProductsPage]);

  // Fetch all categories (they usually have fewer items)
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await ApiService.getAdminCategories(1, 100);
      const responseData = response.data;
      
      let categoriesData = [];
      if (responseData.results && Array.isArray(responseData.results)) {
        categoriesData = responseData.results;
      } else if (Array.isArray(responseData)) {
        categoriesData = responseData;
      }
      
      console.log('Categories fetched:', categoriesData.length);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showError(
        'Failed to load categories. Some features may not work properly.',
        'Categories Load Error',
        { duration: 4000 }
      );
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [showError]);

  // Fetch all subcategories
  const fetchSubcategories = useCallback(async () => {
    setSubcategoriesLoading(true);
    try {
      const response = await ApiService.getAdminSubcategories(1, 100);
      const responseData = response.data;
      
      let subcategoriesData = [];
      if (responseData.results && Array.isArray(responseData.results)) {
        subcategoriesData = responseData.results;
      } else if (Array.isArray(responseData)) {
        subcategoriesData = responseData;
      }
      
      console.log('Subcategories fetched:', subcategoriesData.length);
      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      showError(
        'Failed to load subcategories.',
        'Subcategories Load Error',
        { duration: 4000 }
      );
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  }, [showError]);

  const createProduct = async (productData) => {
    try {
      const response = await ApiService.createProduct(productData);
      console.log('Product created:', response.data);
      return response.data.product || response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  // Update product with PATCH method (partial updates only)
  const updateProduct = async (id, productData) => {
    try {
      const updateData = {};
      
      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.slug !== undefined) updateData.slug = productData.slug;
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.stock !== undefined) updateData.stock = productData.stock;
      if (productData.is_active !== undefined) updateData.is_active = productData.is_active;
      if (productData.ingredients !== undefined) updateData.ingredients = productData.ingredients;
      if (productData.how_to_use !== undefined) updateData.how_to_use = productData.how_to_use;
      
      if (productData.category_ids !== undefined) {
        updateData.category_ids = productData.category_ids;
      }
      
      if (productData.subcategory_ids !== undefined) {
        updateData.subcategory_ids = productData.subcategory_ids;
      }
      
      console.log('PATCH updating product with data:', updateData);
      
      const response = await ApiService.updateProduct(id, updateData);
      console.log('Product updated (PATCH):', response.data);
      return response.data.product || response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await ApiService.deleteProduct(id);
      console.log('Product deleted:', id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Initial load
  useEffect(() => {
    fetchProductsPage(1, false);
    fetchCategories();
    fetchSubcategories();
  }, []);

  const handleEdit = (product) => {
    const productForEdit = {
      id: product.id,
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      ingredients: product.ingredients || '',
      how_to_use: product.how_to_use || '',
      price: product.price || '',
      stock: product.stock || '',
      is_active: product.is_active === true,
      main_image: null,
      main_image_url: product.main_image_url || '',
      detail_images: [],
      detail_images_urls: product.detail_images_urls || [],
      category_ids: product.categories ? product.categories.map(cat => cat.id) : [],
      subcategory_ids: product.subcategories ? product.subcategories.map(sub => sub.id) : []
    };
    console.log('Product for edit:', productForEdit);
    setSelectedProduct(productForEdit);
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
      let loadingAlertId = showLoading('Saving product...', 'Processing');
      
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
        removeAlert(loadingAlertId);
        showSuccess('Product updated successfully!', 'Update Successful');
      } else {
        await createProduct(productData);
        removeAlert(loadingAlertId);
        showSuccess('Product created successfully!', 'Create Successful');
      }
      
      // Refresh products list - reset to page 1
      await fetchProductsPage(1, false);
      
      setModalOpen(false);
      setSelectedProduct(null);
      
    } catch (error) {
      console.error('Error saving product:', error);
          
      if (error.response?.data) {
        const backendErrors = error.response.data;
        let errorMessage = 'Failed to save product. ';
        
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            errorMessage += `${key}: ${backendErrors[key].join(', ')} `;
          } else {
            errorMessage += `${key}: ${backendErrors[key]} `;
          }
        });
        
        showError(errorMessage.trim(), 'Save Failed', { duration: 6000 });
      } else if (error.response?.status === 400) {
        showError('Invalid product data. Please check all fields.', 'Validation Error', { duration: 5000 });
      } else if (error.response?.status === 401) {
        showError('Authentication required. Please login again.', 'Session Expired', { duration: 5000 });
      } else if (error.response?.status === 403) {
        showError('You do not have permission to manage products.', 'Access Denied', { duration: 5000 });
      } else if (error.response?.status === 404 && selectedProduct) {
        showError('Product not found. It may have been deleted.', 'Not Found', { duration: 5000 });
      } else if (error.message === 'Network Error') {
        showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
      } else {
        showError('Failed to save product. Please try again.', 'Save Failed', { duration: 5000 });
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      try {
        const loadingAlertId = showLoading('Deleting product...', 'Processing');
        
        await deleteProduct(selectedProduct.id);
        removeAlert(loadingAlertId);
        showSuccess('Product deleted successfully!', 'Delete Successful');
        
        await fetchProductsPage(1, false);
        
        setDeleteModalOpen(false);
        setSelectedProduct(null);
        
      } catch (error) {
        console.error('Error deleting product:', error);
        
        if (error.response?.data?.error) {
          showError(error.response.data.error, 'Delete Failed', { duration: 5000 });
        } else if (error.response?.status === 400) {
          showError('Cannot delete product. It may have associated orders.', 'Delete Failed', { duration: 5000 });
        } else if (error.response?.status === 401) {
          showError('Authentication required. Please login again.', 'Session Expired', { duration: 5000 });
        } else if (error.response?.status === 403) {
          showError('You do not have permission to delete products.', 'Access Denied', { duration: 5000 });
        } else if (error.response?.status === 404) {
          showError('Product not found. It may have been deleted.', 'Not Found', { duration: 5000 });
        } else if (error.message === 'Network Error') {
          showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
        } else {
          showError('Failed to delete product. Please try again.', 'Delete Failed', { duration: 5000 });
        }
      }
    }
  };

  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter(sub => sub.category?.id === categoryId);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categories?.some(cat => cat.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      product.slug?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !categoryFilter || 
      product.categories?.some(cat => cat.id?.toString() === categoryFilter);

    const matchesSubcategory = !subcategoryFilter || 
      product.subcategories?.some(sub => sub.id?.toString() === subcategoryFilter);

    const matchesStatus = 
      !statusFilter || 
      (statusFilter === 'active' && (product.is_active === true)) ||
      (statusFilter === 'inactive' && (product.is_active === false));

    return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus;
  });

  const getStockBadge = (stock) => {
    if (stock === 0 || stock === '0') return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  };

  const formatPrice = (price) => {
    if (!price) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const getStockText = (stock) => {
    if (stock === 0 || stock === '0') return 'Out of stock';
    if (stock < 10) return `${stock} left`;
    return `${stock} in stock`;
  };

  const getCategoryNames = (product) => {
    if (product.categories && product.categories.length > 0) {
      return product.categories.map(cat => cat.name).join(', ');
    }
    return 'Uncategorized';
  };

  const getSubcategoryNames = (product) => {
    if (product.subcategories && product.subcategories.length > 0) {
      return product.subcategories.map(sub => sub.name).join(', ');
    }
    return '';
  };

  const handleCategoryFilterChange = (e) => {
    const value = e.target.value;
    setCategoryFilter(value);
    setSubcategoryFilter('');
  };

  const handleSubcategoryFilterChange = (e) => {
    setSubcategoryFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSubcategoryFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = searchTerm || categoryFilter || subcategoryFilter || statusFilter;

  const subcategoriesForFilter = categoryFilter 
    ? getSubcategoriesForCategory(parseInt(categoryFilter))
    : [];

  const goToPage = async (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      await fetchProductsPage(page, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
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
                      placeholder="Search products by name, category, or slug..."
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
                      onChange={handleCategoryFilterChange}
                      disabled={categoriesLoading}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                      {categories.length === 0 && !categoriesLoading && (
                        <option value="" disabled>No categories available</option>
                      )}
                      {categoriesLoading && (
                        <option value="" disabled>Loading categories...</option>
                      )}
                    </select>
                    
                    <select 
                      className="filter-select"
                      value={subcategoryFilter}
                      onChange={handleSubcategoryFilterChange}
                      disabled={!categoryFilter || subcategoriesLoading || subcategoriesForFilter.length === 0}
                    >
                      <option value="">All Subcategories</option>
                      {subcategoriesForFilter.map(subcategory => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                      {categoryFilter && subcategoriesForFilter.length === 0 && !subcategoriesLoading && (
                        <option value="" disabled>No subcategories available</option>
                      )}
                      {subcategoriesLoading && (
                        <option value="" disabled>Loading subcategories...</option>
                      )}
                    </select>
                    
                    <select 
                      className="filter-select"
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
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
                        Category: {categories.find(cat => cat.id.toString() === categoryFilter)?.name || categoryFilter}
                        <button onClick={() => setCategoryFilter('')}>×</button>
                      </span>
                    )}
                    {subcategoryFilter && (
                      <span className="filter-tag">
                        Subcategory: {subcategories.find(sub => sub.id.toString() === subcategoryFilter)?.name || subcategoryFilter}
                        <button onClick={() => setSubcategoryFilter('')}>×</button>
                      </span>
                    )}
                    {statusFilter && (
                      <span className="filter-tag">
                        Status: {statusFilter === 'active' ? 'Active' : 'Inactive'}
                        <button onClick={() => setStatusFilter('')}>×</button>
                      </span>
                    )}
                  </div>
                )}

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
                      <p>
                        {hasActiveFilters 
                          ? 'No products match your current filters. Try adjusting your search criteria.' 
                          : 'Get started by creating your first product.'
                        }
                      </p>
                      {hasActiveFilters ? (
                        <button 
                          className="add-product-btn empty-state-btn"
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button 
                          className="add-product-btn empty-state-btn"
                          onClick={handleAdd}
                        >
                          + Add Your First Product
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="products-table-container">
                        <table className="products-table">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Categories</th>
                              <th>Subcategories</th>
                              <th>Price</th>
                              <th>Stock</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map(product => {
                              const categoryNames = getCategoryNames(product);
                              const subcategoryNames = getSubcategoryNames(product);
                              
                              return (
                                <tr key={product.id}>
                                  <td>
                                    <div className="product-info">
                                      <img 
                                        src={product.main_image_url || 'https://via.placeholder.com/60x60'} 
                                        alt={product.name}
                                        className="product-image"
                                        onError={(e) => {
                                          e.target.src = 'https://via.placeholder.com/60x60';
                                        }}
                                      />
                                      <div className="product-details">
                                        <div className="product-name">{product.name || 'Unnamed Product'}</div>
                                        <div className="product-slug">/{product.slug || 'no-slug'}</div>
                                      </div>
                                    </div>
                                   </td>
                                  <td>
                                    <span className="category-badge">
                                      {categoryNames}
                                    </span>
                                   </td>
                                  <td>
                                    {subcategoryNames ? (
                                      <span className="subcategory-badge">
                                        {subcategoryNames}
                                      </span>
                                    ) : (
                                      <span className="no-subcategory">—</span>
                                    )}
                                   </td>
                                  <td>
                                    <div className="price">{formatPrice(product.price)}</div>
                                   </td>
                                  <td>
                                    <span className={`stock-badge ${getStockBadge(product.stock)}`}>
                                      {getStockText(product.stock)}
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
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Load More Button (Alternative to pagination) */}
                      {currentPage < totalPages && !hasActiveFilters && (
                        <div className="load-more-container" style={{ textAlign: 'center', padding: '20px' }}>
                          <button 
                            className="load-more-btn"
                            onClick={loadMoreProducts}
                            disabled={isLoadingMore}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                              opacity: isLoadingMore ? 0.6 : 1
                            }}
                          >
                            {isLoadingMore ? 'Loading...' : `Load More Products (${products.length} / ${totalProducts})`}
                          </button>
                        </div>
                      )}
                      
                      {/* Loading more indicator */}
                      {isLoadingMore && (
                        <div className="loading-more-indicator" style={{ textAlign: 'center', padding: '20px' }}>
                          <div className="loading-spinner-small"></div>
                          <p>Loading more products...</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {!loading && filteredProducts.length > 0 && !hasActiveFilters && totalPages > 1 && (
                  <div className="product-list-footer">
                    <div className="pagination-info">
                      <span>
                        Page {currentPage} of {totalPages} | Showing {products.length} of {totalProducts} products
                      </span>
                    </div>
                    <div className="pagination-controls">
                      <button 
                        className="pagination-btn"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1 || isLoadingMore}
                      >
                        Previous
                      </button>
                      
                      {getPageNumbers().map(pageNum => (
                        <button 
                          key={pageNum}
                          className={`pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
                          onClick={() => goToPage(pageNum)}
                          disabled={isLoadingMore}
                        >
                          {pageNum}
                        </button>
                      ))}
                      
                      <button 
                        className="pagination-btn"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoadingMore}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleModalSubmit}
        product={selectedProduct}
        categories={categories}
        subcategories={subcategories}
      />
      
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
                {selectedProduct?.stock > 0 && (
                  <span className="warning-text">
                    {' '}This product currently has {selectedProduct.stock} units in stock.
                  </span>
                )}
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