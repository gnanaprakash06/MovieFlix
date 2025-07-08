import React, { useState } from "react";
import { validateEmail } from "../utils/validation";
import "../App.css";

const ForgotPassword = ({ onNavigate }) => {
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(forgotPasswordEmail);
    if (emailError) {
      setForgotPasswordError(emailError);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotPasswordEmail }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setForgotSuccess(true);
        setTimeout(() => {
          setForgotSuccess(false);
          // Navigate to reset password with the email
          onNavigate("resetpassword", { email: forgotPasswordEmail });
          setForgotPasswordError("");
        }, 2000);
      } else {
        setForgotPasswordError(data.error || "Failed to send OTP");
      }
    } catch (error) {
      setForgotPasswordError("Error sending OTP");
    }
  };

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
              setForgotPasswordError("");
            }}
            className={`form-input ${
              forgotPasswordError ? "form-input-error" : ""
            }`}
            placeholder=" "
          />
          <label className="form-label">Email</label>
          {forgotPasswordError && (
            <div className="error-message">{forgotPasswordError}</div>
          )}
        </div>
        <button type="submit" className="auth-button">
          Send OTP
        </button>

        <div className="auth-link">
          <a href="#" onClick={() => onNavigate("signin")}>
            Back to Sign In
          </a>
        </div>
        {forgotSuccess && (
          <div className="success-dialog">
            <div className="success-content">
              <p>OTP sent to given email Id!</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;