// component/DeliveryPriceModal.js
import React, { useState, useEffect } from 'react';
import '../../styles/DeliveryPriceModal.css';
import { useAlert } from '../../context/alert/AlertContext';

const DeliveryPriceModal = ({ isOpen, onClose, onSubmit, deliveryPrice }) => {
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    country: 'NG',
    price: '',
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useAlert();

  useEffect(() => {
    if (deliveryPrice) {
      setFormData({
        city: deliveryPrice.city || '',
        state: deliveryPrice.state || '',
        country: deliveryPrice.country || 'NG',
        price: deliveryPrice.price || '',
        is_active: deliveryPrice.is_active !== undefined ? deliveryPrice.is_active : true
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
  }, [deliveryPrice, isOpen]);

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
    if (!formData.country.trim() || formData.country.length !== 2) {
      showError('Please enter a valid 2-letter country code', 'Validation Error');
      return false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      showError('Please enter a valid price', 'Validation Error');
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
      onClose();
    } catch (error) {
      console.error('Error in modal submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delivery-price-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{deliveryPrice ? 'Edit Delivery Price' : 'Add Delivery Price'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="modal-city" className="required">City</label>
              <input
                type="text"
                id="modal-city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-state" className="required">State</label>
              <input
                type="text"
                id="modal-state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter state"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-country" className="required">Country Code</label>
              <input
                type="text"
                id="modal-country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="NG"
                maxLength={2}
                minLength={2}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-price" className="required">Price</label>
              <div className="price-input-group">
                <span className="currency-symbol">₦</span>
                <input
                  type="number"
                  id="modal-price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group toggle-group">
              <label htmlFor="modal-is_active">Active Status</label>
              <div className="toggle-wrapper">
                <input
                  type="checkbox"
                  id="modal-is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <label htmlFor="modal-is_active" className="toggle-label">
                  {formData.is_active ? 'Active' : 'Inactive'}
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
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
                  <span className="spinner"></span>
                  {deliveryPrice ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                deliveryPrice ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryPriceModal;