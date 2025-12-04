import React, { useState, useEffect } from 'react';
import '../styles/ProductModal.css';

const ProductModal = ({ isOpen, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    is_active: true,
    category_id: '',
    main_image: null,
    detail_images: []
  });
  const [imagePreviews, setImagePreviews] = useState({
    main: null,
    detail: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      // For editing, set the form data with product data
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        is_active: product.is_active !== undefined ? product.is_active : true,
        category_id: product.category_id || product.category?.id || '',
        main_image: null,
        detail_images: []
      });

      // Set image previews for existing images
      if (product.main_image) {
        setImagePreviews(prev => ({
          ...prev,
          main: typeof product.main_image === 'string' ? product.main_image : URL.createObjectURL(product.main_image)
        }));
      }
    } else {
      // For new product, reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        stock: '',
        is_active: true,
        category_id: '',
        main_image: null,
        detail_images: []
      });
      setImagePreviews({
        main: null,
        detail: []
      });
    }
  }, [product, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, main_image: file }));
      setImagePreviews(prev => ({
        ...prev,
        main: URL.createObjectURL(file)
      }));
    }
  };

  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ 
      ...prev, 
      detail_images: [...prev.detail_images, ...files] 
    }));
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => ({
      ...prev,
      detail: [...prev.detail, ...newPreviews]
    }));
  };

  const removeDetailImage = (index) => {
    setFormData(prev => ({
      ...prev,
      detail_images: prev.detail_images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => ({
      ...prev,
      detail: prev.detail.filter((_, i) => i !== index)
    }));
  };

  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, main_image: null }));
    setImagePreviews(prev => ({ ...prev, main: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare form data according to API requirements
      const submitData = new FormData();
      
      // Append basic fields
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock.toString());
      submitData.append('is_active', formData.is_active.toString());
      
      // Append category_id - this is required by the API
      if (formData.category_id) {
        submitData.append('category_id', formData.category_id.toString());
      }

      // Append main image if selected
      if (formData.main_image) {
        submitData.append('main_image', formData.main_image);
      }

      // Append detail images
      formData.detail_images.forEach((image, index) => {
        submitData.append('detail_images', image);
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
      name: name,
      slug: generateSlug(name)
    }));
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
                placeholder="Enter product name"
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label required">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="product-slug"
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label required">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select a category</option>
                {categories && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories && categories.length === 0 && (
                <div className="error-text">
                  No categories available. Please create a category first.
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label required">Price (₦)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label required">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="form-input"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Product description..."
              rows="4"
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Active Product
            </label>
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting || !formData.category_id}
            >
              {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;