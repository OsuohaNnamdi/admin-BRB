import React, { useState, useEffect } from 'react';
import '../../styles/ReviewList.css';
import Header from './Header';
import Sidebar from './Sidebar';
import SettingsPanel from '../../component/SettingsPanel';
import ApiService from '../../config/ApiService';
import { useAlert } from '../../context/alert/AlertContext';

const ReviewList = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const { showSuccess, showError, showWarning, showLoading, removeAlert } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // API functions
  const fetchReviews = async (page = 1, filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await ApiService.getAdminReviews(params);
      console.log('Reviews fetched:', response.data);
      
      const reviewsData = response.data.results || [];
      setReviews(reviewsData);
      setTotalCount(response.data.count || 0);
      setTotalPages(response.data.total_pages || 1);
      setCurrentPage(response.data.current_page || page);
      
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showError(
        'Failed to load reviews. Please try again.',
        'Load Error',
        { duration: 5000 }
      );
      
      // Set empty array as fallback
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    try {
      await ApiService.deleteReview(id);
      console.log('Review deleted:', id);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = (review) => {
    setSelectedReview(review);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedReview) {
      try {
        const loadingAlertId = showLoading('Deleting review...', 'Processing');
        
        await deleteReview(selectedReview.id);
        removeAlert(loadingAlertId);
        showSuccess('Review deleted successfully!', 'Delete Successful');
        
        // Refresh reviews list
        await fetchReviews(currentPage, getFilters());
        
        setDeleteModalOpen(false);
        setSelectedReview(null);
        
      } catch (error) {
        console.error('Error deleting review:', error);
        
        // Handle different error scenarios
        if (error.response?.data?.error) {
          showError(error.response.data.error, 'Delete Failed', { duration: 5000 });
        } else if (error.response?.status === 400) {
          showError('Cannot delete review.', 'Delete Failed', { duration: 5000 });
        } else if (error.response?.status === 401) {
          showError('Authentication required. Please login again.', 'Session Expired', { duration: 5000 });
        } else if (error.response?.status === 403) {
          showError('You do not have permission to delete reviews.', 'Access Denied', { duration: 5000 });
        } else if (error.response?.status === 404) {
          showError('Review not found. It may have been deleted.', 'Not Found', { duration: 5000 });
        } else if (error.message === 'Network Error') {
          showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
        } else {
          showError('Failed to delete review. Please try again.', 'Delete Failed', { duration: 5000 });
        }
      }
    }
  };

  // Filter functions
  const getFilters = () => {
    const filters = {};
    
    if (searchTerm) {
      filters.search = searchTerm;
    }
    
    if (ratingFilter) {
      filters.rating = ratingFilter;
    }
    
    if (dateFilter) {
      filters.date = dateFilter;
    }
    
    return filters;
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchReviews(1, getFilters());
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRatingFilter('');
    setDateFilter('');
    setCurrentPage(1);
    fetchReviews(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    fetchReviews(page, getFilters());
  };

  const handleRatingFilterChange = (e) => {
    setRatingFilter(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  // Format helpers
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
    return formatDate(dateString);
  };

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`star ${index < rating ? 'filled' : 'empty'}`}
          >
            ★
          </span>
        ))}
        <span className="rating-text">{rating}.0</span>
      </div>
    );
  };

  const getRatingBadge = (rating) => {
    const ratingClass = rating >= 4 ? 'high' : rating >= 3 ? 'medium' : 'low';
    return (
      <span className={`rating-badge rating-${ratingClass}`}>
        {renderStars(rating)}
      </span>
    );
  };

  const hasActiveFilters = searchTerm || ratingFilter || dateFilter;

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    if (start > 1) {
      items.push(1);
      if (start > 2) items.push('ellipsis-start');
    }
    
    for (let i = start; i <= end; i++) {
      items.push(i);
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) items.push('ellipsis-end');
      items.push(totalPages);
    }
    
    return items;
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
              
              <div className="review-list-container">
                <div className="review-list-header">
                  <div className="header-content">
                    <h1>Customer Reviews</h1>
                    <p>Manage and monitor customer feedback and ratings</p>
                  </div>
                  <div className="header-stats">
                    <div className="stat-card">
                      <span className="stat-value">{totalCount}</span>
                      <span className="stat-label">Total Reviews</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">
                        {reviews.length > 0 
                          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                          : '0.0'
                        }
                      </span>
                      <span className="stat-label">Avg Rating</span>
                    </div>
                  </div>
                </div>

                <div className="review-list-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search reviews by product name, user email, or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                    <button 
                      className="search-btn"
                      onClick={handleSearch}
                    >
                      Search
                    </button>
                  </div>
                  
                  <div className="filter-controls">
                    <select 
                      className="filter-select"
                      value={ratingFilter}
                      onChange={handleRatingFilterChange}
                    >
                      <option value="">All Ratings</option>
                      <option value="5">★★★★★ (5 stars)</option>
                      <option value="4">★★★★☆ (4 stars)</option>
                      <option value="3">★★★☆☆ (3 stars)</option>
                      <option value="2">★★☆☆☆ (2 stars)</option>
                      <option value="1">★☆☆☆☆ (1 star)</option>
                    </select>
                    
                    <select 
                      className="filter-select"
                      value={dateFilter}
                      onChange={handleDateFilterChange}
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>

                    {hasActiveFilters && (
                      <button 
                        className="clear-filters-btn"
                        onClick={handleClearFilters}
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
                    {ratingFilter && (
                      <span className="filter-tag">
                        Rating: {ratingFilter} stars
                        <button onClick={() => setRatingFilter('')}>×</button>
                      </span>
                    )}
                    {dateFilter && (
                      <span className="filter-tag">
                        Date: {dateFilter}
                        <button onClick={() => setDateFilter('')}>×</button>
                      </span>
                    )}
                  </div>
                )}

                <div className="review-list-content">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📝</div>
                      <h3>No reviews found</h3>
                      <p>
                        {hasActiveFilters 
                          ? 'No reviews match your current filters. Try adjusting your search criteria.' 
                          : 'There are no customer reviews yet.'
                        }
                      </p>
                      {hasActiveFilters && (
                        <button 
                          className="add-review-btn empty-state-btn"
                          onClick={handleClearFilters}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="reviews-table-container">
                      <table className="reviews-table">
                        <thead>
                          <tr>
                            <th>Product & Rating</th>
                            <th>Customer</th>
                            <th>Review Content</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviews.map(review => (
                            <tr key={review.id}>
                              <td>
                                <div className="product-review-info">
                                  <div className="product-name">
                                    {review.product_name || `Product #${review.product}`}
                                  </div>
                                  <div className="review-rating">
                                    {getRatingBadge(review.rating)}
                                  </div>
                                  {review.title && (
                                    <div className="review-title">
                                      "{review.title}"
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="customer-info">
                                  <div className="customer-name">
                                    {review.user_name || 'Anonymous'}
                                  </div>
                                  <div className="customer-email">
                                    {review.user_email || 'No email'}
                                  </div>
                                  <div className="customer-id">
                                    User ID: {review.user}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="review-content">
                                  <p className="review-body">
                                    {review.body || 'No review text provided.'}
                                  </p>
                                </div>
                              </td>
                              <td>
                                <div className="review-date">
                                  <div className="date-absolute">
                                    {formatDate(review.created_at)}
                                  </div>
                                  <div className="date-relative">
                                    {getRelativeTime(review.created_at)}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    className="action-btn view-btn"
                                    title="View review details"
                                    onClick={() => window.open(`/product/${review.product}`, '_blank')}
                                  >
                                    👁️
                                  </button>
                                  <button 
                                    className="action-btn delete-btn"
                                    onClick={() => handleDelete(review)}
                                    title="Delete review"
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

                {!loading && reviews.length > 0 && (
                  <div className="review-list-footer">
                    <div className="pagination-info">
                      Showing {reviews.length} of {totalCount} reviews
                      {hasActiveFilters && ' (filtered)'}
                      {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                    </div>
                    <div className="pagination-controls">
                      <button 
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      
                      {getPaginationItems().map((item, index) => (
                        item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                          <span key={index} className="pagination-ellipsis">...</span>
                        ) : (
                          <button
                            key={index}
                            className={`pagination-btn ${currentPage === item ? 'active' : ''}`}
                            onClick={() => handlePageChange(item)}
                          >
                            {item}
                          </button>
                        )
                      ))}
                      
                      <button 
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
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
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Delete Review</h3>
            </div>
            <div className="delete-modal-content">
              <div className="warning-icon">⚠️</div>
              <p>
                Are you sure you want to delete this review? 
                This action cannot be undone.
              </p>
              {selectedReview && (
                <div className="review-preview">
                  <div className="review-preview-header">
                    <strong>{selectedReview.user_name}</strong> reviewed{" "}
                    <strong>{selectedReview.product_name}</strong>
                  </div>
                  <div className="review-preview-rating">
                    {renderStars(selectedReview.rating)}
                  </div>
                  {selectedReview.title && (
                    <div className="review-preview-title">
                      "{selectedReview.title}"
                    </div>
                  )}
                  {selectedReview.body && (
                    <div className="review-preview-body">
                      {selectedReview.body.length > 100 
                        ? selectedReview.body.substring(0, 100) + '...' 
                        : selectedReview.body
                      }
                    </div>
                  )}
                </div>
              )}
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
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;