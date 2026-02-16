import React, { useState, useEffect, useCallback } from 'react';
import '../../../styles/CategoryForm.css';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';

const CategoryForm = ({ initialData = null, onSuccess, onCancel, mode = 'category' }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '' // For subcategories
  });

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const { showSuccess, showError, showInfo, showLoading, removeAlert } = useAlert();

  // Fetch categories function memoized with useCallback
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await ApiService.getAdminCategories();
      const categoriesData = response.data.categories || response.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showError('Failed to load categories', 'Error', { duration: 4000 });
    } finally {
      setLoadingCategories(false);
    }
  }, [showError]); // showError is a dependency

  // Load categories for subcategory form
  useEffect(() => {
    if (mode === 'subcategory') {
      fetchCategories();
    }
  }, [mode, fetchCategories]); // Added fetchCategories to dependencies

  // Initialize form with initial data for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        category_id: initialData.category?.id || initialData.category_id || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from name if slug is empty
    if (name === 'name' && !formData.slug) {
      generateSlug(value);
    }
  };

  const generateSlug = (nameValue = formData.name) => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60);
      
      setFormData(prev => ({ ...prev, slug }));
      showInfo('Slug generated automatically', 'Slug Generated', { duration: 3000 });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showError(`Please enter a ${mode} name`, 'Validation Error', { duration: 5000 });
      return false;
    }
    
    if (!formData.slug.trim()) {
      showError('Please enter a slug or generate one', 'Validation Error', { duration: 5000 });
      return false;
    }
    
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.slug)) {
      showError('Slug can only contain lowercase letters, numbers, and hyphens', 'Invalid Slug', { duration: 5000 });
      return false;
    }

    if (mode === 'subcategory' && !formData.category_id) {
      showError('Please select a parent category', 'Validation Error', { duration: 5000 });
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
      loadingAlertId = showLoading(
        mode === 'category' 
          ? initialData ? 'Updating category...' : 'Creating new category...'
          : initialData ? 'Updating subcategory...' : 'Creating new subcategory...',
        'Processing'
      );

      let response;
      
      // Prepare data based on mode
      const submitData = {
        name: formData.name.trim(),
        slug: formData.slug.trim()
      };

      if (mode === 'category') {
        if (initialData) {
          response = await ApiService.updateCategory(initialData.id, submitData);
        } else {
          response = await ApiService.createCategory(submitData);
        }
      } else {
        // Subcategory operations
        const subcategoryData = {
          ...submitData,
          category_id: formData.category_id
        };
        
        if (initialData) {
          response = await ApiService.updateSubcategory(initialData.id, subcategoryData);
        } else {
          response = await ApiService.createSubcategory(subcategoryData);
        }
      }

      if (loadingAlertId) removeAlert(loadingAlertId);
      
      const successMessage = mode === 'category'
        ? initialData ? 'Category updated successfully!' : 'Category created successfully!'
        : initialData ? 'Subcategory updated successfully!' : 'Subcategory created successfully!';
      
      showSuccess(successMessage, 'Success', { duration: 4000 });

      if (onSuccess) {
        onSuccess(response.data);
      }

    } catch (error) {
      console.error(`Error saving ${mode}:`, error);
      
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = (error) => {
    const operation = initialData ? 'update' : 'create';
    const itemType = mode === 'category' ? 'category' : 'subcategory';
    
    if (error.response?.data?.error) {
      showError(error.response.data.error, `${operation} Failed`, { duration: 6000 });
    } else if (error.response?.status === 400) {
      showError(`Invalid ${itemType} data. Please check your inputs.`, 'Validation Error', { duration: 5000 });
    } else if (error.response?.status === 401) {
      showError('Session expired. Please login again.', 'Authentication Required', { duration: 6000 });
    } else if (error.response?.status === 403) {
      showError(`You don't have permission to ${operation} ${itemType}s.`, 'Access Denied', { duration: 6000 });
    } else if (error.response?.status === 404) {
      showError(`${itemType} not found.`, 'Not Found', { duration: 5000 });
    } else if (error.response?.status === 409) {
      showError(`A ${itemType} with this name or slug already exists.`, 'Duplicate', { duration: 6000 });
    } else if (error.message === 'Network Error') {
      showError('Unable to connect to the server.', 'Connection Error', { duration: 6000 });
    } else {
      showError(`Failed to ${operation} ${itemType}. Please try again.`, 'Operation Failed', { duration: 5000 });
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All data will be lost.')) {
      setFormData({
        name: '',
        slug: '',
        category_id: mode === 'subcategory' ? '' : undefined
      });
      showInfo('Form has been reset', 'Form Reset', { duration: 3000 });
    }
  };

  return (
    <div className="category-form-container">
      <div className="category-form-header">
        <h1>
          {initialData 
            ? `Edit ${mode === 'category' ? 'Category' : 'Subcategory'}`
            : `Add New ${mode === 'category' ? 'Category' : 'Subcategory'}`
          }
        </h1>
        <p>
          {mode === 'category' 
            ? 'Create and manage product categories'
            : 'Create subcategories under existing categories'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="category-form">
        <div className="category-form-card">
          <div className="category-form-section">
            <h3>{mode === 'category' ? 'Category Information' : 'Subcategory Information'}</h3>
            
            {/* Parent Category Selection for Subcategories */}
            {mode === 'subcategory' && (
              <div className="category-form-group">
                <label htmlFor="parentCategory" className="category-label required">
                  Parent Category
                </label>
                <select
                  id="parentCategory"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="category-select"
                  required
                  disabled={isSubmitting || loadingCategories || initialData}
                >
                  <option value="">Select a parent category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <div className="category-helper">
                    <span className="category-spinner-small"></span>
                    <span>Loading categories...</span>
                  </div>
                )}
              </div>
            )}

            {/* Name Field */}
            <div className="category-form-group">
              <label htmlFor="categoryName" className="category-label required">
                Name
              </label>
              <input
                type="text"
                id="categoryName"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={`Enter ${mode} name`}
                className="category-input"
                maxLength={60}
                required
                disabled={isSubmitting}
              />
              <div className="category-counter">
                <span>{formData.name.length} / 60 characters</span>
              </div>
            </div>

            {/* Slug Field */}
            <div className="category-form-group">
              <label htmlFor="categorySlug" className="category-label required">
                Slug
              </label>
              <div className="category-slug-group">
                <input
                  type="text"
                  id="categorySlug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="url-friendly-name"
                  className="category-input"
                  maxLength={60}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="category-generate-btn"
                  onClick={() => generateSlug()}
                  disabled={!formData.name || isSubmitting}
                >
                  Generate
                </button>
              </div>
              <div className="category-counter">
                <span>{formData.slug.length} / 60 characters</span>
              </div>
              <div className="category-helper">
                <span className="category-helper-icon">🔗</span>
                <p className="category-helper-text">
                  URL-friendly version. Use lowercase letters, numbers, and hyphens only.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="category-form-actions">
          {onCancel && (
            <button 
              type="button" 
              className="category-btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button 
            type="button" 
            className="category-btn-secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset
          </button>
          <button 
            type="submit" 
            className="category-btn-primary"
            disabled={isSubmitting || (mode === 'subcategory' && !formData.category_id)}
          >
            {isSubmitting ? (
              <>
                <span className="category-spinner"></span>
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialData ? `Update ${mode === 'category' ? 'Category' : 'Subcategory'}` : `Create ${mode === 'category' ? 'Category' : 'Subcategory'}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;