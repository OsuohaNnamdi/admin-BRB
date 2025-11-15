// pages/main/CategoryList.js
import React, { useState, useEffect } from 'react';
import '../../styles/CategoryList.css';
import Header from './Header';
import Sidebar from './Sidebar';
import SettingsPanel from '../../component/SettingsPanel';
import CategoryModal from '../../component/CategoryModal';

const CategoryList = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Mock API functions
  const fetchCategories = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCategories = [
        {
          id: 1,
          name: 'Electronics',
          slug: 'electronics',
          description: 'Devices and gadgets',
          productCount: 45,
          status: 'active'
        },
        {
          id: 2,
          name: 'Clothing & Fashion',
          slug: 'clothing-fashion',
          description: 'Apparel and accessories',
          productCount: 128,
          status: 'active'
        },
        {
          id: 3,
          name: 'Home & Garden',
          slug: 'home-garden',
          description: 'Home improvement and decor',
          productCount: 67,
          status: 'active'
        },
        {
          id: 4,
          name: 'Sports & Outdoors',
          slug: 'sports-outdoors',
          description: 'Sports equipment and outdoor gear',
          productCount: 89,
          status: 'active'
        },
        {
          id: 5,
          name: 'Books & Media',
          slug: 'books-media',
          description: 'Books, movies, and music',
          productCount: 234,
          status: 'inactive'
        }
      ];
      
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newCategory = {
        id: Math.max(...categories.map(c => c.id)) + 1,
        ...categoryData,
        productCount: 0
      };
      setCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (error) {
      throw error;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCategories(prev => prev.map(category => 
        category.id === id ? { ...category, ...categoryData } : category
      ));
    } catch (error) {
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (error) {
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
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, categoryData);
      } else {
        await createCategory(categoryData);
      }
      setModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      await deleteCategory(selectedCategory.id);
      setDeleteModalOpen(false);
      setSelectedCategory(null);
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
                      <p>Try adjusting your search or add a new category</p>
                    </div>
                  ) : (
                    <div className="categories-grid">
                      {filteredCategories.map(category => (
                        <div key={category.id} className="category-card">
                          <div className="category-card-header">
                            <h3 className="category-name">{category.name}</h3>
                            <span className={`status-badge ${getStatusBadge(category.status)}`}>
                              {category.status}
                            </span>
                          </div>
                          
                          <div className="category-card-body">
                            <div className="category-slug">
                              <span className="slug-label">Slug:</span>
                              <code className="slug-value">/{category.slug}</code>
                            </div>
                            
                            <p className="category-description">
                              {category.description}
                            </p>
                            
                            <div className="category-stats">
                              <div className="stat-item">
                                <span className="stat-number">{category.productCount}</span>
                                <span className="stat-label">Products</span>
                              </div>
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
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;