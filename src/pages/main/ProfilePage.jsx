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
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: ''
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const { showSuccess, showError, showLoading, removeAlert } = useAlert();

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

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await ApiService.updatePassword(passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
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

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.current_password.trim()) {
      newErrors.current_password = 'Current password is required';
    }

    if (!passwordForm.new_password.trim()) {
      newErrors.new_password = 'New password is required';
    } else if (passwordForm.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }

    if (!passwordForm.confirm_password.trim()) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      showError('Please fix the errors in the form', 'Validation Error');
      return;
    }

    setSaving(true);
    const loadingAlertId = showLoading('Updating profile...', 'Saving');

    try {
      const updatedProfile = await updateProfile(profile);
      removeAlert(loadingAlertId);
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
      removeAlert(loadingAlertId);
      
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      showError('Please fix the errors in the form', 'Validation Error');
      return;
    }

    setSaving(true);
    const loadingAlertId = showLoading('Changing password...', 'Processing');

    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      
      removeAlert(loadingAlertId);
      showSuccess('Password changed successfully!', 'Password Updated');
      
      // Reset password form
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setPasswordErrors({});
      
    } catch (error) {
      console.error('Error changing password:', error);
      removeAlert(loadingAlertId);
      
      if (error.response?.data?.error) {
        showError(error.response.data.error, 'Password Change Failed', { duration: 5000 });
      } else if (error.response?.data?.current_password) {
        showError('Current password is incorrect', 'Authentication Failed', { duration: 5000 });
      } else {
        showError('Failed to change password. Please try again.', 'Update Failed', { duration: 5000 });
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
              
              <div id="profile-page">
                <div id="profile-container">
                  {/* Profile Header */}
                  <div id="profile-header">
                    <div id="profile-header-content">
                      <h1 id="profile-title">Profile Settings</h1>
                      <p id="profile-subtitle">Manage your personal information and account settings</p>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div id="profile-content">
                    {loading ? (
                      <div id="profile-loading">
                        <div id="profile-loading-spinner"></div>
                        <p>Loading profile...</p>
                      </div>
                    ) : (
                      <>
                        {/* Sidebar */}
                        <div id="profile-sidebar">
                          <div id="profile-user-card">
                            <div id="profile-user-avatar">
                              <div id="profile-avatar-initials">{getInitials()}</div>
                            </div>
                            <div id="profile-user-info">
                              <h3 id="profile-user-name">{getFullName()}</h3>
                              <p id="profile-user-email">{profile.email}</p>
                            </div>
                            <div id="profile-user-stats">
                              <div className="profile-stat-item">
                                <span className="profile-stat-value">Admin</span>
                                <span className="profile-stat-label">Role</span>
                              </div>
                              <div className="profile-stat-item">
                                <span className="profile-stat-value active">Active</span>
                                <span className="profile-stat-label">Status</span>
                              </div>
                            </div>
                          </div>

                          {/* Navigation Tabs */}
                          <div id="profile-tabs">
                            <button 
                              className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
                              onClick={() => setActiveTab('profile')}
                            >
                              <span className="profile-tab-icon">👤</span>
                              <span className="profile-tab-text">Personal Info</span>
                            </button>
                            <button 
                              className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
                              onClick={() => setActiveTab('security')}
                            >
                              <span className="profile-tab-icon">🔒</span>
                              <span className="profile-tab-text">Security</span>
                            </button>
                            <button 
                              className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
                              onClick={() => setActiveTab('preferences')}
                            >
                              <span className="profile-tab-icon">⚙️</span>
                              <span className="profile-tab-text">Preferences</span>
                            </button>
                          </div>

                          {/* Quick Stats */}
                          <div id="profile-quick-stats">
                            <div className="profile-quick-stat">
                              <div className="profile-quick-icon">📅</div>
                              <div>
                                <div className="profile-quick-value">Member since</div>
                                <div className="profile-quick-label">Jan 2024</div>
                              </div>
                            </div>
                            <div className="profile-quick-stat">
                              <div className="profile-quick-icon">🌍</div>
                              <div>
                                <div className="profile-quick-value">Timezone</div>
                                <div className="profile-quick-label">GMT+1</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Main Content Area */}
                        <div id="profile-main">
                          {/* Personal Info Tab */}
                          {activeTab === 'profile' && (
                            <div className="profile-tab-content">
                              <div className="profile-tab-header">
                                <h2>Personal Information</h2>
                                <p>Update your personal details and contact information</p>
                              </div>

                              <form onSubmit={handleProfileSubmit} id="profile-form">
                                <div className="profile-form-section">
                                  <h3>Basic Information</h3>
                                  
                                  <div className="profile-form-row">
                                    <div className="profile-form-group">
                                      <label htmlFor="profile-first-name" className="profile-form-label required">
                                        First Name
                                      </label>
                                      <input
                                        type="text"
                                        id="profile-first-name"
                                        name="first_name"
                                        value={profile.first_name}
                                        onChange={handleInputChange}
                                        className={`profile-form-input ${errors.first_name ? 'error' : ''}`}
                                        placeholder="Enter your first name"
                                        disabled={saving}
                                      />
                                      {errors.first_name && (
                                        <span className="profile-error-message">{errors.first_name}</span>
                                      )}
                                    </div>

                                    <div className="profile-form-group">
                                      <label htmlFor="profile-last-name" className="profile-form-label required">
                                        Last Name
                                      </label>
                                      <input
                                        type="text"
                                        id="profile-last-name"
                                        name="last_name"
                                        value={profile.last_name}
                                        onChange={handleInputChange}
                                        className={`profile-form-input ${errors.last_name ? 'error' : ''}`}
                                        placeholder="Enter your last name"
                                        disabled={saving}
                                      />
                                      {errors.last_name && (
                                        <span className="profile-error-message">{errors.last_name}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="profile-form-group">
                                    <label htmlFor="profile-email" className="profile-form-label required">
                                      Email Address
                                    </label>
                                    <input
                                      type="email"
                                      id="profile-email"
                                      name="email"
                                      value={profile.email}
                                      onChange={handleInputChange}
                                      className={`profile-form-input ${errors.email ? 'error' : ''}`}
                                      placeholder="Enter your email address"
                                      disabled={saving}
                                    />
                                    {errors.email && (
                                      <span className="profile-error-message">{errors.email}</span>
                                    )}
                                  </div>

                                  <div className="profile-form-row">
                                    <div className="profile-form-group">
                                      <label htmlFor="profile-phone" className="profile-form-label">
                                        Phone Number
                                      </label>
                                      <input
                                        type="tel"
                                        id="profile-phone"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleInputChange}
                                        className={`profile-form-input ${errors.phone ? 'error' : ''}`}
                                        placeholder="+1 (555) 123-4567"
                                        disabled={saving}
                                      />
                                      {errors.phone && (
                                        <span className="profile-error-message">{errors.phone}</span>
                                      )}
                                    </div>

                                    <div className="profile-form-group">
                                      <label htmlFor="profile-birth-date" className="profile-form-label">
                                        Birth Date
                                      </label>
                                      <input
                                        type="date"
                                        id="profile-birth-date"
                                        name="birth_date"
                                        value={formatDateForInput(profile.birth_date)}
                                        onChange={handleInputChange}
                                        className={`profile-form-input ${errors.birth_date ? 'error' : ''}`}
                                        disabled={saving}
                                      />
                                      {errors.birth_date && (
                                        <span className="profile-error-message">{errors.birth_date}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div id="profile-form-actions">
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
                                        <div className="profile-btn-spinner"></div>
                                        Saving Changes
                                      </>
                                    ) : (
                                      'Save Changes'
                                    )}
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}

                          {/* Security Tab */}
                          {activeTab === 'security' && (
                            <div className="profile-tab-content">
                              <div className="profile-tab-header">
                                <h2>Security Settings</h2>
                                <p>Manage your password and security preferences</p>
                              </div>

                              <form onSubmit={handlePasswordSubmit} id="profile-password-form">
                                <div className="profile-form-section">
                                  <h3>Change Password</h3>
                                  
                                  <div className="profile-form-group">
                                    <label htmlFor="profile-current-password" className="profile-form-label required">
                                      Current Password
                                    </label>
                                    <input
                                      type="password"
                                      id="profile-current-password"
                                      name="current_password"
                                      value={passwordForm.current_password}
                                      onChange={handlePasswordChange}
                                      className={`profile-form-input ${passwordErrors.current_password ? 'error' : ''}`}
                                      placeholder="Enter your current password"
                                      disabled={saving}
                                    />
                                    {passwordErrors.current_password && (
                                      <span className="profile-error-message">{passwordErrors.current_password}</span>
                                    )}
                                  </div>

                                  <div className="profile-form-row">
                                    <div className="profile-form-group">
                                      <label htmlFor="profile-new-password" className="profile-form-label required">
                                        New Password
                                      </label>
                                      <input
                                        type="password"
                                        id="profile-new-password"
                                        name="new_password"
                                        value={passwordForm.new_password}
                                        onChange={handlePasswordChange}
                                        className={`profile-form-input ${passwordErrors.new_password ? 'error' : ''}`}
                                        placeholder="Enter new password"
                                        disabled={saving}
                                      />
                                      {passwordErrors.new_password && (
                                        <span className="profile-error-message">{passwordErrors.new_password}</span>
                                      )}
                                    </div>

                                    <div className="profile-form-group">
                                      <label htmlFor="profile-confirm-password" className="profile-form-label required">
                                        Confirm Password
                                      </label>
                                      <input
                                        type="password"
                                        id="profile-confirm-password"
                                        name="confirm_password"
                                        value={passwordForm.confirm_password}
                                        onChange={handlePasswordChange}
                                        className={`profile-form-input ${passwordErrors.confirm_password ? 'error' : ''}`}
                                        placeholder="Confirm new password"
                                        disabled={saving}
                                      />
                                      {passwordErrors.confirm_password && (
                                        <span className="profile-error-message">{passwordErrors.confirm_password}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="profile-password-rules">
                                    <h4>Password Requirements</h4>
                                    <ul>
                                      <li>At least 8 characters long</li>
                                      <li>Contains uppercase and lowercase letters</li>
                                      <li>Includes at least one number</li>
                                      <li>Includes at least one special character</li>
                                    </ul>
                                  </div>
                                </div>

                                <div id="profile-form-actions">
                                  <button
                                    type="button"
                                    className="profile-btn-secondary"
                                    onClick={() => {
                                      setPasswordForm({
                                        current_password: '',
                                        new_password: '',
                                        confirm_password: ''
                                      });
                                      setPasswordErrors({});
                                    }}
                                    disabled={saving}
                                  >
                                    Clear
                                  </button>
                                  <button
                                    type="submit"
                                    className="profile-btn-primary"
                                    disabled={saving}
                                  >
                                    {saving ? (
                                      <>
                                        <div className="profile-btn-spinner"></div>
                                        Updating Password
                                      </>
                                    ) : (
                                      'Update Password'
                                    )}
                                  </button>
                                </div>
                              </form>

                              <div className="profile-security-section">
                                <h3>Security Sessions</h3>
                                <div className="profile-session-list">
                                  <div className="profile-session-item active">
                                    <div className="profile-session-info">
                                      <div className="profile-session-device">
                                        <span className="profile-session-icon">💻</span>
                                        <div>
                                          <div className="profile-session-name">MacBook Pro</div>
                                          <div className="profile-session-details">Chrome • Lagos, NG</div>
                                        </div>
                                      </div>
                                      <span className="profile-session-status active">Current Session</span>
                                    </div>
                                    <button className="profile-session-action">Sign Out</button>
                                  </div>
                                  <div className="profile-session-item">
                                    <div className="profile-session-info">
                                      <div className="profile-session-device">
                                        <span className="profile-session-icon">📱</span>
                                        <div>
                                          <div className="profile-session-name">iPhone 14</div>
                                          <div className="profile-session-details">Safari • Abuja, NG</div>
                                        </div>
                                      </div>
                                      <span className="profile-session-status">Active 2 days ago</span>
                                    </div>
                                    <button className="profile-session-action">Sign Out</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Preferences Tab */}
                          {activeTab === 'preferences' && (
                            <div className="profile-tab-content">
                              <div className="profile-tab-header">
                                <h2>Preferences</h2>
                                <p>Customize your account settings and preferences</p>
                              </div>

                              <div className="profile-preferences-section">
                                <h3>Notification Settings</h3>
                                
                                <div className="profile-preference-item">
                                  <div className="profile-preference-info">
                                    <div className="profile-preference-title">Email Notifications</div>
                                    <div className="profile-preference-description">Receive email updates about your account activity</div>
                                  </div>
                                  <label className="profile-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="profile-slider"></span>
                                  </label>
                                </div>

                                <div className="profile-preference-item">
                                  <div className="profile-preference-info">
                                    <div className="profile-preference-title">Push Notifications</div>
                                    <div className="profile-preference-description">Receive push notifications on your devices</div>
                                  </div>
                                  <label className="profile-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="profile-slider"></span>
                                  </label>
                                </div>

                                <div className="profile-preference-item">
                                  <div className="profile-preference-info">
                                    <div className="profile-preference-title">Marketing Emails</div>
                                    <div className="profile-preference-description">Receive promotional emails and updates</div>
                                  </div>
                                  <label className="profile-switch">
                                    <input type="checkbox" />
                                    <span className="profile-slider"></span>
                                  </label>
                                </div>
                              </div>

                              <div className="profile-preferences-section">
                                <h3>Display Settings</h3>
                                
                                <div className="profile-form-group">
                                  <label className="profile-form-label">Theme</label>
                                  <div className="profile-theme-selector">
                                    <button className="profile-theme-option active">
                                      <div className="profile-theme-preview light"></div>
                                      <span>Light</span>
                                    </button>
                                    <button className="profile-theme-option">
                                      <div className="profile-theme-preview dark"></div>
                                      <span>Dark</span>
                                    </button>
                                    <button className="profile-theme-option">
                                      <div className="profile-theme-preview auto"></div>
                                      <span>Auto</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="profile-form-group">
                                  <label className="profile-form-label">Language</label>
                                  <select className="profile-form-input">
                                    <option>English (US)</option>
                                    <option>French</option>
                                    <option>Spanish</option>
                                    <option>German</option>
                                  </select>
                                </div>

                                <div className="profile-form-group">
                                  <label className="profile-form-label">Timezone</label>
                                  <select className="profile-form-input">
                                    <option>GMT+1 (West Africa Time)</option>
                                    <option>GMT (London)</option>
                                    <option>GMT-5 (New York)</option>
                                    <option>GMT+8 (Singapore)</option>
                                  </select>
                                </div>
                              </div>

                              <div id="profile-form-actions">
                                <button className="profile-btn-primary">Save Preferences</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
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
