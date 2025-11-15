// components/auth/Login.jsx
import React, { useState } from 'react';
import '../../styles/Auth.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {

   const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepSignedIn: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Login to account</h1>
        <p className="auth-subtitle">Enter your email & password to login</p>
        
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
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
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
              />
              Keep me signed in
            </label>
            <button 
              type="button" 
              className="forgot-link"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-button">Login</button>
        </form>

        <div className="social-section">
          <p className="social-divider">Or continue with social account</p>
          <div className="social-buttons">
            <button className="social-button google-button">
              <span className="google-icon">G</span>
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>You don't have an account yet? <button className="auth-link" onClick={handleRegister}>Register Now</button></p>
          <p className="copyright">Copyright © 2024 Remos, All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;