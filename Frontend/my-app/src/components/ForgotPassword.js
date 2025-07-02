import React, { useState } from 'react';
import { initiatePasswordReset } from '../services/authService';

const ForgotPasswordForm = ({ onOTPSent, onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const data = await initiatePasswordReset(email);  // Capture returned response
      setSuccessMessage(data.message || `OTP sent to ${email}`);
      // await initiatePasswordReset(email);
      // onOTPSent(email);
      // setSuccessMessage(`OTP sent to ${email}`);

      // Delay the onOTPSent call to show success message first
      setTimeout(() => {
        onOTPSent(email);
      }, 3000); // Show success message for 3 seconds before proceeding

    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    setLoading(false);
    }
      // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Forgot Password</h2>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
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
            disabled={loading || successMessage} // Disable button when success message is shown
          >
            {successMessage ? 'Redirecting in 3 seconds...' : loading ? 'Sending OTP...' : 'Send OTP'/* {loading ? 'Sending OTP...' : successMessage ? 'OTP Sent!' : 'Send OTP'} */}
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