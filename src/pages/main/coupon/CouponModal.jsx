// component/coupon/CouponModal.js
import React, { useState, useEffect } from 'react';
import '../../../styles/CouponModal.css';


const CouponModal = ({ isOpen, onClose, onSubmit, coupon }) => {
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    active: true,
    valid_from: '',
    valid_to: '',
    usage_limit: '',
    min_order_amount: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        discount_type: coupon.discount_type || 'percent',
        discount_value: coupon.discount_value || '',
        active: coupon.active !== undefined ? coupon.active : true,
        valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 16) : '',
        valid_to: coupon.valid_to ? coupon.valid_to.slice(0, 16) : '',
        usage_limit: coupon.usage_limit || '',
        min_order_amount: coupon.min_order_amount || '',
        description: coupon.description || ''
      });
    } else {
      // Set default future dates
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      setFormData({
        code: '',
        discount_type: 'percent',
        discount_value: '',
        active: true,
        valid_from: now.toISOString().slice(0, 16),
        valid_to: nextMonth.toISOString().slice(0, 16),
        usage_limit: '',
        min_order_amount: '',
        description: ''
      });
    }
    setErrors({});
  }, [coupon]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Coupon code must be at least 3 characters';
    }
    
    if (!formData.discount_value) {
      newErrors.discount_value = 'Discount value is required';
    } else if (formData.discount_type === 'percent') {
      const value = parseFloat(formData.discount_value);
      if (isNaN(value) || value <= 0 || value > 100) {
        newErrors.discount_value = 'percent must be between 1 and 100';
      }
    } else if (formData.discount_type === 'fixed') {
      const value = parseFloat(formData.discount_value);
      if (isNaN(value) || value <= 0) {
        newErrors.discount_value = 'Fixed amount must be greater than 0';
      }
    }
    
    if (!formData.valid_from) {
      newErrors.valid_from = 'Valid from date is required';
    }
    
    if (!formData.valid_to) {
      newErrors.valid_to = 'Valid to date is required';
    } else if (new Date(formData.valid_to) <= new Date(formData.valid_from)) {
      newErrors.valid_to = 'Valid to date must be after valid from date';
    }
    
    if (formData.usage_limit && parseInt(formData.usage_limit) <= 0) {
      newErrors.usage_limit = 'Usage limit must be greater than 0';
    }
    
    if (formData.min_order_amount && parseFloat(formData.min_order_amount) < 0) {
      newErrors.min_order_amount = 'Minimum order amount cannot be negative';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format dates for API
      const submitData = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="coupon-modal">
        <div className="modal-header">
          <h3>{coupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Left Column */}
              <div className="form-column">
                <div className="form-group">
                  <label className="form-label required">
                    Coupon Code
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className={`form-input ${errors.code ? 'error' : ''}`}
                      placeholder="e.g., SUMMER2024"
                      maxLength="50"
                    />
                  </label>
                  {errors.code && <span className="error-text">{errors.code}</span>}
                  <div className="helper-text">
                    Unique code customers will enter at checkout
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Optional description for internal use"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label required">Discount Type</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="discount_type"
                        value="percent"
                        checked={formData.discount_type === 'percent'}
                        onChange={handleChange}
                      />
                      <span>Percentage (%)</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="discount_type"
                        value="fixed"
                        checked={formData.discount_type === 'fixed'}
                        onChange={handleChange}
                      />
                      <span>Fixed Amount (₦)</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label required">
                    Discount Value
                    <input
                      type="number"
                      name="discount_value"
                      value={formData.discount_value}
                      onChange={handleChange}
                      className={`form-input ${errors.discount_value ? 'error' : ''}`}
                      placeholder={formData.discount_type === 'percent' ? 'e.g., 20' : 'e.g., 50'}
                      min="0"
                      step={formData.discount_type === 'percent' ? '0.1' : '0.01'}
                    />
                  </label>
                  {errors.discount_value && <span className="error-text">{errors.discount_value}</span>}
                </div>
              </div>
              
              {/* Right Column */}
              <div className="form-column">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">
                      Valid From
                      <input
                        type="datetime-local"
                        name="valid_from"
                        value={formData.valid_from}
                        onChange={handleChange}
                        className={`form-input ${errors.valid_from ? 'error' : ''}`}
                      />
                    </label>
                    {errors.valid_from && <span className="error-text">{errors.valid_from}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label required">
                      Valid To
                      <input
                        type="datetime-local"
                        name="valid_to"
                        value={formData.valid_to}
                        onChange={handleChange}
                        className={`form-input ${errors.valid_to ? 'error' : ''}`}
                      />
                    </label>
                    {errors.valid_to && <span className="error-text">{errors.valid_to}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Usage Limit
                      <input
                        type="number"
                        name="usage_limit"
                        value={formData.usage_limit}
                        onChange={handleChange}
                        className={`form-input ${errors.usage_limit ? 'error' : ''}`}
                        placeholder="e.g., 100 (leave empty for unlimited)"
                        min="1"
                      />
                    </label>
                    {errors.usage_limit && <span className="error-text">{errors.usage_limit}</span>}
                    <div className="helper-text">Leave empty for unlimited usage</div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Minimum Order Amount (₦)
                      <input
                        type="number"
                        name="min_order_amount"
                        value={formData.min_order_amount}
                        onChange={handleChange}
                        className={`form-input ${errors.min_order_amount ? 'error' : ''}`}
                        placeholder="e.g., 50"
                        min="0"
                        step="0.01"
                      />
                    </label>
                    {errors.min_order_amount && <span className="error-text">{errors.min_order_amount}</span>}
                    <div className="helper-text">Leave empty for no minimum</div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                    />
                    <span>Active (coupon can be used)</span>
                  </label>
                  <div className="helper-text">
                    Deactivate to temporarily disable this coupon
                  </div>
                </div>
                
                <div className="coupon-preview">
                  <h4>Preview</h4>
                  <div className="preview-card">
                    <div className="preview-code">{formData.code || 'COUPONCODE'}</div>
                    <div className="preview-discount">
                      {formData.discount_type === 'percent' 
                        ? `${formData.discount_value || '0'}% OFF` 
                        : `₦${formData.discount_value || '0'} OFF`
                      }
                    </div>
                    <div className="preview-dates">
                      {formData.valid_from && formData.valid_to ? (
                        `Valid: ${new Date(formData.valid_from).toLocaleDateString()} - ${new Date(formData.valid_to).toLocaleDateString()}`
                      ) : 'Set validity dates'}
                    </div>
                    {formData.min_order_amount && (
                      <div className="preview-min-order">
                        Min. order: ₦{formData.min_order_amount}
                      </div>
                    )}
                  </div>
                </div>
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
                  {coupon ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                coupon ? 'Update Coupon' : 'Create Coupon'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponModal;