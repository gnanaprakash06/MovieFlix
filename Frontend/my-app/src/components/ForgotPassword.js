import React, { useState } from 'react';
import { initiatePasswordReset } from '../services/authService';

const ForgotPasswordForm = ({ onOTPSent, onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await initiatePasswordReset(email);
      onOTPSent(email);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Forgot Password</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
        
        <div className="form-footer">
          <p>
            Remember your password?{' '}
            <span className="link" onClick={onBack}>
              Sign in now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;