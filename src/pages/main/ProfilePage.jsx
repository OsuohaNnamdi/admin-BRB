import React, { useState, useEffect, useCallback } from 'react';
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
  const { showSuccess, showError } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ApiService.getProfile();
      const profileData = response.data;
      
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
  }, [showError]);

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const updateData = {
        first_name: profileData.first_name.trim(),
        last_name: profileData.last_name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone ? profileData.phone.trim() : '',
        birth_date: profileData.birth_date || null
      };

      if (updateData.phone === '') {
        updateData.phone = null;
      }
      if (updateData.birth_date === '') {
        updateData.birth_date = null;
      }

      const response = await ApiService.updateProfile(updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfileForm = () => {
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
    
    if (!validateProfileForm()) {
      showError('Please fix the errors in the form', 'Validation Error');
      return;
    }

    setSaving(true);

    try {
      const updatedProfile = await updateProfile(profile);
      showSuccess('Profile updated successfully!', 'Profile Saved');
      
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
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        let errorMessage = 'Failed to update profile. ';
        
        if (typeof backendErrors === 'object') {
          Object.keys(backendErrors).forEach(key => {
            if (Array.isArray(backendErrors[key])) {
              errorMessage += `${key}: ${backendErrors[key].join(', ')} `;
            } else if (typeof backendErrors[key] === 'string') {
              errorMessage += `${backendErrors[key]} `;
            }
          });
        } else if (typeof backendErrors === 'string') {
          errorMessage = backendErrors;
        }
        
        showError(errorMessage.trim(), 'Update Failed', { duration: 6000 });
        
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
      } else {
        showError('Failed to update profile. Please try again.', 'Update Failed', { duration: 5000 });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
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
              
              <div className="profile-page">
                <div className="profile-container">
                  {/* Profile Header */}
                  <div className="profile-header">
                    <div className="profile-avatar">
                      <div className="profile-avatar-initials">{getInitials()}</div>
                    </div>
                    <div className="profile-header-info">
                      <h1 className="profile-title">{getFullName()}</h1>
                      <p className="profile-subtitle">{profile.email}</p>
                      <div className="profile-badge">Administrator</div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="profile-content">
                    {loading ? (
                      <div className="profile-loading">
                        <div className="profile-loading-spinner"></div>
                        <p>Loading profile...</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="profile-form">
                        <div className="profile-form-section">
                          <h3 className="profile-section-title">Personal Information</h3>
                          
                          <div className="profile-form-grid">
                            <div className="profile-form-group">
                              <label htmlFor="first_name" className="profile-label required">
                                First Name
                              </label>
                              <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={profile.first_name}
                                onChange={handleInputChange}
                                className={`profile-input ${errors.first_name ? 'error' : ''}`}
                                placeholder="Enter your first name"
                                disabled={saving}
                              />
                              {errors.first_name && (
                                <span className="profile-error">{errors.first_name}</span>
                              )}
                            </div>

                            <div className="profile-form-group">
                              <label htmlFor="last_name" className="profile-label required">
                                Last Name
                              </label>
                              <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={profile.last_name}
                                onChange={handleInputChange}
                                className={`profile-input ${errors.last_name ? 'error' : ''}`}
                                placeholder="Enter your last name"
                                disabled={saving}
                              />
                              {errors.last_name && (
                                <span className="profile-error">{errors.last_name}</span>
                              )}
                            </div>

                            <div className="profile-form-group full-width">
                              <label htmlFor="email" className="profile-label required">
                                Email Address
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={profile.email}
                                onChange={handleInputChange}
                                className={`profile-input ${errors.email ? 'error' : ''}`}
                                placeholder="Enter your email address"
                                disabled="true"
                              />
                              {errors.email && (
                                <span className="profile-error">{errors.email}</span>
                              )}
                            </div>

                            <div className="profile-form-group">
                              <label htmlFor="phone" className="profile-label">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={profile.phone}
                                onChange={handleInputChange}
                                className={`profile-input ${errors.phone ? 'error' : ''}`}
                                placeholder="+1 (555) 123-4567"
                                disabled={saving}
                              />
                              {errors.phone && (
                                <span className="profile-error">{errors.phone}</span>
                              )}
                            </div>

                            <div className="profile-form-group">
                              <label htmlFor="birth_date" className="profile-label">
                                Birth Date
                              </label>
                              <input
                                type="date"
                                id="birth_date"
                                name="birth_date"
                                value={formatDateForInput(profile.birth_date)}
                                onChange={handleInputChange}
                                className={`profile-input ${errors.birth_date ? 'error' : ''}`}
                                disabled={saving}
                              />
                              {errors.birth_date && (
                                <span className="profile-error">{errors.birth_date}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="profile-form-actions">
                          <button
                            type="button"
                            className="profile-btn-secondary"
                            onClick={handleCancel}
                            disabled={saving}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="profile-btn-primary"
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <span className="profile-btn-spinner"></span>
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
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