import React, { useState } from 'react';
import { validateEmail, validatePassword } from '../utils/validation';
import { signInUser } from '../services/authService';
import '../App.css';


const SignIn = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetFormData, setResetFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const[forgotsuccess, setForgotSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

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
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await signInUser({
        email: formData.email,
        password: formData.password
      });
      window.authToken = response.token;
      window.userEmail = formData.email;
      onNavigate('movieservice');
    } catch (error) {
      setServerError(error.message === 'Password is incorrect' ? 'Wrong password' : error.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(forgotPasswordEmail);
    if (emailError) {
      setForgotPasswordError(emailError);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail })
      });
      const data = await response.json();

      if (response.ok) {
        setForgotSuccess(true);
        setTimeout(()=>{
          setForgotSuccess(false);
        setShowForgotPassword(false);
        setShowResetPassword(true);
        setForgotPasswordError('');
        },2000);
      } else {
        setForgotPasswordError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      setForgotPasswordError('Error sending OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!resetFormData.otp) newErrors.otp = 'OTP is required';
    const passwordError = validatePassword(resetFormData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    if (resetFormData.newPassword !== resetFormData.confirmPassword) {
      newErrors.confirmPassword = 'Password does not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setResetError('');
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          otp: resetFormData.otp,
          newPassword: resetFormData.newPassword,
          confirmPassword: resetFormData.confirmPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        setResetSuccess(true);
        setTimeout(() => {
          setResetSuccess(false);
          setShowResetPassword(false);
          setResetFormData({ otp: '', newPassword: '', confirmPassword: '' });
          setForgotPasswordEmail('');
          setShowForgotPassword(false);
        }, 2000);
      } else {
        setResetError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setResetError('Error resetting password');
    }
  };

  const handleResetInputChange = (e) => {
    const { name, value } = e.target;
    setResetFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: null
    }));
    setResetError('');
  };

  if (showForgotPassword) {
    return (
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleForgotPassword}>
          <h2 className="auth-title">Forgot Password</h2>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={forgotPasswordEmail}
              onChange={(e) => {
                setForgotPasswordEmail(e.target.value);
                setForgotPasswordError('');
              }}
              className={`form-input ${forgotPasswordError ? 'form-input-error' : ''}`}
              placeholder=" "
            />
            <label className="form-label">Email</label>
            {forgotPasswordError && <div className="error-message">{forgotPasswordError}</div>}
          </div>
          <button type="submit" className="auth-button">Send OTP</button>
              
          <div className="auth-link">
            <a href="#" onClick={() => setShowForgotPassword(false)}>Back to Sign In</a>
          </div>
          {forgotsuccess && (
            <div className="success-dialog">
              <div className="success-content">
                <p>OTP sent to given email Id!</p>
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }

  if (showResetPassword) {
    return (
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleResetPassword}>
          <h2 className="auth-title">Reset Password</h2>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={forgotPasswordEmail}
              readOnly
              className="form-input"
              placeholder=" "
            />
            <label className="form-label">Email</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="otp"
              value={resetFormData.otp}
              onChange={handleResetInputChange}
              className={`form-input ${errors.otp ? 'form-input-error' : ''}`}
              placeholder=" "
            />
            <label className="form-label">OTP</label>
            {errors.otp && <div className="error-message">{errors.otp}</div>}
          </div>
          <div className="form-group">
            <input
              type="password"
              name="newPassword"
              value={resetFormData.newPassword}
              onChange={handleResetInputChange}
              className={`form-input ${errors.newPassword ? 'form-input-error' : ''}`}
              placeholder=" "
            />
            <label className="form-label">New Password</label>
            {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
          </div>
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              value={resetFormData.confirmPassword}
              onChange={handleResetInputChange}
              className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
              placeholder=" "
            />
            <label className="form-label">Confirm Password</label>
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          {resetError && <div className="error-message">{resetError}</div>}
          <button type="submit" className="auth-button">Reset Password</button>
          <div className="auth-link">
            <a href="#" onClick={() => setShowResetPassword(false)}>Back to Forgot Password</a>
          </div>
          {resetSuccess && (
            <div className="success-dialog">
              <div className="success-content">
                <p>Password reset successfully!</p>
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Sign In</h2>
        <div className="form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            placeholder=" "
          />
          <label className="form-label">Email</label>
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`form-input ${errors.password ? 'form-input-error' : ''}`}
            placeholder=" "
          />
          <label className="form-label">Password</label>
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>
        {serverError && <div className="error-message">{serverError}</div>}
        <button type="submit" className="auth-button">Sign In</button>
        <div className="auth-link">
          <a href="#" onClick={() => setShowForgotPassword(true)}>Forgot Password?</a>
        </div>
        <div className="auth-link">
          New to MovieFlix? <a href="#" onClick={() => onNavigate('signup')}>Sign up now</a>
        </div>
      </form>
    </div>
  );
};

export default SignIn;