// component/BannerModal.js
import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/alert/AlertContext';
import '../../styles/BannerModal.css';

const BannerModal = ({ isOpen, onClose, onSubmit, banner }) => {
  const { showError } = useAlert();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    image: null,
    imagePreview: ''
  });
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (banner) {
      setIsEditMode(true);
      setFormData({
        title: banner.title || '',
        text: banner.text || '',
        image: null,
        imagePreview: banner.image_url || ''
      });
    } else {
      setIsEditMode(false);
      setFormData({
        title: '',
        text: '',
        image: null,
        imagePreview: ''
      });
    }
    setErrors({});
  }, [banner, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!isEditMode && !formData.image) {
      newErrors.image = 'Image is required for new banners';
    }
    
    if (formData.image && formData.image.size > 5 * 1024 * 1024) {
      newErrors.image = 'Image size must be less than 5MB';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: previewUrl
      }));
      
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors in the form.', 'Validation Error');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error in modal submit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="banner-modal">
        <div className="banner-modal-header">
          <h2>{isEditMode ? 'Edit Banner' : 'Add New Banner'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="banner-modal-form">
          <div className="banner-modal-content">
            {/* Image Upload Section */}
            <div className="banner-modal-section">
              <h3>Banner Image</h3>
              
              {formData.imagePreview ? (
                <div className="banner-image-preview-container">
                  <div className="banner-image-preview">
                    <img 
                      src={formData.imagePreview} 
                      alt="Banner Preview"
                      className="banner-preview-image"
                    />
                    <button 
                      type="button"
                      className="remove-image-btn"
                      onClick={removeImage}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`banner-drop-zone ${errors.image ? 'error' : ''}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="banner-file-input"
                    id="modal-banner-image"
                  />
                  <label htmlFor="modal-banner-image" className="banner-drop-zone-content">
                    <div className="banner-drop-zone-icon">📤</div>
                    <div className="banner-drop-zone-text">
                      {isEditMode ? 'Change Image' : 'Upload Banner Image'}
                    </div>
                    <div className="banner-drop-zone-subtext">
                      Click to browse or drag & drop
                    </div>
                  </label>
                </div>
              )}
              
              {errors.image && (
                <span className="error-message">{errors.image}</span>
              )}
              
              {isEditMode && !formData.imagePreview && (
                <p className="info-text">Current image will be preserved</p>
              )}
            </div>

            {/* Form Fields */}
            <div className="banner-modal-section">
              <h3>Banner Details</h3>
              
              <div className="form-group">
                <label htmlFor="modal-title" className="required">
                  Banner Title
                </label>
                <input
                  type="text"
                  id="modal-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={errors.title ? 'error' : ''}
                  placeholder="Enter banner title"
                  disabled={loading}
                />
                {errors.title && (
                  <span className="error-message">{errors.title}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="modal-text">
                  Banner Text
                </label>
                <textarea
                  id="modal-text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Enter promotional text"
                  rows="3"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Preview Section */}
            {formData.imagePreview && (
              <div className="banner-modal-section">
                <h3>Preview</h3>
                <div className="banner-preview-modal">
                  <img 
                    src={formData.imagePreview} 
                    alt="Preview"
                    className="preview-image"
                  />
                  {(formData.title || formData.text) && (
                    <div className="preview-overlay">
                      {formData.title && <h4>{formData.title}</h4>}
                      {formData.text && <p>{formData.text}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="banner-modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Create Banner'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerModal;