import React, { useState, useEffect, useRef } from 'react';
import '../styles/ProductModal.css';

const ProductModal = ({ isOpen, onClose, onSubmit, product, categories = [], subcategories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    ingredients: '',
    how_to_use: '',
    price: '',
    stock: '',
    is_active: true,
    category_ids: [],
    subcategory_ids: [],
    main_image: null,
    detail_images: []
  });

  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [existingMainImage, setExistingMainImage] = useState(null);
  const [existingDetailImages, setExistingDetailImages] = useState([]);
  
  const fileInputRef = useRef(null);
  const additionalFilesInputRef = useRef(null);

  // Update available subcategories when selected categories change
  useEffect(() => {
    if (formData.category_ids.length > 0) {
      // Filter subcategories that belong to selected categories
      const filtered = subcategories.filter(sub => 
        formData.category_ids.includes(sub.category?.id)
      );
      setAvailableSubcategories(filtered);
      
      // Remove any selected subcategories that are no longer valid
      const validSubcategoryIds = formData.subcategory_ids.filter(id => 
        filtered.some(sub => sub.id === id)
      );
      
      if (validSubcategoryIds.length !== formData.subcategory_ids.length) {
        setFormData(prev => ({
          ...prev,
          subcategory_ids: validSubcategoryIds
        }));
      }
    } else {
      setAvailableSubcategories([]);
      setFormData(prev => ({
        ...prev,
        subcategory_ids: []
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.category_ids, subcategories]);

  useEffect(() => {
    if (product) {
      // Handle both old and new data structures
      let categoryIds = [];
      let subcategoryIds = [];

      // Handle category_ids array
      if (product.category_ids && Array.isArray(product.category_ids)) {
        categoryIds = product.category_ids;
      } 
      // Handle single category_id
      else if (product.category_id) {
        categoryIds = [product.category_id];
      }
      // Handle category object
      else if (product.category?.id) {
        categoryIds = [product.category.id];
      }

      // Handle subcategory_ids array
      if (product.subcategory_ids && Array.isArray(product.subcategory_ids)) {
        subcategoryIds = product.subcategory_ids;
      }
      // Handle subcategories array of objects
      else if (product.subcategories && Array.isArray(product.subcategories)) {
        subcategoryIds = product.subcategories.map(s => s.id);
      }

      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        ingredients: product.ingredients || '',
        how_to_use: product.how_to_use || '',
        price: product.price || '',
        stock: product.stock || '',
        is_active: product.is_active !== undefined ? product.is_active : true,
        category_ids: categoryIds,
        subcategory_ids: subcategoryIds,
        main_image: null,
        detail_images: []
      });
      
      // Store existing images for display
      setExistingMainImage(product.main_image_url || null);
      setExistingDetailImages(product.detail_images_urls || []);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        ingredients: '',
        how_to_use: '',
        price: '',
        stock: '',
        is_active: true,
        category_ids: [],
        subcategory_ids: [],
        main_image: null,
        detail_images: []
      });
      setExistingMainImage(null);
      setExistingDetailImages([]);
    }
  }, [product, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      category_ids: selectedOptions
    }));
  };

  const handleSubcategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      subcategory_ids: selectedOptions
    }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  // Image handling functions
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
      alert('Please select valid image files (JPEG, PNG, WebP, GIF)');
      return;
    }

    if (type === 'main' && imageFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        main_image: imageFiles[0]
      }));
      setExistingMainImage(null); // Clear existing main image when new one is selected
    } else {
      const newImages = [...formData.detail_images, ...imageFiles].slice(0, 10);
      setFormData(prev => ({
        ...prev,
        detail_images: newImages
      }));
    }
  };

  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, main_image: null }));
    setExistingMainImage(null);
  };

  const removeDetailImage = (index, isExisting = false, existingIndex = null) => {
    if (isExisting) {
      // Remove existing image from the server
      const updatedExistingImages = [...existingDetailImages];
      updatedExistingImages.splice(existingIndex, 1);
      setExistingDetailImages(updatedExistingImages);
    } else {
      // Remove new image from form data
      setFormData(prev => ({
        ...prev,
        detail_images: prev.detail_images.filter((_, i) => i !== index)
      }));
    }
  };

  const setAsMainImage = (image, index, isExisting = false, existingIndex = null) => {
    if (isExisting) {
      // Move existing image to main
      const imageUrl = existingDetailImages[existingIndex];
      const updatedExistingImages = [...existingDetailImages];
      updatedExistingImages.splice(existingIndex, 1);
      
      setExistingMainImage(imageUrl);
      setExistingDetailImages(updatedExistingImages);
    } else {
      // Move new image to main
      const imageFile = formData.detail_images[index];
      const newDetailImages = [...formData.detail_images];
      newDetailImages.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        main_image: imageFile,
        detail_images: prev.main_image ? [prev.main_image, ...newDetailImages] : [...newDetailImages]
      }));
      setExistingMainImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData for file uploads
      const submitData = new FormData();

      // Always include text fields if they have values
      if (formData.name) submitData.append('name', formData.name);
      if (formData.slug) submitData.append('slug', formData.slug);
      if (formData.description) submitData.append('description', formData.description);
      if (formData.ingredients) submitData.append('ingredients', formData.ingredients);
      if (formData.how_to_use) submitData.append('how_to_use', formData.how_to_use);
      if (formData.price) submitData.append('price', parseFloat(formData.price));
      if (formData.stock !== '') submitData.append('stock', parseInt(formData.stock));
      submitData.append('is_active', formData.is_active);

      // Include category_ids array
      formData.category_ids.forEach(id => {
        submitData.append('category_ids', id);
      });

      // Include subcategory_ids array
      formData.subcategory_ids.forEach(id => {
        submitData.append('subcategory_ids', id);
      });

      // Handle main image - only if a new one was selected
      if (formData.main_image instanceof File) {
        submitData.append('main_image', formData.main_image);
      }

      // Handle detail images - only new ones
      formData.detail_images.forEach((image) => {
        if (image instanceof File) {
          submitData.append('detail_images', image);
        }
      });

      // Note: For existing images that need to be deleted, you would need to implement 
      // a separate API call or include image IDs to delete
      // For now, we're only sending new images

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSlug = () => {
    if (formData.name) {
      const slug = generateSlug(formData.name);
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="product-modal">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Slug</label>
              <div className="slug-input-group">
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
                <button 
                  type="button" 
                  className="generate-slug-btn"
                  onClick={handleGenerateSlug}
                  disabled={!formData.name || isSubmitting}
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Categories (Select multiple with Ctrl/Cmd)</label>
              <select
                name="category_ids"
                multiple
                value={formData.category_ids}
                onChange={handleCategoryChange}
                className="form-select"
                size="4"
                required
                disabled={isSubmitting}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <small className="helper-text">Hold Ctrl (Cmd on Mac) to select multiple categories</small>
            </div>

            <div className="form-group">
              <label className="form-label">Subcategories (Optional)</label>
              <select
                name="subcategory_ids"
                multiple
                value={formData.subcategory_ids}
                onChange={handleSubcategoryChange}
                className="form-select"
                size="4"
                disabled={isSubmitting || formData.category_ids.length === 0 || availableSubcategories.length === 0}
              >
                {availableSubcategories.length === 0 ? (
                  <option value="" disabled>
                    {formData.category_ids.length === 0 
                      ? 'Select categories first' 
                      : 'No subcategories available'}
                  </option>
                ) : (
                  availableSubcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))
                )}
              </select>
              <small className="helper-text">
                {formData.category_ids.length === 0 
                  ? 'Select categories first to see subcategories' 
                  : 'Hold Ctrl (Cmd on Mac) to select multiple subcategories'}
              </small>
            </div>

            <div className="form-group">
              <label className="form-label required">Price (₦)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="form-textarea"
              required
              disabled={isSubmitting}
              placeholder="Describe your product features, benefits, and specifications..."
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Ingredients</label>
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              rows="3"
              className="form-textarea"
              required
              disabled={isSubmitting}
              placeholder="List all ingredients separated by commas or new lines. Example: Water, Glycerin, Vitamin C..."
            />
          </div>

          <div className="form-group">
            <label className="form-label required">How to Use</label>
            <textarea
              name="how_to_use"
              value={formData.how_to_use}
              onChange={handleInputChange}
              rows="3"
              className="form-textarea"
              required
              disabled={isSubmitting}
              placeholder="Provide step-by-step instructions on how to use this product..."
            />
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label className="form-label">Product Images</label>
            
            {/* Main Image */}
            <div className="image-section">
              <label className="image-section-label">Main Image</label>
              {(existingMainImage || formData.main_image) ? (
                <div className="image-preview main-image-preview">
                  <img 
                    src={formData.main_image ? URL.createObjectURL(formData.main_image) : existingMainImage} 
                    alt="Main product" 
                  />
                  <div className="image-actions">
                    <button 
                      type="button" 
                      className="image-remove-btn"
                      onClick={removeMainImage}
                      disabled={isSubmitting}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleMainImageDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="drop-zone-content">
                    <div className="drop-zone-icon">📸</div>
                    <p>Drag & drop your main image here</p>
                    <p className="drop-zone-subtext">or</p>
                    <button type="button" className="browse-btn">Browse Files</button>
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
            </div>

            {/* Detail Images */}
            <div className="image-section">
              <label className="image-section-label">Detail Images (Up to 10)</label>
              
              <div 
                className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => additionalFilesInputRef.current?.click()}
              >
                <div className="drop-zone-content">
                  <div className="drop-zone-icon">🖼️</div>
                  <p>Drag & drop detail images here</p>
                  <p className="drop-zone-subtext">or</p>
                  <button type="button" className="browse-btn">Browse Files</button>
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

              {/* Display existing detail images */}
              {existingDetailImages.length > 0 && (
                <div className="detail-images-grid">
                  <label className="image-subsection-label">Existing Images</label>
                  <div className="images-grid">
                    {existingDetailImages.map((image, idx) => (
                      <div key={`existing-${idx}`} className="image-preview detail-image-preview">
                        <img src={image} alt={`Detail ${idx + 1}`} />
                        <div className="image-actions">
                          <button 
                            type="button" 
                            className="image-set-main-btn"
                            onClick={() => setAsMainImage(image, idx, true, idx)}
                            disabled={isSubmitting}
                            title="Set as main image"
                          >
                            Set as Main
                          </button>
                          <button 
                            type="button" 
                            className="image-remove-btn"
                            onClick={() => removeDetailImage(idx, true, idx)}
                            disabled={isSubmitting}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display new detail images */}
              {formData.detail_images.length > 0 && (
                <div className="detail-images-grid">
                  <label className="image-subsection-label">New Images</label>
                  <div className="images-grid">
                    {formData.detail_images.map((image, idx) => (
                      <div key={`new-${idx}`} className="image-preview detail-image-preview">
                        <img src={URL.createObjectURL(image)} alt={`New detail ${idx + 1}`} />
                        <div className="image-actions">
                          <button 
                            type="button" 
                            className="image-set-main-btn"
                            onClick={() => setAsMainImage(image, idx, false)}
                            disabled={isSubmitting}
                            title="Set as main image"
                          >
                            Set as Main
                          </button>
                          <button 
                            type="button" 
                            className="image-remove-btn"
                            onClick={() => removeDetailImage(idx, false)}
                            disabled={isSubmitting}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <small className="helper-text">
                Supported formats: JPEG, PNG, WebP, GIF. Max file size: 5MB per image.
              </small>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              <span className="checkmark"></span>
              <span>Active Product</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || formData.category_ids.length === 0}
            >
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;