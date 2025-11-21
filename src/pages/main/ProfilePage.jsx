import React, { useState, useEffect } from 'react';
import '../../styles/ProfilePage.css';
import Header from './Header';
import Sidebar from './Sidebar';
import SettingsPanel from '../../component/SettingsPanel';
import ApiService from '../../config/ApiService';
import { useAlert } from '../../context/alert/AlertContext';

const ProfilePage = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: ''
  });
  const [errors, setErrors] = useState({});
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getProfile();
  
      const profileData = response.data;
      console.log('Profile data received:', profileData);
      
      setProfile({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        birth_date: profileData.birth_date || ''
      });
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError(
        'Failed to load profile. Please try again.',
        'Load Error',
        { duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  };

  // Update profile - matches API requirements exactly
  const updateProfile = async (profileData) => {
    try {
      console.log('Updating profile with data:', profileData);
      
      // Prepare the data exactly as the API expects
      const updateData = {
        first_name: profileData.first_name.trim(),
        last_name: profileData.last_name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone ? profileData.phone.trim() : '',
        birth_date: profileData.birth_date || null
      };

      // Remove empty strings and set to null if required by API
      if (updateData.phone === '') {
        updateData.phone = null;
      }
      if (updateData.birth_date === '') {
        updateData.birth_date = null;
      }

      console.log('Sending to API:', updateData);
      
      const response = await ApiService.updateProfile(updateData);
      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profile.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!profile.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (profile.phone && !/^\+?[\d\s-()]+$/.test(profile.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (profile.birth_date) {
      const birthDate = new Date(profile.birth_date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = 'Birth date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors in the form', 'Validation Error');
      return;
    }

    setSaving(true);
    const loadingAlertId = showLoading('Updating profile...', 'Saving');

    try {
      const updatedProfile = await updateProfile(profile);
      removeAlert(loadingAlertId);
      showSuccess('Profile updated successfully!', 'Profile Saved');
      
      // Update local state with the response data
      if (updatedProfile) {
        setProfile({
          first_name: updatedProfile.first_name || '',
          last_name: updatedProfile.last_name || '',
          email: updatedProfile.email || '',
          phone: updatedProfile.phone || '',
          birth_date: updatedProfile.birth_date || ''
        });
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      removeAlert(loadingAlertId);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        let errorMessage = 'Failed to update profile. ';
        
        // Format backend errors
        if (typeof backendErrors === 'object') {
          Object.keys(backendErrors).forEach(key => {
            if (Array.isArray(backendErrors[key])) {
              errorMessage += `${key}: ${backendErrors[key].join(', ')} `;
            } else if (typeof backendErrors[key] === 'string') {
              errorMessage += `${backendErrors[key]} `;
            } else {
              errorMessage += `${key}: ${JSON.stringify(backendErrors[key])} `;
            }
          });
        } else if (typeof backendErrors === 'string') {
          errorMessage = backendErrors;
        }
        
        showError(errorMessage.trim(), 'Update Failed', { duration: 6000 });
        
        // Set form errors if available
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
      } else if (error.response?.status === 400) {
        showError('Invalid profile data. Please check all fields.', 'Validation Error', { duration: 5000 });
      } else if (error.response?.status === 401) {
        showError('Authentication required. Please login again.', 'Session Expired', { duration: 5000 });
      } else if (error.response?.status === 403) {
        showError('You do not have permission to update this profile.', 'Access Denied', { duration: 5000 });
      } else if (error.response?.status === 404) {
        showError('Profile not found.', 'Not Found', { duration: 5000 });
      } else if (error.message === 'Network Error') {
        showError('Network error. Please check your connection.', 'Connection Error', { duration: 5000 });
      } else {
        showError('Failed to update profile. Please try again.', 'Update Failed', { duration: 5000 });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    fetchProfile();
    setErrors({});
  };

  const getInitials = () => {
    const first = profile.first_name?.charAt(0) || '';
    const last = profile.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getFullName = () => {
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Handle both ISO date strings and YYYY-MM-DD format
    return dateString.split('T')[0];
  };

  return (
    <div className="__variable_9eb1a5 body">
      <div className="menu-style"></div>
      <div className="layout-width"></div>
      
      <div id="wrapper">
        <div id="page">
          <div className="layout-wrap">
            <Sidebar 
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              onClose={closeSidebar}
            />
            <div className="section-content-right">
              <Header
                onToggleSidebar={toggleSidebar}
                onSettingsClick={() => setSettingsOpen(true)} 
              />
              
              <div className="profile-page-container">
                <div className="profile-page-header">
                  <div className="header-content">
                    <h1>Profile Settings</h1>
                    <p>Manage your personal information and account settings</p>
                  </div>
                </div>

                <div className="profile-content">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading profile...</p>
                    </div>
                  ) : (
                    <div className="profile-card">
                      {/* Profile Header */}
                      <div className="profile-header">
                        <div className="avatar-section">
                          <div className="profile-avatar">
                            <span className="avatar-initials">{getInitials()}</span>
                          </div>
                          <div className="avatar-info">
                            <h2>{getFullName()}</h2>
                            <p>{profile.email}</p>
                          </div>
                        </div>
                        <div className="profile-stats">
                          <div className="stat-item">
                            <span className="stat-value">Admin</span>
                            <span className="stat-label">Role</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">Active</span>
                            <span className="stat-label">Status</span>
                          </div>
                        </div>
                      </div>

                      {/* Profile Form */}
                      <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-section">
                          <h3>Personal Information</h3>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="first_name">First Name *</label>
                              <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={profile.first_name}
                                onChange={handleInputChange}
                                className={errors.first_name ? 'error' : ''}
                                placeholder="Enter your first name"
                                disabled={saving}
                              />
                              {errors.first_name && (
                                <span className="error-message">{errors.first_name}</span>
                              )}
                            </div>

                            <div className="form-group">
                              <label htmlFor="last_name">Last Name *</label>
                              <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={profile.last_name}
                                onChange={handleInputChange}
                                className={errors.last_name ? 'error' : ''}
                                placeholder="Enter your last name"
                                disabled={saving}
                              />
                              {errors.last_name && (
                                <span className="error-message">{errors.last_name}</span>
                              )}
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="email">Email Address *</label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={profile.email}
                                onChange={handleInputChange}
                                className={errors.email ? 'error' : ''}
                                placeholder="Enter your email address"
                                disabled={saving}
                              />
                              {errors.email && (
                                <span className="error-message">{errors.email}</span>
                              )}
                            </div>

                            <div className="form-group">
                              <label htmlFor="phone">Phone Number</label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={profile.phone}
                                onChange={handleInputChange}
                                className={errors.phone ? 'error' : ''}
                                placeholder="Enter your phone number"
                                disabled={saving}
                              />
                              {errors.phone && (
                                <span className="error-message">{errors.phone}</span>
                              )}
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="birth_date">Birth Date</label>
                            <input
                              type="date"
                              id="birth_date"
                              name="birth_date"
                              value={formatDateForInput(profile.birth_date)}
                              onChange={handleInputChange}
                              className={errors.birth_date ? 'error' : ''}
                              disabled={saving}
                            />
                            {errors.birth_date && (
                              <span className="error-message">{errors.birth_date}</span>
                            )}
                          </div>
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleCancel}
                            disabled={saving}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <div className="button-spinner"></div>
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              <div className="bottom-page">
                <div className="body-text">Copyright © 2025 Remos. Design with</div>
                <i className="icon-heart"></i>
                <div className="body-text">by <a href="https://themeforest.net/user/themesflat/404">Themesflat</a> All rights reserved.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default ProfilePage;