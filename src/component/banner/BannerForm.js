// admin/components/BannerForm.js
import React, { useState, useEffect, useCallback } from 'react';
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

  // ✅ FIX 1: useCallback for ESLint + stable reference
  const fetchBannerDetails = useCallback(async () => {
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
  }, [bannerId, navigate, showError]);

  // ✅ FIX 1: dependency array is now correct
  useEffect(() => {
    if (bannerId) {
      setIsEditMode(true);
      fetchBannerDetails();
    }
  }, [bannerId, fetchBannerDetails]);

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

  // ✅ FIX 3: Handle input change (keeping this one as it's likely used in your JSX)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ FIX 4: Handle image change (keeping this one as it's likely used in your JSX)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        image: 'Please select a valid image file (JPEG, PNG, GIF, WebP)'
      }));
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
  };

  // ✅ FIX 5: Remove image function (keeping this one as it's likely used in your JSX)
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

  const createBanner = async () => {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('text', formData.text || '');
    data.append('image', formData.image);

    return ApiService.createBanner(data);
  };

  const updateBanner = async () => {
    if (formData.image) {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('text', formData.text || '');
      data.append('image', formData.image);

      return ApiService.updateBanner(bannerId, data, true);
    }

    return ApiService.updateBanner(bannerId, {
      title: formData.title,
      text: formData.text || ''
    });
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

      if (isEditMode) {
        await updateBanner();
      } else {
        await createBanner();
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
      <div className="form-header">
        <h1>{isEditMode ? 'Edit Banner' : 'Create New Banner'}</h1>
        <p>{isEditMode ? 'Update banner details' : 'Add a new promotional banner'}</p>
      </div>

      <form onSubmit={handleSubmit} className="banner-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? 'error' : ''}
            placeholder="Enter banner title"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="text">Description</label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            rows="4"
            placeholder="Enter banner description (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Banner Image {!isEditMode && '*'}</label>
          
          {formData.imagePreview ? (
            <div className="image-preview-container">
              <img 
                src={formData.imagePreview} 
                alt="Preview" 
                className="image-preview"
              />
              <button 
                type="button" 
                onClick={removeImage}
                className="remove-image-btn"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div className="image-upload-area">
              <label htmlFor="image-upload" className="upload-label">
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  <p>Click to upload image</p>
                  <p className="upload-hint">PNG, JPG, GIF, WebP up to 5MB</p>
                </div>
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden-input"
              />
            </div>
          )}
          
          {errors.image && <span className="error-message">{errors.image}</span>}
          
          {isEditMode && formData.imagePreview && !formData.image && (
            <p className="info-text">
              Current image will be kept unless you upload a new one.
            </p>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleCancel}
            className="btn-secondary"
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
                <span className="loading-spinner-small"></span>
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
