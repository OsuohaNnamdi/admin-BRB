// admin/components/BannerForm.js
import React, { useState, useEffect } from 'react';
import ApiService from '../../config/ApiService';
import { useAlert } from '../../context/alert/AlertContext';
import { useNavigate, useParams } from 'react-router-dom';

const BannerForm = () => {
  const { bannerId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();
  
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
    if (bannerId) {
      setIsEditMode(true);
      fetchBannerDetails();
    }
  }, [bannerId]);

  const fetchBannerDetails = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getBanner(bannerId);
      const banner = response.data;
      
      setFormData({
        title: banner.title || '',
        text: banner.text || '',
        image: null,
        imagePreview: banner.image_url || ''
      });
    } catch (error) {
      console.error('Error fetching banner:', error);
      showError('Failed to load banner details.', 'Load Error');
      navigate('/admin/banners');
    } finally {
      setLoading(false);
    }
  };

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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' }));
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: previewUrl
      }));
      
      // Clear error
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
    
    try {
      setLoading(true);
      const loadingAlertId = showLoading(
        isEditMode ? 'Updating banner...' : 'Creating banner...',
        'Processing'
      );
      
      let result;
      if (isEditMode) {
        result = await updateBanner();
      } else {
        result = await createBanner();
      }
      
      removeAlert(loadingAlertId);
      showSuccess(
        isEditMode ? 'Banner updated successfully!' : 'Banner created successfully!',
        isEditMode ? 'Update Successful' : 'Create Successful'
      );
      
      navigate('/admin/banners');
      
    } catch (error) {
      console.error('Error saving banner:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        let errorMessage = 'Failed to save banner. ';
        
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            errorMessage += `${key}: ${backendErrors[key].join(', ')} `;
          } else {
            errorMessage += `${key}: ${backendErrors[key]} `;
          }
        });
        
        showError(errorMessage.trim(), 'Save Failed');
      } else {
        showError('Failed to save banner. Please try again.', 'Save Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('text', formData.text || '');
    formDataToSend.append('image', formData.image);
    
    return await ApiService.createBanner(formDataToSend);
  };

  const updateBanner = async () => {
    if (formData.image) {
      // If new image is selected, send FormData
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('text', formData.text || '');
      formDataToSend.append('image', formData.image);
      
      return await ApiService.updateBanner(bannerId, formDataToSend, true);
    } else {
      // If no new image, send JSON
      const updateData = {
        title: formData.title,
        text: formData.text || ''
      };
      
      return await ApiService.updateBanner(bannerId, updateData);
    }
  };

  const handleCancel = () => {
    navigate('/admin/banners');
  };

  if (loading && isEditMode) {
    return (
      <div className="banner-form-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading banner details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="banner-form-container">
      <div className="banner-form-header">
        <h1>{isEditMode ? 'Edit Banner' : 'Add New Banner'}</h1>
        <p>{isEditMode ? 'Update your promotional banner' : 'Create a new promotional banner for your store'}</p>
      </div>

      <form onSubmit={handleSubmit} className="banner-form">
        <div className="banner-form-grid">
          {/* Left Column - Image Upload */}
          <div className="banner-form-column">
            <div className="banner-form-card">
              <h3>Banner Image</h3>
              
              <div className="banner-form-group">
                <label className="banner-form-label required">
                  Banner Image
                </label>
                
                {formData.imagePreview ? (
                  <div className="banner-image-preview-container">
                    <div className="banner-image-preview">
                      <img 
                        src={formData.imagePreview} 
                        alt="Banner Preview"
                        className="banner-preview-image"
                      />
                      <div className="banner-image-actions">
                        <button 
                          type="button"
                          className="btn-danger"
                          onClick={removeImage}
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                    {!isEditMode && (
                      <p className="banner-helper-text">
                        Preview of selected image
                      </p>
                    )}
                  </div>
                ) : (
                  <div className={`banner-drop-zone ${errors.image ? 'error' : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="banner-file-input"
                      id="banner-image-upload"
                    />
                    <label htmlFor="banner-image-upload" className="banner-drop-zone-content">
                      <div className="banner-drop-zone-icon">📤</div>
                      <div className="banner-drop-zone-text">
                        {isEditMode ? 'Click to change banner image' : 'Upload Banner Image'}
                      </div>
                      <div className="banner-drop-zone-subtext">
                        Drag & drop or click to browse
                      </div>
                      <div className="banner-drop-zone-subtext">
                        Max size: 5MB • Formats: JPEG, PNG, GIF, WebP
                      </div>
                    </label>
                  </div>
                )}
                
                {errors.image && (
                  <span className="banner-error-text">{errors.image}</span>
                )}
                
                {isEditMode && !formData.imagePreview && (
                  <div className="banner-current-image-info">
                    <p>Current image will be preserved if no new image is selected.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="banner-form-column">
            <div className="banner-form-card">
              <h3>Banner Details</h3>
              
              <div className="banner-form-group">
                <label htmlFor="title" className="banner-form-label required">
                  Banner Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`banner-form-input ${errors.title ? 'error' : ''}`}
                  placeholder="Enter banner title (e.g., Summer Sale)"
                  disabled={loading}
                />
                {errors.title && (
                  <span className="banner-error-text">{errors.title}</span>
                )}
                <p className="banner-helper-text">
                  This title helps identify the banner in the admin panel
                </p>
              </div>

              <div className="banner-form-group">
                <label htmlFor="text" className="banner-form-label">
                  Banner Text
                </label>
                <textarea
                  id="text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  className="banner-form-textarea"
                  placeholder="Enter promotional text (e.g., Get 50% off on all products!)"
                  rows="4"
                  disabled={loading}
                />
                <p className="banner-helper-text">
                  Optional promotional text to display with the banner
                </p>
              </div>

              {/* Banner Preview (if image is selected) */}
              {formData.imagePreview && (
                <div className="banner-form-group">
                  <label className="banner-form-label">
                    Preview
                  </label>
                  <div className="banner-live-preview">
                    <div className="banner-preview-container">
                      <img 
                        src={formData.imagePreview} 
                        alt="Banner Preview"
                        className="banner-preview"
                      />
                      <div className="banner-preview-overlay">
                        <div className="banner-preview-text">
                          {formData.title && (
                            <h4 className="preview-title">{formData.title}</h4>
                          )}
                          {formData.text && (
                            <p className="preview-text">{formData.text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="banner-helper-text">
                      This is how your banner will appear on the website
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="banner-form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
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
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Update Banner' : 'Create Banner'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm;