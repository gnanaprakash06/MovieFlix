import React, { useState } from "react";
import { validatePassword } from "../utils/validation";
import "../App.css";

const ResetPassword = ({ onNavigate, email }) => {
  const [resetFormData, setResetFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleResetInputChange = (e) => {
    const { name, value } = e.target;
    setResetFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
    setResetError("");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!resetFormData.otp) newErrors.otp = "OTP is required";
    const passwordError = validatePassword(resetFormData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    if (resetFormData.newPassword !== resetFormData.confirmPassword) {
      newErrors.confirmPassword = "Password does not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setResetError("");
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            otp: resetFormData.otp,
            newPassword: resetFormData.newPassword,
            confirmPassword: resetFormData.confirmPassword,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setResetSuccess(true);
        setTimeout(() => {
          setResetSuccess(false);
          setResetFormData({ otp: "", newPassword: "", confirmPassword: "" });
          onNavigate("signin");
        }, 2000);
      } else {
        setResetError(data.error || "Failed to reset password");
      }
    } catch (error) {
      setResetError("Error resetting password");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleResetPassword}>
        <h2 className="auth-title">Reset Password</h2>
        <div className="form-group">
          <input
            type="email"
            name="email"
            value={email || ""}
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
            className={`form-input ${errors.otp ? "form-input-error" : ""}`}
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
            className={`form-input ${
              errors.newPassword ? "form-input-error" : ""
            }`}
            placeholder=" "
          />
          <label className="form-label">New Password</label>
          {errors.newPassword && (
            <div className="error-message">{errors.newPassword}</div>
          )}
        </div>
        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            value={resetFormData.confirmPassword}
            onChange={handleResetInputChange}
            className={`form-input ${
              errors.confirmPassword ? "form-input-error" : ""
            }`}
            placeholder=" "
          />
          <label className="form-label">Confirm Password</label>
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}
        </div>
        {resetError && <div className="error-message">{resetError}</div>}
        <button type="submit" className="auth-button">
          Reset Password
        </button>
        <div className="auth-link">
          <a href="#" onClick={() => onNavigate("forgotpassword")}>
            Back to Forgot Password
          </a>
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
};

export default ResetPassword;