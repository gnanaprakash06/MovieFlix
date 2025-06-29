import React, { useState } from 'react';
import { validateEmail, validatePassword, validateUsername, validatePhoneNumber } from '../utils/validation';
import { signUpUser } from '../services/authService';

const SignUp = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    const newErrors = { ...errors };
    
    if (name === 'username') {
      const usernameError = validateUsername(value);
      if (usernameError) {
        newErrors.username = usernameError;
      } else {
        delete newErrors.username;
      }
    }
    
    if (name === 'email') {
      const emailError = validateEmail(value);
      if (emailError) {
        newErrors.email = emailError;
      } else {
        delete newErrors.email;
      }
    }
    
    if (name === 'phoneNumber') {
      const phoneError = validatePhoneNumber(value);
      if (phoneError) {
        newErrors.phoneNumber = phoneError;
      } else {
        delete newErrors.phoneNumber;
      }
    }
    
    if (name === 'password') {
      const passwordError = validatePassword(value);
      if (passwordError) {
        newErrors.password = passwordError;
      } else {
        delete newErrors.password;
      }
      
      // Also check confirm password if it exists
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else if (formData.confirmPassword && value === formData.confirmPassword) {
        delete newErrors.confirmPassword;
      }
    }
    
    if (name === 'confirmPassword') {
      if (formData.password !== value) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;
    
    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    // Phone number validation
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;
    
    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      const response = await signUpUser(formData);
      setSuccessMessage('Account created successfully! Redirecting to sign in...');
      
      setTimeout(() => {
        onNavigate('signin');
      }, 2000);
      
    } catch (error) {
      setErrors({
        submit: error.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-title">Sign Up</h1>
        
        <div className="form-group">
          <input
            type="text"
            name="username"
            className={`form-input ${errors.username ? 'form-input-error' : ''}`}
            placeholder=" "
            value={formData.username}
            onChange={handleChange}
            required
          />
          <label className="form-label">Username</label>
          {errors.username && <div className="error-message">{errors.username}</div>}
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            placeholder=" "
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label className="form-label">Email</label>
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="phoneNumber"
            className={`form-input ${errors.phoneNumber ? 'form-input-error' : ''}`}
            placeholder=" "
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
          <label className="form-label">Phone Number</label>
          {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            className={`form-input ${errors.password ? 'form-input-error' : ''}`}
            placeholder=" "
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label className="form-label">Password</label>
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
            placeholder=" "
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <label className="form-label">Confirm Password</label>
          {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <div className="auth-link">
          Already have an account? <span onClick={() => onNavigate('signin')} style={{ color: '#ffffff', cursor: 'pointer', textDecoration: 'underline' }}>Sign in now</span>
        </div>
      </form>
    </div>
  );
};

export default SignUp;