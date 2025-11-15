// components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import '../../styles/Auth.css';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = ({ onBack, onEmailSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">
          {isSubmitted 
            ? 'Check your email for reset instructions' 
            : 'Enter your email to receive a reset link'
          }
        </p>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="auth-button">Send Reset Link</button>
            
            <button 
              type="button" 
              className="back-button"
              onClick={handleBackToLogin}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>We've sent password reset instructions to your email.</p>
            <button 
              className="auth-button"
              onClick={handleBackToLogin}
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;