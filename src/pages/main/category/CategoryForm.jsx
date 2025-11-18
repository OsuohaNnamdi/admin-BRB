import React, { useState } from 'react';
import '../../../styles/CategoryForm.css';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use the alert context instead of local state
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    showLoading,
    removeAlert 
  } = useAlert();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSlug = () => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60);
      setFormData(prev => ({ ...prev, slug }));
      
      // Show info alert when slug is generated
      showInfo('Slug generated automatically from category name', 'Slug Generated', { duration: 3000 });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showError('Please enter a category name', 'Validation Error', { duration: 5000 });
      return false;
    }
    if (!formData.slug.trim()) {
      showError('Please enter a slug or generate one using the Generate button', 'Validation Error', { duration: 5000 });
      return false;
    }
    
    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.slug)) {
      showError('Slug can only contain lowercase letters, numbers, and hyphens', 'Invalid Slug Format', { duration: 5000 });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    let loadingAlertId = null;
    
    try {
      // Show loading alert
      loadingAlertId = showLoading('Creating new category...', 'Processing');
      
      // Call the API service to create category
      const response = await ApiService.createCategory({
        name: formData.name.trim(),
        slug: formData.slug.trim()
      });

      console.log('Category created successfully:', response.data);
      
      // Remove loading alert and show success
      if (loadingAlertId) removeAlert(loadingAlertId);
      showSuccess('Category created successfully!', 'Success', { duration: 4000 });
      
      // Reset form after successful submission
      setFormData({ name: '', slug: '' });
      
    } catch (error) {
      console.error('Error creating category:', error);
      
      // Remove loading alert if it exists
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      // Handle different error scenarios with appropriate alert types
      if (error.response?.data?.error) {
        showError(
          error.response.data.error, 
          'Creation Failed',
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
          'You do not have permission to create categories. Please contact your administrator.',
          'Access Denied',
          { duration: 6000 }
        );
      } else if (error.response?.status === 409) {
        showWarning(
          'A category with this name or slug already exists. Please use a different name or slug.',
          'Duplicate Category',
          { duration: 6000 }
        );
      } else if (error.message === 'Network Error') {
        showError(
          'Unable to connect to the server. Please check your internet connection and try again.',
          'Connection Error',
          { duration: 6000 }
        );
      } else if (error.response?.status >= 500) {
        showError(
          'Our servers are currently experiencing issues. Please try again in a few moments.',
          'Server Error',
          { duration: 6000 }
        );
      } else {
        showError(
          'An unexpected error occurred while creating the category. Please try again.',
          'Creation Failed',
          { duration: 5000 }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    // Show confirmation using alert
    const confirmReset = () => {
      setFormData({ name: '', slug: '' });
      showInfo('Form has been reset successfully', 'Form Reset', { duration: 3000 });
    };

    // Use warning alert for confirmation
    showWarning(
      'Are you sure you want to reset the form? All entered data will be lost.',
      'Confirm Reset',
      { 
        duration: 0, // Don't auto-dismiss
        dismissible: true,
        onClose: () => console.log('Reset cancelled'),
        // You might want to add custom buttons for confirmation
        // For now, we'll use a simple approach
      }
    );

    // Simple confirmation dialog (you can enhance this with a custom alert later)
    if (window.confirm('Are you sure you want to reset the form? All data will be lost.')) {
      setFormData({ name: '', slug: '' });
      showInfo('Form has been reset successfully', 'Form Reset', { duration: 3000 });
    }
  };

  const nameLength = formData.name?.length || 0;
  const slugLength = formData.slug?.length || 0;
  const maxNameLength = 60;
  const maxSlugLength = 60;

  return (
    <div className="category-form-container">
      <div className="category-form-header">
        <h1>Add New Category</h1>
        <p>Create a new product category with name and URL-friendly slug</p>
      </div>

      {/* Removed local success/error messages since we're using alerts */}

      <form onSubmit={handleSubmit} className="category-form">
        <div className="category-form-card">
          <div className="category-form-section">
            <h3>Category Information</h3>
            
            {/* Name Field */}
            <div className="category-form-group">
              <label htmlFor="categoryName" className="category-label required">
                Category Name
              </label>
              <input
                type="text"
                id="categoryName"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name (e.g., Electronics, Clothing, Home Decor)"
                className="category-input"
                maxLength={maxNameLength}
                required
                disabled={isSubmitting}
              />
              <div className="category-counter">
                <span>{nameLength} / {maxNameLength} characters</span>
              </div>
              <div className="category-helper">
                <span className="category-helper-icon">💡</span>
                <p className="category-helper-text">
                  Choose a clear, descriptive name that represents all products in this category.
                </p>
              </div>
            </div>

            {/* Slug Field */}
            <div className="category-form-group">
              <label htmlFor="categorySlug" className="category-label required">
                Category Slug
              </label>
              <div className="category-slug-group">
                <input
                  type="text"
                  id="categorySlug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="category-slug-url (e.g., electronics, clothing-fashion)"
                  className="category-input"
                  maxLength={maxSlugLength}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="category-generate-btn"
                  onClick={generateSlug}
                  disabled={!formData.name || isSubmitting}
                >
                  Generate
                </button>
              </div>
              <div className="category-counter">
                <span>{slugLength} / {maxSlugLength} characters</span>
              </div>
              <div className="category-helper">
                <span className="category-helper-icon">🔗</span>
                <p className="category-helper-text">
                  URL-friendly version. Use lowercase letters, numbers, and hyphens only. No spaces or special characters.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Form Actions */}
        <div className="category-form-actions">
          <button 
            type="button" 
            className="category-btn-secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset Form
          </button>
          <button 
            type="submit" 
            className="category-btn-primary"
            disabled={isSubmitting || !formData.name || !formData.slug}
          >
            {isSubmitting ? (
              <>
                <span className="category-spinner"></span>
                Creating Category...
              </>
            ) : (
              'Create Category'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;