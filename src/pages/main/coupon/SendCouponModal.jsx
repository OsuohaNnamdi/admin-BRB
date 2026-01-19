// component/coupon/SendCouponModal.js
import React, { useState, useEffect } from 'react';
// import '../../../styles/CouponListSendCouponModal.css';

const SendCouponModal = ({ isOpen, onClose, onSubmit, coupons, selectedCoupon }) => {
  const [formData, setFormData] = useState({
    coupon_id: '',
    emails: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailList, setEmailList] = useState([]);

  useEffect(() => {
    if (selectedCoupon) {
      setFormData(prev => ({
        ...prev,
        coupon_id: selectedCoupon.id
      }));
    } else if (coupons.length > 0) {
      setFormData(prev => ({
        ...prev,
        coupon_id: coupons[0].id
      }));
    }
  }, [selectedCoupon, coupons]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.coupon_id) {
      newErrors.coupon_id = 'Please select a coupon';
    }
    
    if (!formData.emails.trim()) {
      newErrors.emails = 'Please enter at least one email address';
    } else {
      const emails = formData.emails.split(/[\n,]/).map(email => email.trim()).filter(email => email);
      const invalidEmails = emails.filter(email => !isValidEmail(email));
      
      if (emails.length === 0) {
        newErrors.emails = 'Please enter at least one valid email address';
      } else if (invalidEmails.length > 0) {
        newErrors.emails = `Invalid email addresses: ${invalidEmails.join(', ')}`;
      }
    }
    
    return newErrors;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'emails') {
      const emails = value.split(/[\n,]/).map(email => email.trim()).filter(email => email);
      setEmailList(emails);
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
      const emails = formData.emails.split(/[\n,]/).map(email => email.trim()).filter(email => email);
      await onSubmit(formData.coupon_id, emails);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedCoupon = () => {
    return coupons.find(c => c.id === parseInt(formData.coupon_id));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="send-coupon-modal">
        <div className="modal-header">
          <h3>Send Coupon to Customers</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="coupon-selector">
              <label className="form-label required">
                Select Coupon
                <select
                  name="coupon_id"
                  value={formData.coupon_id}
                  onChange={handleChange}
                  className={`form-select ${errors.coupon_id ? 'error' : ''}`}
                >
                  <option value="">Choose a coupon...</option>
                  {coupons.map(coupon => (
                    <option key={coupon.id} value={coupon.id}>
                      {coupon.code} - {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₦${coupon.discount_value}`} OFF
                    </option>
                  ))}
                </select>
              </label>
              {errors.coupon_id && <span className="error-text">{errors.coupon_id}</span>}
              
              {formData.coupon_id && (
                <div className="coupon-details">
                  <h4>Selected Coupon Details:</h4>
                  <div className="coupon-info">
                    <div><strong>Code:</strong> {getSelectedCoupon()?.code}</div>
                    <div><strong>Discount:</strong> {getSelectedCoupon()?.discount_type === 'percentage' 
                      ? `${getSelectedCoupon()?.discount_value}% OFF`
                      : `₦${getSelectedCoupon()?.discount_value} OFF`}
                    </div>
                    <div><strong>Validity:</strong> {new Date(getSelectedCoupon()?.valid_from).toLocaleDateString()} - {new Date(getSelectedCoupon()?.valid_to).toLocaleDateString()}</div>
                    <div><strong>Usage:</strong> {getSelectedCoupon()?.used_count || 0} / {getSelectedCoupon()?.usage_limit || '∞'}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="email-input-section">
              <label className="form-label required">
                Email Addresses
                <textarea
                  name="emails"
                  value={formData.emails}
                  onChange={handleChange}
                  className={`form-textarea ${errors.emails ? 'error' : ''}`}
                  placeholder="Enter email addresses separated by commas or new lines
example1@email.com
example2@email.com
example3@email.com"
                  rows="6"
                />
              </label>
              {errors.emails && <span className="error-text">{errors.emails}</span>}
              <div className="helper-text">
                You can enter multiple email addresses separated by commas or put each on a new line
              </div>
              
              {emailList.length > 0 && (
                <div className="email-preview">
                  <h4>Will send to ({emailList.length}) emails:</h4>
                  <div className="email-list">
                    {emailList.map((email, index) => (
                      <div key={index} className="email-item">
                        <span className={`email-status ${isValidEmail(email) ? 'valid' : 'invalid'}`}>
                          {isValidEmail(email) ? '✓' : '✗'}
                        </span>
                        <span className="email-address">{email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="send-options">
              <h4>Send Options</h4>
              <div className="options-grid">
                <div className="option-item">
                  <input type="checkbox" id="include_details" defaultChecked />
                  <label htmlFor="include_details">Include coupon details in email</label>
                </div>
                <div className="option-item">
                  <input type="checkbox" id="personalize" defaultChecked />
                  <label htmlFor="personalize">Personalize email with recipient name</label>
                </div>
                <div className="option-item">
                  <input type="checkbox" id="send_copy" />
                  <label htmlFor="send_copy">Send a copy to admin</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <div className="footer-info">
              <p>This will send the selected coupon code to all specified email addresses.</p>
            </div>
            <div className="footer-actions">
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
                    Sending...
                  </>
                ) : (
                  `Send to ${emailList.length} ${emailList.length === 1 ? 'recipient' : 'recipients'}`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendCouponModal;