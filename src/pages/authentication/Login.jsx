// components/auth/Login.jsx
import React, { useState } from 'react';
import '../../styles/Auth.css';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../config/ApiService';
import { useAlert } from '../../context/alert/AlertContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepSignedIn: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Destructure ALL the alert functions you're using
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    showLoading, 
    removeAlert 
  } = useAlert();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let loadingAlertId = null;
    
    try {
      console.log('Login attempt:', formData);
      
      // Show loading alert
      loadingAlertId = showLoading('Authenticating your credentials...', 'Signing In');
      
      const response = await ApiService.adminLogin({
        email: formData.email,
        password: formData.password
      });

      console.log('Login successful:', response.data);
      
      // Remove loading alert and show success
      if (loadingAlertId) removeAlert(loadingAlertId);
      showSuccess('Welcome back! Redirecting to dashboard...', 'Login Successful');
      
      // Redirect to admin dashboard on successful login
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      console.error('Login failed:', error);
      
      // Remove loading alert if it exists
      if (loadingAlertId) removeAlert(loadingAlertId);
      
      // Handle different error scenarios with appropriate alert types
      if (error.response?.data?.error) {
        showError(
          error.response.data.error, 
          'Authentication Failed',
          { duration: 6000 }
        );
      } else if (error.response?.status === 401) {
        showError(
          'The email or password you entered is incorrect. Please try again.',
          'Invalid Credentials',
          { duration: 5000 }
        );
      } else if (error.response?.status === 403) {
        showError(
          'You do not have administrator privileges to access this system.',
          'Access Denied',
          { duration: 6000 }
        );
      } else if (error.response?.status === 422) {
        showError(
          'Please check your email and password format.',
          'Validation Error',
          { duration: 5000 }
        );
      } else if (error.response?.status === 429) {
        showWarning(
          'Too many login attempts. Please wait a few minutes before trying again.',
          'Rate Limit Exceeded',
          { duration: 8000 }
        );
      } else if (error.message === 'Network Error') {
        showError(
          'Unable to connect to the server. Please check your internet connection and try again.',
          'Connection Error',
          { duration: 6000 }
        );
      } else if (error.response?.status >= 500) {
        showError(
          'Our servers are currently experiencing issues. Please try again in a few moments.',
          'Server Error',
          { duration: 6000 }
        );
      } else {
        showError(
          'An unexpected error occurred. Please try again or contact support if the problem persists.',
          'Login Failed',
          { duration: 5000 }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    showInfo(
      'Please contact your system administrator to reset your password.',
      'Password Reset',
      { duration: 6000 }
    );
    // navigate('/forgot-password');
  };

  const handleRegister = () => {
    showInfo(
      'Administrator accounts can only be created by existing administrators. Please contact your system administrator.',
      'Account Registration',
      { duration: 6000 }
    );
    // navigate('/register');
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'test@test.com',
      password: '12345678',
      keepSignedIn: false
    });
    showInfo('Demo credentials filled. You can now try logging in.', 'Demo Mode', { duration: 4000 });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Login to account</h1>
        <p className="auth-subtitle">Enter your email & password to login</p>
        
        {/* Demo credentials button */}
        <button 
          type="button" 
          className="demo-button"
          onClick={fillDemoCredentials}
          disabled={isLoading}
          style={{
            background: 'transparent',
            border: '1px dashed #6366f1',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#6366f1',
            marginBottom: '20px',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#6366f1';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#6366f1';
          }}
        >
          🚀 Fill Demo Credentials
        </button>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="form-input"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="form-input password-input"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.5 : 1 }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="keepSignedIn"
                checked={formData.keepSignedIn}
                onChange={handleChange}
                className="checkbox-input"
                disabled={isLoading}
              />
              <span className="checkbox-checkmark"></span>
              <span style={{ opacity: isLoading ? 0.6 : 1 }}>Keep me signed in</span>
            </label>
            <button 
              type="button" 
              className="forgot-link"
              onClick={handleForgotPassword}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.5 : 1 }}
            >
              Forgot password?
            </button>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.8 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></span>
                Signing In...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p style={{ opacity: isLoading ? 0.6 : 1 }}>
            You don't have an account yet?{' '}
            <button 
              className="auth-link" 
              onClick={handleRegister}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.5 : 1 }}
            >
              Register Now
            </button>
          </p>
          <p className="copyright" style={{ opacity: isLoading ? 0.6 : 1 }}>
            Secure Admin Access • v2.0
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;