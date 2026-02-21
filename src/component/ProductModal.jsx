import React, { useState, useEffect } from 'react';
import '../styles/ProductModal.css';

const ProductModal = ({ isOpen, onClose, onSubmit, product, categories = [], subcategories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    is_active: true,
    category_ids: [], // Changed from category_id to category_ids (array)
    subcategory_ids: [], // New field for subcategories
    main_image: null,
    detail_images: []
  });

  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        price: product.price || '',
        stock: product.stock || '',
        is_active: product.is_active !== undefined ? product.is_active : true,
        category_ids: categoryIds,
        subcategory_ids: subcategoryIds,
        main_image: null,
        detail_images: []
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        stock: '',
        is_active: true,
        category_ids: [],
        subcategory_ids: [],
        main_image: null,
        detail_images: []
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // For PATCH updates, we only send what's needed
      const submitData = {};

      // Always include text fields if they have values
      if (formData.name) submitData.name = formData.name;
      if (formData.slug) submitData.slug = formData.slug;
      if (formData.description) submitData.description = formData.description;
      if (formData.price) submitData.price = parseFloat(formData.price);
      if (formData.stock !== '') submitData.stock = parseInt(formData.stock);
      submitData.is_active = formData.is_active;

      // Include category_ids array
      if (formData.category_ids.length > 0) {
        submitData.category_ids = formData.category_ids;
      }

      // Include subcategory_ids array
      if (formData.subcategory_ids.length > 0) {
        submitData.subcategory_ids = formData.subcategory_ids;
      }

      // For image updates, we would need a separate API call
      // This modal focuses on basic info updates as per PATCH requirements

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
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
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={isSubmitting}
              />
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
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="form-textarea"
              disabled={isSubmitting}
            />
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