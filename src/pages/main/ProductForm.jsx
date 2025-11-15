// components/ProductForm.js
import React, { useState, useRef } from 'react';
import '../../styles/AddProduct.css';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    is_active: true,
    mainImage: null,
    otherImages: []
  });

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const additionalFilesInputRef = useRef(null);

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'books', label: 'Books & Media' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'toys', label: 'Toys & Games' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      alert('Please select valid image files (JPEG, PNG, WebP, GIF)');
      return;
    }

    if (type === 'main' && imageFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        mainImage: imageFiles[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        otherImages: [...prev.otherImages, ...imageFiles].slice(0, 10) // Limit to 10 images
      }));
    }
  };

  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, mainImage: null }));
  };

  const removeOtherImage = (index) => {
    setFormData(prev => ({
      ...prev,
      otherImages: prev.otherImages.filter((_, i) => i !== index)
    }));
  };

  const setAsMainImage = (image, index) => {
    const newOtherImages = formData.otherImages.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      mainImage: image,
      otherImages: [prev.mainImage, ...newOtherImages].filter(Boolean)
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
        .substring(0, 60); // Limit slug length
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const validateForm = () => {
    if (!formData.category) {
      alert('Please select a category');
      return false;
    }
    if (!formData.name.trim()) {
      alert('Please enter a product name');
      return false;
    }
    if (!formData.slug.trim()) {
      alert('Please enter a slug or generate one');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price');
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      alert('Please enter a valid stock quantity');
      return false;
    }
    if (!formData.mainImage) {
      alert('Please upload a main product image');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Product Data:', formData);
      alert('Product created successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All data will be lost.')) {
      setFormData({
        category: '',
        name: '',
        slug: '',
        description: '',
        price: '',
        stock: '',
        is_active: true,
        mainImage: null,
        otherImages: []
      });
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
              <h3>Basic Information</h3>
              
              <div className="add-product-form-group">
                <label htmlFor="category" className="add-product-label required">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="add-product-select"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

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
                  className="add-product-input"
                  required
                />
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
                    className="add-product-input"
                    required
                  />
                  <button 
                    type="button" 
                    className="add-product-generate-btn"
                    onClick={generateSlug}
                    disabled={!formData.name}
                  >
                    Generate
                  </button>
                </div>
                <p className="add-product-helper-text">
                  URL-friendly version of the name. Use lowercase letters, numbers, and hyphens.
                </p>
              </div>

              <div className="add-product-form-group">
                <label htmlFor="description" className="add-product-label">
                  Product Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product features, benefits, and specifications..."
                  rows="6"
                  className="add-product-textarea"
                />
                <p className="add-product-helper-text">
                  Provide detailed information about your product to help customers make informed decisions.
                </p>
              </div>
            </div>

            <div className="add-product-card">
              <h3>Pricing & Inventory</h3>
              
              <div className="add-product-form-row">
                <div className="add-product-form-group">
                  <label htmlFor="price" className="add-product-label required">
                    Price ($)
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
                    className="add-product-input"
                    required
                  />
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
                    className="add-product-input"
                    required
                  />
                </div>
              </div>

              <div className="add-product-form-group add-product-checkbox-group">
                <label className="add-product-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
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
                <h4>Main Image</h4>
                <p className="add-product-helper-text">
                  This will be the featured image for your product. Recommended size: 800x800px.
                </p>
                
                {formData.mainImage ? (
                  <div className="add-product-image-preview main-image">
                    <img 
                      src={URL.createObjectURL(formData.mainImage)} 
                      alt="Main product preview" 
                    />
                    <div className="add-product-image-actions">
                      <button 
                        type="button" 
                        className="add-product-btn-danger"
                        onClick={removeMainImage}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`add-product-drop-zone ${dragActive ? 'drag-active' : ''}`}
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
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Images Upload */}
              <div className="add-product-image-section">
                <h4>Additional Images</h4>
                <p className="add-product-helper-text">
                  Add up to 10 additional images to showcase your product from different angles.
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
                    <p className="add-product-drop-zone-text">Drag & drop additional images here</p>
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
                    />
                  </div>
                </div>

                {/* Other Images Grid */}
                {formData.otherImages.length > 0 && (
                  <>
                    <div className="add-product-helper-text" style={{marginTop: '1rem'}}>
                      {formData.otherImages.length} additional image(s) uploaded
                    </div>
                    <div className="add-product-other-images-grid">
                      {formData.otherImages.map((image, index) => (
                        <div key={index} className="add-product-image-preview other-image">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`Product preview ${index + 1}`} 
                          />
                          <div className="add-product-image-actions">
                            <button 
                              type="button" 
                              className="add-product-btn-primary"
                              onClick={() => setAsMainImage(image, index)}
                            >
                              Set as Main
                            </button>
                            <button 
                              type="button" 
                              className="add-product-btn-danger"
                              onClick={() => removeOtherImage(index)}
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

        {/* Form Actions */}
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
                Creating...
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