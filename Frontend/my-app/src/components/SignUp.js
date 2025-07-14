import React, { useState } from "react";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateConfirmPassword,
} from "../utils/validation";
import { signUpUser } from "../services/authService";
import "../App.css";

const SignUp = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    let error = null;
    if (name === "username") {
      error = validateUsername(value);
    } else if (name === "email") {
      error = validateEmail(value);
    } else if (name === "password") {
      error = validatePassword(value);
      // Also revalidate confirm password if it exists
      if (formData.confirmPassword) {
        const confirmError = validateConfirmPassword(value, formData.confirmPassword);
        setErrors((prev) => ({
          ...prev,
          confirmPassword: confirmError,
        }));
      }
    } else if (name === "confirmPassword") {
      error = validateConfirmPassword(formData.password, value);
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);

    if (usernameError) newErrors.username = usernameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

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
      // Register in Auth Service (MySQL)
      await signUpUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setSuccessMessage(
        "Account created successfully! Redirecting to sign in..."
      );
      setTimeout(() => {
        onNavigate("signin");
      }, 2000);
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Sign Up</h2>
        <div className="form-group">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`form-input ${
              errors.username ? "form-input-error" : ""
            }`}
            placeholder=" "
          />
          <label className="form-label">Username</label>
          {errors.username && (
            <div className="error-message">{errors.username}</div>
          )}
        </div>
        <div className="form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${errors.email ? "form-input-error" : ""}`}
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
            className={`form-input ${
              errors.password ? "form-input-error" : ""
            }`}
            placeholder=" "
          />
          <label className="form-label">Password</label>
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
        </div>
        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
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
        {serverError && <div className="error-message">{serverError}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        <button
          type="submit"
          className="auth-button"
          disabled={Object.keys(errors).some(key => errors[key] !== null)}
        >
          Sign Up
        </button>
        <div className="auth-link">
          Already have an account?{" "}
          <a href="#" onClick={() => onNavigate("signin")}>
            Sign in now
          </a>
        </div>
      </form>
    </div>
  );
};

export default SignUp;

