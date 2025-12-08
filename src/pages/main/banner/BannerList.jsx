// admin/components/BannerList.js
import React, { useState, useEffect } from 'react';
import '../../../styles/BannerList.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SettingsPanel from '../../../component/SettingsPanel';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';
import { useNavigate } from 'react-router-dom';
import BannerModal from '../../../component/banner/BannerModal';

const BannerList = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { showSuccess, showError, showWarning, showInfo, showLoading, removeAlert } = useAlert();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // API functions
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getAdminBanners();
      console.log('Banners fetched:', response.data);
      
      // Transform API response to match component structure
      const bannersData = response.data || [];
      setBanners(bannersData);
      
    } catch (error) {
      console.error('Error fetching banners:', error);
      showError(
        'Failed to load banners. Please try again.',
        'Load Error',
        { duration: 5000 }
      );
      
      // Set empty array as fallback
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async (bannerData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', bannerData.title);
      formData.append('text', bannerData.text || '');
      
      // Append image file if exists
      if (bannerData.image && bannerData.image instanceof File) {
        formData.append('image', bannerData.image);
      }
      
      const response = await ApiService.createBanner(formData);
      console.log('Banner created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  };

  const updateBanner = async (id, bannerData) => {
    try {
      // For PATCH, we need to send FormData if there's an image
      if (bannerData.image && bannerData.image instanceof File) {
        const formData = new FormData();
        formData.append('title', bannerData.title);
        formData.append('text', bannerData.text || '');
        formData.append('image', bannerData.image);
        
        const response = await ApiService.updateBanner(id, formData, true); // true for FormData
        console.log('Banner updated with image:', response.data);
        return response.data;
      } else {
        // If no image, send JSON data
        const updateData = {};
        if (bannerData.title !== undefined) updateData.title = bannerData.title;
        if (bannerData.text !== undefined) updateData.text = bannerData.text;
        
        console.log('PATCH updating banner with data:', updateData);
        
        const response = await ApiService.updateBanner(id, updateData);
        console.log('Banner updated:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  };

  const deleteBanner = async (id) => {
    try {
      await ApiService.deleteBanner(id);
      console.log('Banner deleted:', id);
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setModalOpen(true);
  };

  const handleDelete = (banner) => {
    setSelectedBanner(banner);
    setDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedBanner(null);
    setModalOpen(true);
  };

  const handleModalSubmit = async (bannerData) => {
    try {
      let loadingAlertId = showLoading(
        selectedBanner ? 'Updating banner...' : 'Creating banner...',
        'Processing'
      );
      
      let result;
      if (selectedBanner) {
        // Update existing banner
        result = await updateBanner(selectedBanner.id, bannerData);
        removeAlert(loadingAlertId);
        showSuccess('Banner updated successfully!', 'Update Successful');
      } else {
        // Create new banner
        result = await createBanner(bannerData);
        removeAlert(loadingAlertId);
        showSuccess('Banner created successfully!', 'Create Successful');
      }
      
      // Refresh banners list
      await fetchBanners();
      
      setModalOpen(false);
      setSelectedBanner(null);
      
    } catch (error) {
      console.error('Error saving banner:', error);
      
      // Handle different error scenarios
      if (error.response?.data) {
        const backendErrors = error.response.data;
        let errorMessage = 'Failed to save banner. ';
        
        // Format backend errors
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            errorMessage += `${key}: ${backendErrors[key].join(', ')} `;
          } else {
            errorMessage += `${key}: ${backendErrors[key]} `;
          }
        });
        
        showError(errorMessage.trim(), 'Save Failed', { duration: 6000 });
      } else if (error.response?.status === 400) {
        showError('Invalid banner data. Please check all fields.', 'Validation Error', { duration: 5000 });
      } else if (error.response?.status === 401) {
        showError('Authentication required. Please login again.', 'Session Expired', { duration: 5000 });
      } else if (error.response?.status === 403) {
        showError('You do not have permission to manage banners.', 'Access Denied', { duration: 5000 });
      } else if (error.response?.status === 404 && selectedBanner) {
        showError('Banner not found. It may have been deleted.', 'Not Found', { duration: 5000 });
      } else if (error.message === 'Network Error') {
        showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
      } else {
        showError('Failed to save banner. Please try again.', 'Save Failed', { duration: 5000 });
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedBanner) {
      try {
        const loadingAlertId = showLoading('Deleting banner...', 'Processing');
        
        await deleteBanner(selectedBanner.id);
        removeAlert(loadingAlertId);
        showSuccess('Banner deleted successfully!', 'Delete Successful');
        
        // Refresh banners list
        await fetchBanners();
        
        setDeleteModalOpen(false);
        setSelectedBanner(null);
        
      } catch (error) {
        console.error('Error deleting banner:', error);
        
        // Handle different error scenarios
        if (error.response?.data?.error) {
          showError(error.response.data.error, 'Delete Failed', { duration: 5000 });
        } else if (error.response?.status === 401) {
          showError('Authentication required. Please login again.', 'Session Expired', { duration: 5000 });
        } else if (error.response?.status === 403) {
          showError('You do not have permission to delete banners.', 'Access Denied', { duration: 5000 });
        } else if (error.response?.status === 404) {
          showError('Banner not found. It may have been deleted.', 'Not Found', { duration: 5000 });
        } else if (error.message === 'Network Error') {
          showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
        } else {
          showError('Failed to delete banner. Please try again.', 'Delete Failed', { duration: 5000 });
        }
      }
    }
  };

  // Filter banners based on search term
  const filteredBanners = banners.filter(banner => {
    const matchesSearch = 
      banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.text?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (banner) => {
    if (banner.image_url) return banner.image_url;
    if (banner.image) {
      // Check if it's a full URL or relative path
      if (banner.image.startsWith('http')) {
        return banner.image;
      }
      // Assuming your backend serves media files from /media/
      return `${window.location.origin}${banner.image}`;
    }
    return 'https://via.placeholder.com/300x150?text=No+Image';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const hasActiveFilters = searchTerm;

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
              
              <div className="banner-list-container">
                <div className="banner-list-header">
                  <div className="header-content">
                    <h1>Banner Management</h1>
                    <p>Manage promotional banners for your store</p>
                  </div>
                  <button 
                    className="add-banner-btn"
                    onClick={handleAdd}
                  >
                    <span>+ Add Banner</span>
                  </button>
                </div>

                <div className="banner-list-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search banners by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  
                  {hasActiveFilters && (
                    <div className="filter-controls">
                      <button 
                        className="clear-filters-btn"
                        onClick={clearFilters}
                        title="Clear all filters"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
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
                  </div>
                )}

                <div className="banner-list-content">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading banners...</p>
                    </div>
                  ) : filteredBanners.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🖼️</div>
                      <h3>No banners found</h3>
                      <p>
                        {hasActiveFilters 
                          ? 'No banners match your search criteria. Try adjusting your search.' 
                          : 'Get started by creating your first promotional banner.'
                        }
                      </p>
                      {hasActiveFilters ? (
                        <button 
                          className="add-banner-btn empty-state-btn"
                          onClick={clearFilters}
                        >
                          Clear Search
                        </button>
                      ) : (
                        <button 
                          className="add-banner-btn empty-state-btn"
                          onClick={handleAdd}
                        >
                          + Create Your First Banner
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="banners-grid">
                      {filteredBanners.map(banner => (
                        <div key={banner.id} className="banner-card">
                          <div className="banner-image-container">
                            <img 
                              src={getImageUrl(banner)} 
                              alt={banner.title}
                              className="banner-image"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error';
                              }}
                            />
                            <div className="banner-overlay">
                              <div className="banner-actions">
                                <button 
                                  className="action-btn edit-btn"
                                  onClick={() => handleEdit(banner)}
                                  title="Edit banner"
                                >
                                  ✏️ Edit
                                </button>
                                <button 
                                  className="action-btn delete-btn"
                                  onClick={() => handleDelete(banner)}
                                  title="Delete banner"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="banner-content">
                            <div className="banner-header">
                              <h3 className="banner-title">{banner.title || 'Untitled Banner'}</h3>
                              <div className="banner-id">ID: {banner.id}</div>
                            </div>
                            
                            {banner.text && (
                              <p className="banner-description">
                                {banner.text.length > 100 
                                  ? `${banner.text.substring(0, 100)}...` 
                                  : banner.text
                                }
                              </p>
                            )}
                            
                            <div className="banner-meta">
                              <div className="meta-item">
                                <span className="meta-label">Image:</span>
                                <span className="meta-value">
                                  {banner.image?.split('/').pop() || 'No file'}
                                </span>
                              </div>
                              <div className="meta-item">
                                <span className="meta-label">Created:</span>
                                <span className="meta-value">
                                  {formatDate(banner.created_at)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="banner-url">
                              <strong>URL:</strong>
                              <code className="url-code" title={getImageUrl(banner)}>
                                {getImageUrl(banner).length > 40 
                                  ? `${getImageUrl(banner).substring(0, 40)}...` 
                                  : getImageUrl(banner)
                                }
                              </code>
                              <button 
                                className="copy-btn"
                                onClick={() => {
                                  navigator.clipboard.writeText(getImageUrl(banner));
                                  showSuccess('URL copied to clipboard!', 'Copied');
                                }}
                                title="Copy image URL"
                              >
                                📋
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!loading && filteredBanners.length > 0 && (
                  <div className="banner-list-footer">
                    <div className="pagination-info">
                      Showing {filteredBanners.length} of {banners.length} banners
                      {hasActiveFilters && ' (filtered)'}
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
      
      {/* Banner Modal */}
      <BannerModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBanner(null);
        }}
        onSubmit={handleModalSubmit}
        banner={selectedBanner}
      />
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Delete Banner</h3>
            </div>
            <div className="delete-modal-content">
              <div className="warning-icon">⚠️</div>
              <p>
                Are you sure you want to delete <strong>"{selectedBanner?.title}"</strong>? 
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
                Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerList;