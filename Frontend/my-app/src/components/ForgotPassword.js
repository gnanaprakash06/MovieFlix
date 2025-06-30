import React, { useState } from 'react';
import { validateEmail, validatePassword } from '../utils/validation';
import '../App.css';

const ForgotPassword = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setErrors(prev => ({
      ...prev,
      [name]: null
    }));
    setErrorMessage('');
  };

  const validateEmailForm = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    return newErrors;
  };

  const validateResetForm = () => {
    const newErrors = {};
    
    if (!formData.otp.trim()) newErrors.otp = 'OTP is required';
    
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    const newErrors = validateEmailForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      setSuccessMessage('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    const newErrors = validateResetForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      setSuccessMessage('Password reset successfully!');
      setTimeout(() => {
        onNavigate('signin');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {step === 1 ? (
        <form onSubmit={handleSendOTP} className="auth-form">
          <h2 className="auth-title">Forgot Password</h2>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="form-group">
            <input
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              value={formData.email}
              onChange={handleInputChange}
              placeholder=" "
            />
            <label className="form-label">Email</label>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          <div className="auth-link">
            <a href="#" onClick={() => onNavigate('signin')}>
              Back to Sign In
            </a>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="auth-form">
          <h2 className="auth-title">Reset Password</h2>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="form-group">
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              readOnly
            />
            <label className="form-label">Email</label>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="otp"
              className={`form-input ${errors.otp ? 'form-input-error' : ''}`}
              value={formData.otp}
              onChange={handleInputChange}
              placeholder=" "
            />
            <label className="form-label">OTP</label>
            {errors.otp && <div className="error-message">{errors.otp}</div>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="newPassword"
              className={`form-input ${errors.newPassword ? 'form-input-error' : ''}`}
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder=" "
            />
            <label className="form-label">New Password</label>
            {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder=" "
            />
            <label className="form-label">Confirm Password</label>
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <div className="auth-link">
            <a href="#" onClick={() => onNavigate('signin')}>
              Back to Sign In
            </a>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;