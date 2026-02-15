import React, { useState, useEffect } from 'react';
import '../../styles/DeliveryPriceForm.css';
import { useAlert } from '../../context/alert/AlertContext';

const DeliveryPriceForm = ({ initialData, onSubmit, isSubmitting: externalIsSubmitting }) => {
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    country: 'NG',
    price: '',
    is_active: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showInfo } = useAlert();

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || 'NG',
        price: initialData.price || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.city.trim()) {
      showError('Please enter a city name', 'Validation Error');
      return false;
    }
    if (!formData.state.trim()) {
      showError('Please enter a state', 'Validation Error');
      return false;
    }
    if (!formData.country.trim()) {
      showError('Please enter a country code', 'Validation Error');
      return false;
    }
    if (!formData.price) {
      showError('Please enter a delivery price', 'Validation Error');
      return false;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      showError('Please enter a valid price (must be a positive number)', 'Validation Error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData({
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || 'NG',
        price: initialData.price || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      });
    } else {
      setFormData({
        city: '',
        state: '',
        country: 'NG',
        price: '',
        is_active: true
      });
    }
    showInfo('Form has been reset', 'Form Reset');
  };

  const loading = isSubmitting || externalIsSubmitting;

  return (
    <div className="delivery-price-form-container">
      <form onSubmit={handleSubmit} className="delivery-price-form">
        <div className="delivery-price-form-card">
          <div className="delivery-price-form-section">
            <h3>Location Information</h3>
            
            {/* City Field */}
            <div className="delivery-price-form-group">
              <label htmlFor="city" className="delivery-price-label required">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city name (e.g., Lagos, Abuja, Port Harcourt)"
                className="delivery-price-input"
                maxLength={100}
                required
                disabled={loading}
              />
              <div className="delivery-price-helper">
                <span className="delivery-price-helper-icon">📍</span>
                <p className="delivery-price-helper-text">
                  Enter the city name for this delivery price configuration.
                </p>
              </div>
            </div>

            {/* State Field */}
            <div className="delivery-price-form-group">
              <label htmlFor="state" className="delivery-price-label required">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter state (e.g., Lagos, FCT, Rivers)"
                className="delivery-price-input"
                maxLength={100}
                required
                disabled={loading}
              />
              <div className="delivery-price-helper">
                <span className="delivery-price-helper-icon">🗺️</span>
                <p className="delivery-price-helper-text">
                  Enter the state or region for this delivery price.
                </p>
              </div>
            </div>

            {/* Country Field */}
            <div className="delivery-price-form-group">
              <label htmlFor="country" className="delivery-price-label required">
                Country Code
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Enter country code (e.g., NG, US, UK)"
                className="delivery-price-input"
                maxLength={2}
                minLength={2}
                required
                disabled={loading}
              />
              <div className="delivery-price-helper">
                <span className="delivery-price-helper-icon">🌍</span>
                <p className="delivery-price-helper-text">
                  Enter the two-letter country code (ISO 3166-1 alpha-2 format).
                </p>
              </div>
            </div>
          </div>

          <div className="delivery-price-form-section">
            <h3>Pricing & Status</h3>
            
            {/* Price Field */}
            <div className="delivery-price-form-group">
              <label htmlFor="price" className="delivery-price-label required">
                Delivery Price
              </label>
              <div className="delivery-price-input-group">
                <span className="delivery-price-currency">₦</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="delivery-price-input with-currency"
                  step="0.01"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>
              <div className="delivery-price-helper">
                <span className="delivery-price-helper-icon">💰</span>
                <p className="delivery-price-helper-text">
                  Set the delivery fee for this location. Use positive numbers only.
                </p>
              </div>
            </div>

            {/* Active Status Toggle */}
            <div className="delivery-price-form-group">
              <label className="delivery-price-toggle-label">
                <span className="delivery-price-label">Active Status</span>
                <div className="delivery-price-toggle">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="is_active" className="delivery-price-toggle-switch">
                    <span className="delivery-price-toggle-slider"></span>
                  </label>
                </div>
              </label>
              <div className="delivery-price-helper">
                <span className="delivery-price-helper-icon">⚡</span>
                <p className="delivery-price-helper-text">
                  Toggle off to temporarily disable this delivery price without deleting it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="delivery-price-form-actions">
          <button 
            type="button" 
            className="delivery-price-btn-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
          <button 
            type="submit" 
            className="delivery-price-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="delivery-price-spinner"></span>
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialData ? 'Update Delivery Price' : 'Create Delivery Price'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryPriceForm;