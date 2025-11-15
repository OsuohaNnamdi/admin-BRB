// components/CategoryForm.js
import React, { useState } from 'react';
import '../../styles/CategoryForm.css';

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return false;
    }
    if (!formData.slug.trim()) {
      alert('Please enter a slug or generate one');
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
      console.log('Category Data:', formData);
      alert('Category created successfully!');
      // Reset form
      setFormData({ name: '', slug: '' });
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All data will be lost.')) {
      setFormData({ name: '', slug: '' });
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
                />
                <button
                  type="button"
                  className="category-generate-btn"
                  onClick={generateSlug}
                  disabled={!formData.name}
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
            Cancel
          </button>
          <button 
            type="submit" 
            className="category-btn-primary"
            disabled={isSubmitting}
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