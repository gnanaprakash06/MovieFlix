import React, { useState, useRef } from "react";
import { getUsername } from "../services/authService";
import "../App.css";

const EditProfile = ({ userEmail, userProfile, onClose }) => {
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
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      const response = await fetch(
        `http://localhost:8081/api/movies/users/${userEmail}/profile`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );

      if (response.ok) {
        //Update username in localStorage
        localStorage.setItem("username", formData.username);

        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
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
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} readOnly />
          </div>

          <button type="submit" className="update-profile-btn">
            Update Profile
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
