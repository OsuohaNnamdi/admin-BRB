import React, { useState, useEffect, useCallback } from 'react';
import '../../../styles/CategoryList.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SettingsPanel from '../../../component/SettingsPanel';
import CategoryModal from '../../../component/CategoryModal';
import SubcategoryModal from '../../../component/SubcategoryModal';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';

const CategoryList = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteType, setDeleteType] = useState('category'); // 'category' or 'subcategory'
  const [expandedCategories, setExpandedCategories] = useState({});

  const { showSuccess, showError, showWarning, showLoading, removeAlert } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Fetch categories and subcategories
  const fetchData = useCallback(async () => {
    setLoading(true);
    let loadingAlertId = null;
    
    try {
      loadingAlertId = showLoading('Loading categories...', 'Fetching Data');
      
      // Fetch categories
      const categoriesResponse = await ApiService.getAdminCategories();
      const categoriesData = categoriesResponse.data.categories || categoriesResponse.data || [];
      setCategories(categoriesData);

      // Fetch subcategories
      const subcategoriesResponse = await ApiService.getAdminSubcategories();
      const subcategoriesData = subcategoriesResponse.data.subcategories || subcategoriesResponse.data || [];
      setSubcategories(subcategoriesData);

      // Initialize expanded state for categories with subcategories
      const expanded = {};
      subcategoriesData.forEach(sub => {
        if (sub.category?.id) {
          expanded[sub.category.id] = true;
        }
      });
      setExpandedCategories(expanded);
      
      if (loadingAlertId) removeAlert(loadingAlertId);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      if (error.response?.status === 401) {
        showError('Session expired. Please login again.', 'Authentication Required', { duration: 6000 });
      } else if (error.response?.status === 403) {
        showError('You do not have permission to view categories.', 'Access Denied', { duration: 6000 });
      } else {
        showError('Failed to load categories. Please try again.', 'Load Failed', { duration: 5000 });
      }
      
      setCategories([]);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  }, [showLoading, showError, removeAlert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryModalOpen(true);
  };

  const handleAddSubcategory = () => {
    setSelectedSubcategory(null);
    setSubcategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryModalOpen(true);
  };

  const handleEditSubcategory = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSubcategoryModalOpen(true);
  };

  const handleCategorySubmit = async (categoryData) => {
    try {
      if (selectedCategory) {
        await ApiService.updateCategory(selectedCategory.id, categoryData);
        showSuccess('Category updated successfully!', 'Success', { duration: 3000 });
      } else {
        await ApiService.createCategory(categoryData);
        showSuccess('Category created successfully!', 'Success', { duration: 3000 });
      }
      
      await fetchData();
      setCategoryModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      
      if (error.response?.status === 409) {
        showError('A category with this name or slug already exists.', 'Duplicate', { duration: 5000 });
      } else {
        showError('Failed to save category. Please try again.', 'Error', { duration: 5000 });
      }
    }
  };

  const handleSubcategorySubmit = async (subcategoryData) => {
    try {
      if (selectedSubcategory) {
        await ApiService.updateSubcategory(selectedSubcategory.id, subcategoryData);
        showSuccess('Subcategory updated successfully!', 'Success', { duration: 3000 });
      } else {
        await ApiService.createSubcategory(subcategoryData);
        showSuccess('Subcategory created successfully!', 'Success', { duration: 3000 });
      }
      
      await fetchData();
      setSubcategoryModalOpen(false);
      setSelectedSubcategory(null);
    } catch (error) {
      console.error('Error saving subcategory:', error);
      
      if (error.response?.status === 409) {
        showError('A subcategory with this name or slug already exists.', 'Duplicate', { duration: 5000 });
      } else {
        showError('Failed to save subcategory. Please try again.', 'Error', { duration: 5000 });
      }
    }
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setDeleteType('category');
    setDeleteModalOpen(true);
  };

  const handleDeleteSubcategory = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setDeleteType('subcategory');
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    let loadingAlertId = null;
    
    try {
      loadingAlertId = showLoading(
        deleteType === 'category' ? 'Deleting category...' : 'Deleting subcategory...',
        'Processing'
      );
      
      if (deleteType === 'category' && selectedCategory) {
        await ApiService.deleteCategory(selectedCategory.id);
        showSuccess('Category deleted successfully!', 'Success', { duration: 4000 });
      } else if (deleteType === 'subcategory' && selectedSubcategory) {
        await ApiService.deleteSubcategory(selectedSubcategory.id);
        showSuccess('Subcategory deleted successfully!', 'Success', { duration: 4000 });
      }
      
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      await fetchData();
      setDeleteModalOpen(false);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      
    } catch (error) {
      console.error('Error deleting:', error);
      
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      if (error.response?.status === 400) {
        showWarning(
          deleteType === 'category' 
            ? 'Cannot delete category with existing subcategories.'
            : 'Cannot delete subcategory with existing products.',
          'Cannot Delete',
          { duration: 7000 }
        );
      } else if (error.response?.status === 404) {
        showError(`${deleteType} not found.`, 'Not Found', { duration: 5000 });
      } else {
        showError(`Failed to delete ${deleteType}.`, 'Deletion Failed', { duration: 5000 });
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter(sub => sub.category?.id === categoryId);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="__variable_9eb1a5 body">
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
                    <h1>Categories & Subcategories</h1>
                    <p>Organize your products with categories and subcategories</p>
                  </div>
                  <div className="header-actions">
                    <button 
                      className="add-category-btn"
                      onClick={handleAddCategory}
                    >
                      <span>+ Add Category</span>
                    </button>
                    <button 
                      className="add-subcategory-btn"
                      onClick={handleAddSubcategory}
                    >
                      <span>+ Add Subcategory</span>
                    </button>
                  </div>
                </div>

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
                          ? 'No categories match your search.' 
                          : 'Get started by creating your first category.'
                        }
                      </p>
                      {!searchTerm && (
                        <div className="empty-state-actions">
                          <button 
                            className="add-category-btn"
                            onClick={handleAddCategory}
                          >
                            Add Category
                          </button>
                          <button 
                            className="add-subcategory-btn"
                            onClick={handleAddSubcategory}
                          >
                            Add Subcategory
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="categories-list">
                      {filteredCategories.map(category => {
                        const categorySubcategories = getSubcategoriesForCategory(category.id);
                        const isExpanded = expandedCategories[category.id];
                        
                        return (
                          <div key={category.id} className="category-item">
                            <div className="category-main">
                              <div className="category-info">
                                <button
                                  className={`expand-toggle ${categorySubcategories.length > 0 ? 'has-sub' : ''}`}
                                  onClick={() => toggleCategoryExpand(category.id)}
                                  disabled={categorySubcategories.length === 0}
                                >
                                  {categorySubcategories.length > 0 && (
                                    <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
                                  )}
                                </button>
                                <div className="category-details">
                                  <h3 className="category-name">{category.name}</h3>
                                  <code className="category-slug">/{category.slug}</code>
                                </div>
                              </div>
                              <div className="category-actions">
                                <button 
                                  className="action-btn edit-btn"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteCategory(category)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {isExpanded && categorySubcategories.length > 0 && (
                              <div className="subcategories-list">
                                {categorySubcategories.map(sub => (
                                  <div key={sub.id} className="subcategory-item">
                                    <div className="subcategory-info">
                                      <span className="subcategory-indent">└─</span>
                                      <div className="subcategory-details">
                                        <span className="subcategory-name">{sub.name}</span>
                                        <code className="subcategory-slug">/{sub.slug}</code>
                                      </div>
                                    </div>
                                    <div className="subcategory-actions">
                                      <button 
                                        className="action-btn edit-btn small"
                                        onClick={() => handleEditSubcategory(sub)}
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        className="action-btn delete-btn small"
                                        onClick={() => handleDeleteSubcategory(sub)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* Category Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleCategorySubmit}
        category={selectedCategory}
      />

      {/* Subcategory Modal */}
      <SubcategoryModal
        isOpen={subcategoryModalOpen}
        onClose={() => {
          setSubcategoryModalOpen(false);
          setSelectedSubcategory(null);
        }}
        onSubmit={handleSubcategorySubmit}
        subcategory={selectedSubcategory}
      />
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Delete {deleteType === 'category' ? 'Category' : 'Subcategory'}</h3>
            </div>
            <div className="delete-modal-content">
              <div className="warning-icon">⚠️</div>
              <p>
                Are you sure you want to delete{' '}
                <strong>
                  "{deleteType === 'category' 
                    ? selectedCategory?.name 
                    : selectedSubcategory?.name}"
                </strong>?
                {deleteType === 'category' && getSubcategoriesForCategory(selectedCategory?.id).length > 0 && (
                  <span className="warning-text">
                    {' '}This category has {getSubcategoriesForCategory(selectedCategory?.id).length} subcategories that will also be deleted.
                  </span>
                )}
              </p>
            </div>
            <div className="delete-modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
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
                  `Delete ${deleteType === 'category' ? 'Category' : 'Subcategory'}`
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