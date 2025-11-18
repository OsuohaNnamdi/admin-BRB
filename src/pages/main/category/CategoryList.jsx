// pages/main/CategoryList.js
import React, { useState, useEffect } from 'react';
import '../../../styles/CategoryList.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SettingsPanel from '../../../component/SettingsPanel';
import CategoryModal from '../../../component/CategoryModal';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';

const CategoryList = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Use the alert context instead of local state
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    showLoading,
    removeAlert 
  } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // API functions
  const fetchCategories = async () => {
    setLoading(true);
    let loadingAlertId = null;
    
    try {
      // Show loading alert
      loadingAlertId = showLoading('Loading categories...', 'Fetching Data');
      
      const response = await ApiService.getAdminCategories();
      console.log('Categories fetched:', response.data);
      
      // Transform API response to match component structure
      const categoriesData = response.data.categories || response.data || [];
      setCategories(categoriesData);
      
      // Remove loading alert on success
      if (loadingAlertId) removeAlert(loadingAlertId);
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // Remove loading alert on error
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      // Show appropriate error alert
      if (error.response?.status === 401) {
        showError(
          'Your session has expired. Please login again to view categories.',
          'Authentication Required',
          { duration: 6000 }
        );
      } else if (error.response?.status === 403) {
        showError(
          'You do not have permission to view categories.',
          'Access Denied',
          { duration: 6000 }
        );
      } else if (error.message === 'Network Error') {
        showError(
          'Unable to connect to the server. Please check your internet connection.',
          'Connection Error',
          { duration: 6000 }
        );
      } else if (error.response?.status >= 500) {
        showError(
          'Our servers are currently experiencing issues. Please try again later.',
          'Server Error',
          { duration: 6000 }
        );
      } else {
        showError(
          'Failed to load categories. Please try refreshing the page.',
          'Load Failed',
          { duration: 5000 }
        );
      }
      
      // Set empty array as fallback
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const response = await ApiService.createCategory(categoryData);
      console.log('Category created:', response.data);
      return response.data.category || response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const response = await ApiService.updateCategory(id, categoryData);
      console.log('Category updated:', response.data);
      return response.data.category || response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await ApiService.deleteCategory(id);
      console.log('Category deleted:', id);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleModalSubmit = async (categoryData) => {
    let loadingAlertId = null;
    
    try {
      // Show loading alert
      loadingAlertId = showLoading(
        selectedCategory ? 'Updating category...' : 'Creating new category...', 
        'Processing'
      );
      
      if (selectedCategory) {
        // Update existing category
        await updateCategory(selectedCategory.id, categoryData);
        
        // Remove loading and show success
        if (loadingAlertId) removeAlert(loadingAlertId);
        showSuccess('Category updated successfully!', 'Update Successful', { duration: 4000 });
      } else {
        // Create new category
        await createCategory(categoryData);
        
        // Remove loading and show success
        if (loadingAlertId) removeAlert(loadingAlertId);
        showSuccess('Category created successfully!', 'Creation Successful', { duration: 4000 });
      }
      
      // Refresh categories list
      await fetchCategories();
      
      setModalOpen(false);
      setSelectedCategory(null);
      
    } catch (error) {
      console.error('Error saving category:', error);
      
      // Remove loading alert on error
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      // Handle different error scenarios with appropriate alert types
      if (error.response?.data?.error) {
        showError(
          error.response.data.error, 
          selectedCategory ? 'Update Failed' : 'Creation Failed',
          { duration: 6000 }
        );
      } else if (error.response?.status === 400) {
        showError(
          'Invalid category data. Please check your inputs and try again.',
          'Validation Error',
          { duration: 5000 }
        );
      } else if (error.response?.status === 401) {
        showError(
          'Your session has expired. Please login again to continue.',
          'Authentication Required',
          { duration: 6000 }
        );
      } else if (error.response?.status === 403) {
        showError(
          'You do not have permission to manage categories.',
          'Access Denied',
          { duration: 6000 }
        );
      } else if (error.response?.status === 404 && selectedCategory) {
        showError(
          'Category not found. It may have been deleted by another user.',
          'Category Not Found',
          { duration: 5000 }
        );
      } else if (error.response?.status === 409) {
        showWarning(
          'A category with this name or slug already exists. Please use a different name.',
          'Duplicate Category',
          { duration: 6000 }
        );
      } else if (error.message === 'Network Error') {
        showError(
          'Unable to connect to the server. Please check your internet connection.',
          'Connection Error',
          { duration: 6000 }
        );
      } else if (error.response?.status >= 500) {
        showError(
          'Our servers are currently experiencing issues. Please try again later.',
          'Server Error',
          { duration: 6000 }
        );
      } else {
        showError(
          `Failed to ${selectedCategory ? 'update' : 'create'} category. Please try again.`,
          'Operation Failed',
          { duration: 5000 }
        );
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      setDeleteLoading(true);
      let loadingAlertId = null;
      
      try {
        // Show loading alert for deletion
        loadingAlertId = showLoading('Deleting category...', 'Processing');
        
        await deleteCategory(selectedCategory.id);
        
        // Remove loading and show success
        if (loadingAlertId) removeAlert(loadingAlertId);
        showSuccess('Category deleted successfully!', 'Deletion Successful', { duration: 4000 });
        
        // Refresh categories list
        await fetchCategories();
        
        setDeleteModalOpen(false);
        setSelectedCategory(null);
        
      } catch (error) {
        console.error('Error deleting category:', error);
        
        // Remove loading alert on error
        if (loadingAlertId) removeAlert(loadingAlertId);
        
        // Handle different error scenarios with appropriate alert types
        if (error.response?.data?.error) {
          showError(
            error.response.data.error, 
            'Deletion Failed',
            { duration: 6000 }
          );
        } else if (error.response?.status === 400) {
          showWarning(
            'Cannot delete this category. It may contain products or be referenced elsewhere in the system.',
            'Cannot Delete',
            { duration: 7000 }
          );
        } else if (error.response?.status === 401) {
          showError(
            'Your session has expired. Please login again to continue.',
            'Authentication Required',
            { duration: 6000 }
          );
        } else if (error.response?.status === 403) {
          showError(
            'You do not have permission to delete categories.',
            'Access Denied',
            { duration: 6000 }
          );
        } else if (error.response?.status === 404) {
          showError(
            'Category not found. It may have been already deleted.',
            'Category Not Found',
            { duration: 5000 }
          );
        } else if (error.message === 'Network Error') {
          showError(
            'Unable to connect to the server. Please check your internet connection.',
            'Connection Error',
            { duration: 6000 }
          );
        } else if (error.response?.status >= 500) {
          showError(
            'Our servers are currently experiencing issues. Please try again later.',
            'Server Error',
            { duration: 6000 }
          );
        } else {
          showError(
            'Failed to delete category. Please try again.',
            'Deletion Failed',
            { duration: 5000 }
          );
        }
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    return status === 'active' ? 'active' : 'inactive';
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
              
              <div className="category-list-container">
                <div className="category-list-header">
                  <div className="header-content">
                    <h1>Categories</h1>
                    <p>Organize your products with categories</p>
                  </div>
                  <button 
                    className="add-category-btn"
                    onClick={handleAdd}
                  >
                    <span>+ Add Category</span>
                  </button>
                </div>

                {/* Removed local success/error messages since we're using alerts */}

                <div className="category-list-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  
                  <div className="filter-controls">
                    <select className="filter-select">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="category-list-content">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading categories...</p>
                    </div>
                  ) : filteredCategories.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📂</div>
                      <h3>No categories found</h3>
                      <p>
                        {searchTerm 
                          ? 'No categories match your search. Try different keywords.' 
                          : 'Get started by creating your first category.'
                        }
                      </p>
                      {!searchTerm && (
                        <button 
                          className="add-category-btn empty-state-btn"
                          onClick={handleAdd}
                        >
                          + Add Your First Category
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="categories-grid">
                      {filteredCategories.map(category => (
                        <div key={category.id} className="category-card">
                          <div className="category-card-header">
                            <h3 className="category-name">{category.name}</h3>
                            <span className={`status-badge ${getStatusBadge(category.status || 'active')}`}>
                              {category.status || 'active'}
                            </span>
                          </div>
                          
                          <div className="category-card-body">
                            <div className="category-slug">
                              <span className="slug-label">Slug:</span>
                              <code className="slug-value">/{category.slug}</code>
                            </div>
                          </div>
                          
                          <div className="category-card-actions">
                            <button 
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(category)}
                            >
                              <span>Edit</span>
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(category)}
                            >
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!loading && filteredCategories.length > 0 && (
                  <div className="category-list-footer">
                    <div className="pagination-info">
                      Showing {filteredCategories.length} of {categories.length} categories
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
      
      {/* Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleModalSubmit}
        category={selectedCategory}
      />
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Delete Category</h3>
            </div>
            <div className="delete-modal-content">
              <div className="warning-icon">⚠️</div>
              <p>
                Are you sure you want to delete <strong>"{selectedCategory?.name}"</strong>? 
                {selectedCategory?.productCount > 0 && (
                  <span className="warning-text">
                    {' '}This category contains {selectedCategory.productCount} products that will need to be reassigned.
                  </span>
                )}
              </p>
              {/* Removed local error message since we're using alerts */}
            </div>
            <div className="delete-modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setDeleteModalOpen(false);
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <span className="delete-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete Category'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;