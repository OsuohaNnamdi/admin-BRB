import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../../../styles/AddProduct.css';
import ApiService from '../../../config/ApiService';
import { useAlert } from '../../../context/alert/AlertContext';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    category_ids: [], // Changed from category_id to category_ids (array)
    subcategory_ids: [], // New field for subcategories
    name: '',
    slug: '',
    description: '',
    ingredients: '',
    price: '',
    stock: '',
    is_active: true,
    main_image: null,
    detail_images: []
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Use the alert context instead of local state
  const { 
    showSuccess, 
    showError, 
    showInfo, 
    showWarning,
    showLoading,
    removeAlert 
  } = useAlert();

  const fileInputRef = useRef(null);
  const additionalFilesInputRef = useRef(null);

  // Fetch categories with useCallback
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    let loadingAlertId = null;
    
    try {
      // Show loading alert for categories
      loadingAlertId = showLoading('Loading categories...', 'Fetching Data');
      
      const response = await ApiService.getAdminCategories();
      console.log('Categories fetched:', response.data);
      
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
          'Your session has expired. Please login again to access categories.',
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
      
      setErrors(prev => ({
        ...prev,
        categories: 'Failed to load categories'
      }));
    } finally {
      setLoadingCategories(false);
    }
  }, [showLoading, removeAlert, showError]);

  // Fetch subcategories
  const fetchSubcategories = useCallback(async () => {
    setLoadingSubcategories(true);
    try {
      const response = await ApiService.getAdminSubcategories();
      console.log('Subcategories fetched:', response.data);
      
      const subcategoriesData = response.data.subcategories || response.data || [];
      setSubcategories(subcategoriesData);
      
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      showError('Failed to load subcategories', 'Error', { duration: 4000 });
    } finally {
      setLoadingSubcategories(false);
    }
  }, [showError]);

  // Fetch categories and subcategories on component mount
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, [fetchCategories, fetchSubcategories]);

  // Effect 1: Filter subcategories when categories change
  useEffect(() => {
    if (formData.category_ids.length > 0) {
      const filtered = subcategories.filter(sub => 
        formData.category_ids.includes(sub.category?.id)
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.category_ids, subcategories]);

  // Effect 2: Validate and clean up subcategory selections when filtered subcategories change
  useEffect(() => {
    // Only run if we have filtered subcategories and selected subcategories
    if (filteredSubcategories.length > 0 && formData.subcategory_ids.length > 0) {
      // Check if any selected subcategories are invalid
      const validSubcategoryIds = formData.subcategory_ids.filter(id => 
        filteredSubcategories.some(sub => sub.id === id)
      );
      
      // If there are invalid selections, clean them up
      if (validSubcategoryIds.length !== formData.subcategory_ids.length) {
        setFormData(prev => ({
          ...prev,
          subcategory_ids: validSubcategoryIds
        }));
        
        if (validSubcategoryIds.length === 0) {
          showWarning(
            'Selected subcategories are no longer valid and have been removed',
            'Subcategories Updated',
            { duration: 3000 }
          );
        } else {
          showWarning(
            'Some subcategories were removed as they don\'t belong to selected categories',
            'Subcategories Updated',
            { duration: 3000 }
          );
        }
      }
    } else if (filteredSubcategories.length === 0 && formData.subcategory_ids.length > 0) {
      // If no subcategories are available but some are selected, clear them
      setFormData(prev => ({
        ...prev,
        subcategory_ids: []
      }));
      
      if (formData.category_ids.length > 0) {
        showWarning(
          'No subcategories available for selected categories',
          'Subcategories Cleared',
          { duration: 3000 }
        );
      }
    }
  }, [filteredSubcategories, formData.subcategory_ids, formData.category_ids.length, showWarning]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      category_ids: selectedOptions
    }));
    
    if (errors.category_ids) {
      setErrors(prev => ({
        ...prev,
        category_ids: ''
      }));
    }
  };

  const handleSubcategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      subcategory_ids: selectedOptions
    }));
    
    if (errors.subcategory_ids) {
      setErrors(prev => ({
        ...prev,
        subcategory_ids: ''
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files, 'additional');
    }
  };

  const handleMainImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files, 'main');
    }
  };

  const handleFileSelect = (e, type = 'additional') => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files, type);
    }
  };

  const handleFiles = (files, type) => {
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)
    );

    if (imageFiles.length === 0) {
      showError(
        'Please select valid image files (JPEG, PNG, WebP, GIF)',
        'Invalid File Type',
        { duration: 5000 }
      );
      return;
    }

    if (errors.detail_images) {
      setErrors(prev => ({
        ...prev,
        detail_images: ''
      }));
    }

    if (type === 'main' && imageFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        main_image: imageFiles[0]
      }));
      showInfo('Main image selected successfully', 'Image Added', { duration: 3000 });
    } else {
      const newImages = [...formData.detail_images, ...imageFiles].slice(0, 10);
      setFormData(prev => ({
        ...prev,
        detail_images: newImages
      }));
      showInfo(`${imageFiles.length} detail image(s) added`, 'Images Added', { duration: 3000 });
    }
  };

  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, main_image: null }));
    showInfo('Main image removed', 'Image Removed', { duration: 3000 });
  };

  const removeOtherImage = (index) => {
    setFormData(prev => ({
      ...prev,
      detail_images: prev.detail_images.filter((_, i) => i !== index)
    }));
    showInfo('Detail image removed', 'Image Removed', { duration: 3000 });
  };

  const setAsMainImage = (image, index) => {
    const newDetailImages = formData.detail_images.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      main_image: image,
      detail_images: [prev.main_image, ...newDetailImages].filter(Boolean)
    }));
    showInfo('Image set as main successfully', 'Main Image Updated', { duration: 3000 });
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
      
      if (errors.slug) {
        setErrors(prev => ({
          ...prev,
          slug: ''
        }));
      }
      showInfo('Slug generated from product name', 'Slug Generated', { duration: 3000 });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category_ids || formData.category_ids.length === 0) {
      newErrors.category_ids = 'At least one category is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.ingredients.trim()) {
      newErrors.ingredients = 'Ingredients list is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    if (!formData.main_image) {
      newErrors.main_image = 'Main image is required';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      showError(
        'Please fill in all required fields correctly',
        'Validation Error',
        { duration: 5000 }
      );
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    let loadingAlertId = null;
    
    try {
      // Show loading alert for product creation
      loadingAlertId = showLoading('Creating your product...', 'Processing');
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append category and subcategory IDs as arrays
      formData.category_ids.forEach(id => {
        submitData.append('category_ids', id);
      });
      
      formData.subcategory_ids.forEach(id => {
        submitData.append('subcategory_ids', id);
      });
      
      // Append text fields
      submitData.append('name', formData.name.trim());
      submitData.append('slug', formData.slug.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('ingredients', formData.ingredients.trim());
      submitData.append('price', parseFloat(formData.price));
      submitData.append('stock', parseInt(formData.stock));
      submitData.append('is_active', formData.is_active.toString());
      
      // Append main image - ensure it's a proper File object
      if (formData.main_image && formData.main_image instanceof File) {
        submitData.append('main_image', formData.main_image);
      }
      
      // Append detail images - ensure each is a proper File object
      formData.detail_images.forEach((image) => {
        if (image instanceof File) {
          submitData.append('detail_images', image);
        }
      });

      console.log('Submitting product data...');
      console.log('Category IDs:', formData.category_ids);
      console.log('Subcategory IDs:', formData.subcategory_ids);
      
      const response = await ApiService.createProduct(submitData);
      
      console.log('Product created successfully:', response.data);
      
      // Remove loading alert and show success
      if (loadingAlertId) removeAlert(loadingAlertId);
      showSuccess('Product created successfully!', 'Product Created', { duration: 5000 });
      
      // Reset form after successful submission
      setFormData({
        category_ids: [],
        subcategory_ids: [],
        name: '',
        slug: '',
        description: '',
        ingredients: '',
        price: '',
        stock: '',
        is_active: true,
        main_image: null,
        detail_images: []
      });
      
    } catch (error) {
      console.error('Error creating product:', error);
      
      // Remove loading alert on error
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const formattedErrors = {};
        
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            formattedErrors[key] = backendErrors[key].join(', ');
          } else {
            formattedErrors[key] = backendErrors[key];
          }
        });
        
        setErrors(formattedErrors);
        
        // Show backend validation errors
        if (formattedErrors.general) {
          showError(formattedErrors.general, 'Creation Failed', { duration: 6000 });
        } else {
          showError(
            'Please check the form for errors and try again.',
            'Validation Error',
            { duration: 6000 }
          );
        }
      } else if (error.response?.status === 400) {
        showError(
          'Invalid product data. Please check all fields and try again.',
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
          'You do not have permission to create products.',
          'Access Denied',
          { duration: 6000 }
        );
      } else if (error.response?.status === 413) {
        showError(
          'The uploaded files are too large. Please reduce the image sizes and try again.',
          'File Too Large',
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
          'Failed to create product. Please try again.',
          'Creation Failed',
          { duration: 5000 }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    const confirmReset = () => {
      setFormData({
        category_ids: [],
        subcategory_ids: [],
        name: '',
        slug: '',
        description: '',
        ingredients: '',
        price: '',
        stock: '',
        is_active: true,
        main_image: null,
        detail_images: []
      });
      setErrors({});
      showInfo('Form has been reset successfully', 'Form Reset', { duration: 3000 });
    };

    // Use window.confirm for simplicity, or you can create a custom alert confirmation
    if (window.confirm('Are you sure you want to reset the form? All data will be lost.')) {
      confirmReset();
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h1>Add New Product</h1>
        <p>Create a new product listing for your store. Fill in all required fields marked with *</p>
      </div>

      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="add-product-grid">
          {/* Left Column - Basic Information */}
          <div className="add-product-column">
            <div className="add-product-card">
              <h3>Category Selection</h3>
              
              <div className="add-product-form-group">
                <label htmlFor="category_ids" className="add-product-label required">
                  Categories (Select multiple with Ctrl/Cmd)
                </label>
                <select
                  id="category_ids"
                  name="category_ids"
                  multiple
                  value={formData.category_ids}
                  onChange={handleCategoryChange}
                  className={`add-product-select ${errors.category_ids ? 'error' : ''}`}
                  size="4"
                  required
                  disabled={isSubmitting || loadingCategories}
                >
                  {loadingCategories ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.category_ids && (
                  <span className="add-product-error-text">{errors.category_ids}</span>
                )}
                <p className="add-product-helper-text">
                  Hold Ctrl (or Cmd on Mac) to select multiple categories. At least one category is required.
                </p>
              </div>

              <div className="add-product-form-group">
                <label htmlFor="subcategory_ids" className="add-product-label">
                  Subcategories (Optional)
                </label>
                <select
                  id="subcategory_ids"
                  name="subcategory_ids"
                  multiple
                  value={formData.subcategory_ids}
                  onChange={handleSubcategoryChange}
                  className={`add-product-select ${errors.subcategory_ids ? 'error' : ''}`}
                  size="4"
                  disabled={isSubmitting || loadingSubcategories || formData.category_ids.length === 0}
                >
                  {loadingSubcategories ? (
                    <option disabled>Loading subcategories...</option>
                  ) : filteredSubcategories.length === 0 ? (
                    <option disabled>
                      {formData.category_ids.length === 0 
                        ? 'Select categories first' 
                        : 'No subcategories available for selected categories'}
                    </option>
                  ) : (
                    filteredSubcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({categories.find(c => c.id === sub.category?.id)?.name || sub.category?.name})
                      </option>
                    ))
                  )}
                </select>
                {errors.subcategory_ids && (
                  <span className="add-product-error-text">{errors.subcategory_ids}</span>
                )}
                <p className="add-product-helper-text">
                  Hold Ctrl (or Cmd on Mac) to select multiple subcategories. Only subcategories from selected categories are shown.
                </p>
              </div>
            </div>

            <div className="add-product-card">
              <h3>Basic Information</h3>
              
              <div className="add-product-form-group">
                <label htmlFor="name" className="add-product-label required">
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className={`add-product-input ${errors.name ? 'error' : ''}`}
                  required
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className="add-product-error-text">{errors.name}</span>
                )}
              </div>

              <div className="add-product-form-group">
                <label htmlFor="slug" className="add-product-label required">
                  Product Slug
                </label>
                <div className="add-product-slug-group">
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="product-slug-url"
                    className={`add-product-input ${errors.slug ? 'error' : ''}`}
                    required
                    disabled={isSubmitting}
                  />
                  <button 
                    type="button" 
                    className="add-product-generate-btn"
                    onClick={generateSlug}
                    disabled={!formData.name || isSubmitting}
                  >
                    Generate
                  </button>
                </div>
                {errors.slug && (
                  <span className="add-product-error-text">{errors.slug}</span>
                )}
                <p className="add-product-helper-text">
                  URL-friendly version of the name. Use lowercase letters, numbers, and hyphens.
                </p>
              </div>

              <div className="add-product-form-group">
                <label htmlFor="description" className="add-product-label required">
                  Product Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product features, benefits, and specifications..."
                  rows="6"
                  className={`add-product-textarea ${errors.description ? 'error' : ''}`}
                  required
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <span className="add-product-error-text">{errors.description}</span>
                )}
                <p className="add-product-helper-text">
                  Provide detailed information about your product to help customers make informed decisions.
                </p>
              </div>
            </div>

            <div className="add-product-card">
              <h3>Ingredients</h3>
              
              <div className="add-product-form-group">
                <label htmlFor="ingredients" className="add-product-label required">
                  Product Ingredients
                </label>
                <textarea
                  id="ingredients"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="List all ingredients separated by commas or new lines. Example: Water, Flour, Sugar, Salt..."
                  rows="4"
                  className={`add-product-textarea ${errors.ingredients ? 'error' : ''}`}
                  required
                  disabled={isSubmitting}
                />
                {errors.ingredients && (
                  <span className="add-product-error-text">{errors.ingredients}</span>
                )}
                <p className="add-product-helper-text">
                  List all ingredients used in the product. Be comprehensive for customers with allergies or dietary restrictions.
                </p>
              </div>
            </div>

            <div className="add-product-card">
              <h3>Pricing & Inventory</h3>
              
              <div className="add-product-form-row">
                <div className="add-product-form-group">
                  <label htmlFor="price" className="add-product-label required">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`add-product-input ${errors.price ? 'error' : ''}`}
                    required
                    disabled={isSubmitting}
                  />
                  {errors.price && (
                    <span className="add-product-error-text">{errors.price}</span>
                  )}
                </div>

                <div className="add-product-form-group">
                  <label htmlFor="stock" className="add-product-label required">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className={`add-product-input ${errors.stock ? 'error' : ''}`}
                    required
                    disabled={isSubmitting}
                  />
                  {errors.stock && (
                    <span className="add-product-error-text">{errors.stock}</span>
                  )}
                </div>
              </div>

              <div className="add-product-form-group add-product-checkbox-group">
                <label className="add-product-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <span className="add-product-checkmark"></span>
                  <span>Active Product</span>
                  <span className={`add-product-status ${formData.is_active ? 'active' : 'inactive'}`}>
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </label>
                <p className="add-product-helper-text">
                  When unchecked, this product will be hidden from customers and won't appear in search results.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="add-product-column">
            <div className="add-product-card">
              <h3>Product Images</h3>
              
              {/* Main Image Upload */}
              <div className="add-product-image-section">
                <h4>Main Image *</h4>
                <p className="add-product-helper-text">
                  This will be the featured image for your product. Recommended size: 800x800px.
                </p>
                
                {formData.main_image ? (
                  <div className="add-product-image-preview main-image">
                    <img 
                      src={URL.createObjectURL(formData.main_image)} 
                      alt="Main product preview" 
                    />
                    <div className="add-product-image-actions">
                      <button 
                        type="button" 
                        className="add-product-btn-danger"
                        onClick={removeMainImage}
                        disabled={isSubmitting}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`add-product-drop-zone ${dragActive ? 'drag-active' : ''} ${errors.main_image ? 'error' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleMainImageDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="add-product-drop-zone-content">
                      <div className="add-product-drop-zone-icon">📸</div>
                      <p className="add-product-drop-zone-text">Drag & drop your main image here</p>
                      <p className="add-product-drop-zone-subtext">or</p>
                      <div className="add-product-browse-btn">
                        Browse Files
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => handleFileSelect(e, 'main')}
                        hidden
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}
                {errors.main_image && (
                  <span className="add-product-error-text">{errors.main_image}</span>
                )}
              </div>

              {/* Detail Images Upload */}
              <div className="add-product-image-section">
                <h4>Detail Images</h4>
                <p className="add-product-helper-text">
                  Add up to 10 detail images to showcase your product from different angles.
                </p>
                
                <div 
                  className={`add-product-drop-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => additionalFilesInputRef.current?.click()}
                >
                  <div className="add-product-drop-zone-content">
                    <div className="add-product-drop-zone-icon">🖼️</div>
                    <p className="add-product-drop-zone-text">Drag & drop detail images here</p>
                    <p className="add-product-drop-zone-subtext">or</p>
                    <div className="add-product-browse-btn">
                      Browse Files
                    </div>
                    <input
                      ref={additionalFilesInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      onChange={(e) => handleFileSelect(e, 'additional')}
                      hidden
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {errors.detail_images && (
                  <span className="add-product-error-text">{errors.detail_images}</span>
                )}

                {formData.detail_images.length > 0 && (
                  <>
                    <div className="add-product-helper-text" style={{marginTop: '1rem'}}>
                      {formData.detail_images.length} detail image(s) uploaded
                    </div>
                    <div className="add-product-other-images-grid">
                      {formData.detail_images.map((image, index) => (
                        <div key={index} className="add-product-image-preview other-image">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`Product detail ${index + 1}`} 
                          />
                          <div className="add-product-image-actions">
                            <button 
                              type="button" 
                              className="add-product-btn-primary"
                              onClick={() => setAsMainImage(image, index)}
                              disabled={isSubmitting}
                            >
                              Set as Main
                            </button>
                            <button 
                              type="button" 
                              className="add-product-btn-danger"
                              onClick={() => removeOtherImage(index)}
                              disabled={isSubmitting}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="add-product-form-actions">
          <button 
            type="button" 
            className="add-product-btn-secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="add-product-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="add-product-spinner"></span>
                Creating Product...
              </>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;