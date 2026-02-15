import React, { useState, useEffect } from 'react';
import '../styles/CategoryModal.css';

const CategoryModal = ({ isOpen, onClose, onSubmit, category }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: null
      });
      if (category.image) {
        setImagePreview(category.image);
      }
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: null
      });
      setImagePreview(null);
    }
  }, [category, isOpen]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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
      // Create FormData for multipart/form-data if there's an image
      if (formData.image) {
        const submitData = new FormData();
        submitData.append('name', formData.name.trim());
        submitData.append('slug', formData.slug.trim());
        if (formData.description) {
          submitData.append('description', formData.description.trim());
        }
        if (formData.image) {
          submitData.append('image', formData.image);
        }
        await onSubmit(submitData);
      } else {
        // Send as regular JSON if no image
        await onSubmit({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim()
        });
      }
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
          <h2>{category ? 'Edit Category' : 'Add New Category'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label required">Category Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter category name"
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
            <label className="form-label required">Category Slug</label>
            <div className="slug-group">
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="category-slug-url"
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

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter category description (optional)"
              className="form-textarea"
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="field-counter">
              <span>{formData.description.length} / 500</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category Image</label>
            <div className="image-upload-container">
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="form-file-input"
                disabled={isSubmitting}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <p className="helper-text">
              Recommended size: 300x300px. Max size: 2MB.
            </p>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  {category ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                category ? 'Update Category' : 'Create Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;