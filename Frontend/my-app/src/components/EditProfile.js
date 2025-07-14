import React, { useState, useRef } from "react";
import { getUsername } from "../services/authService";
import { validateUsername } from "../utils/validation";
import "../App.css";

const EditProfile = ({ userEmail, userProfile, onClose, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    username: getUsername() || userEmail?.split("@")[0] || "", //Use localStorage username as fallback
    email: userEmail || "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(
    userProfile?.profileImage
      ? `data:image/jpeg;base64,${userProfile.profileImage}`
      : null
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const fileInputRef = useRef(null);

  // Username validation function
  const validateUsername = (username) => {
    if (!username) {
      return "Username is required";
    }
    
    if (username.length < 3) {
      return "Username must be at least 3 characters long";
    }
    
    if (username.length > 15) {
      return "Username must be no more than 15 characters long";
    }
    
    if (username.startsWith('_') || username.endsWith('_')) {
      return "Username cannot start or end with an underscore";
    }
    
    if (username.includes(' ')) {
      return "Username cannot contain spaces";
    }
    
    // Check for valid characters only (letters, numbers, underscore)
    const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!validUsernameRegex.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    
    return null;
  };

  // Check username uniqueness
  const checkUsernameUniqueness = async (username) => {
    try {
      const response = await fetch(`http://localhost:8081/api/movies/users/check-username/${username}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.isUnique;
      }
      return true; // Assume unique if check fails
    } catch (error) {
      console.error('Error checking username uniqueness:', error);
      return true; // Assume unique if check fails
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate username on change
    if (name === 'username') {
      const validationError = validateUsername(value);
      
      if (validationError) {
        setUsernameError(validationError);
        return;
      }

      // Check uniqueness only if validation passes and username is different from current
      const currentUsername = getUsername() || userEmail?.split("@")[0] || "";
      if (value !== currentUsername && value.length >= 3) {
        setIsCheckingUsername(true);
        const isUnique = await checkUsernameUniqueness(value);
        setIsCheckingUsername(false);
        
        if (!isUnique) {
          setUsernameError("Username is already taken");
        } else {
          setUsernameError("");
        }
      } else {
        setUsernameError("");
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Final validation before submit
    const validationError = validateUsername(formData.username);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    // Check if there are any errors
    if (usernameError || isCheckingUsername) {
      return;
    }
  
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    if (profileImage) {
      formDataToSend.append('profileImage', profileImage);
    }

    const response = await fetch(`http://localhost:8081/api/movies/users/${userEmail}/profile`, {
      method: 'PUT',
      body: formDataToSend
    });

    if (response.ok) {
      // Update username in localStorage
      localStorage.setItem('username', formData.username);
      
      // Call parent callback to update username in UI
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } else {
      alert('Failed to update profile');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Error updating profile');
  }
};

  return (
    <div className="edit-profile-overlay">
      <div className="edit-profile-container">
        <div className="edit-profile-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="profile-image-section">
            <div className="profile-image-container">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="profile-image-large"
                />
              ) : (
                <div className="profile-placeholder">👤</div>
              )}
              <button
                type="button"
                className="image-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={usernameError ? "error" : ""}
            />
             {isCheckingUsername && (
              <div className="username-checking">
                <span>Checking username availability...</span>
              </div>
            )}
            {usernameError && (
              <div className="error-message">
                {usernameError}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} readOnly />
          </div>

          <button 
            type="submit" 
            className="update-profile-btn"
            disabled={usernameError || isCheckingUsername}
          >
            {isCheckingUsername ? 'Checking...' : 'Update Profile'}
          </button>
        </form>

        {showSuccess && (
          <div className="success-dialog">
            <div className="success-content">
              <p>Profile updated successfully!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
