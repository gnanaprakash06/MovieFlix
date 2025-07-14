import React, { useState } from "react";
import { validateEmail } from "../utils/validation";
import {
  signInUser,
  fetchUserDetails,
  storeUserDetails,
} from "../services/authService";
import "../App.css";

const SignIn = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

       
    // Real-time validation for email
    let error = null;
    if (name === "email") {
      error = validateEmail(value);
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
    
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    
    if (emailError) newErrors.email = emailError;

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
        password: formData.password,
      });

      //Fetch username from auth service after successful login
      const userDetails = await fetchUserDetails(formData.email);

      //Store user details in localStorage using the service function
      storeUserDetails(userDetails);

      onNavigate("movieservice");
    } catch (error) {
      setServerError(
        error.message === "Password is incorrect"
          ? "Wrong password"
          : error.message
      );
    }
  };

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
            className="form-input"
            placeholder=" "
          />
          <label className="form-label">Password</label>
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
        </div>
        {serverError && <div className="error-message">{serverError}</div>}
        <button type="submit" className="auth-button">
          Sign In
        </button>
        <div className="auth-link">
          <a href="#" onClick={() => onNavigate("forgotpassword")}>
            Forgot Password?
          </a>
        </div>
        <div className="auth-link">
          New to MovieFlix?{" "}
          <a href="#" onClick={() => onNavigate("signup")}>
            Sign up now
          </a>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
