import React, { useState } from 'react';
import { validateEmail } from '../utils/validation';
import { signInUser } from '../services/authService';

const SignIn = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    const newErrors = { ...errors };
    
    if (name === 'email') {
      const emailError = validateEmail(value);
      if (emailError) {
        newErrors.email = emailError;
      } else {
        delete newErrors.email;
      }
    }
    
    if (name === 'password') {
      if (!value.trim()) {
        newErrors.password = 'Password is required';
      } else {
        delete newErrors.password;
      }
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
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
    
    try {
      const response = await signInUser(formData);
      
      window.authToken = response.token;
      window.userEmail = formData.email;
      
    
      alert('Login successful!');
      onNavigate('home');
      
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
        <h1 className="auth-title">Sign In</h1>
        
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

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="auth-link">
          New to Netflix? <span onClick={() => onNavigate('signup')} style={{ color: '#ffffff', cursor: 'pointer', textDecoration: 'underline' }}>Sign up now</span>
        </div>
      </form>
    </div>
  );
};

export default SignIn;