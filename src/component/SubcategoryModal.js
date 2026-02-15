import React, { useState, useEffect } from 'react';
import '../styles/CategoryModal.css'; // Fixed import path (added ../../)
import ApiService from '../config/ApiService'; // Fixed import path

const SubcategoryModal = ({ isOpen, onClose, onSubmit, subcategory }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: ''
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name || '',
        slug: subcategory.slug || '',
        category_id: subcategory.category?.id || subcategory.category_id || ''
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        category_id: ''
      });
    }
  }, [subcategory, isOpen]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await ApiService.getAdminCategories();
      const categoriesData = response.data.categories || response.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        category_id: formData.category_id
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="category-modal">
        <div className="modal-header">
          <h2>{subcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label required">Parent Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="form-select"
              required
              disabled={isSubmitting || loadingCategories || !!subcategory} // Fixed: added !! for boolean conversion
            >
              <option value="">Select a parent category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {loadingCategories && (
              <div className="loading-indicator">
                <span className="spinner-small"></span>
                <span>Loading categories...</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label required">Subcategory Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter subcategory name"
              className="form-input"
              maxLength={60}
              required
              disabled={isSubmitting}
            />
            <div className="field-counter">
              <span>{formData.name.length} / 60</span>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label required">Subcategory Slug</label>
            <div className="slug-group">
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="subcategory-slug-url"
                className="form-input"
                maxLength={60}
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="generate-slug-btn"
                onClick={generateSlug}
                disabled={!formData.name || isSubmitting}
              >
                Generate
              </button>
            </div>
            <p className="helper-text">
              URL-friendly version. Use lowercase letters, numbers, and hyphens only.
            </p>
            <div className="field-counter">
              <span>{formData.slug.length} / 60</span>
            </div>
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
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  {subcategory ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                subcategory ? 'Update Subcategory' : 'Create Subcategory'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubcategoryModal;