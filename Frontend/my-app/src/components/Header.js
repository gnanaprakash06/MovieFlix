import React from "react";
import "../services/MovieService.css";
const Header = ({
  username,
  userProfile,
  currentView,
  setCurrentView,
  searchQuery,
  handleSearch,
  showSearchInput,
  setShowSearchInput,
  showProfileMenu,
  setShowProfileMenu,
  setShowEditProfile,
  handleLogout
}) => {

  const handleSearchIconClick = () => {
    setShowSearchInput(true);
  };

  const handleSearchBlur = () => {
    if (searchQuery.trim() === "") {
      setShowSearchInput(false);
    }
  };

  const SearchIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="search-icon"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );

  return (
    <header className="movie-header">
      <div className="header-left">
        <h1 className="netflix-logo">MovieFlix</h1>
        <nav className="header-nav">
          <button
            className={
              currentView === "home" ? "nav-link active" : "nav-link"
            }
            onClick={() => setCurrentView("home")}
          >
            Home
          </button>
          <button
            className={
              currentView === "favorites" ? "nav-link active" : "nav-link"
            }
            onClick={() => setCurrentView("favorites")}
          >
            Favorites
          </button>
          <button
            className={
              currentView === "subscriptions" ? "nav-link active" : "nav-link"
            }
            onClick={() => setCurrentView("subscriptions")}
          >
            Subscriptions
          </button>
          <button
            className={
              currentView === "browse" ? "nav-link active" : "nav-link"
            }
            onClick={() => setCurrentView("browse")}
          >
            Browse by Genre
          </button>
        </nav>
      </div>
      <div className="header-right">
        <div className="search-container">
          {!showSearchInput ? (
            <button
              className="search-icon-btn"
              onClick={handleSearchIconClick}
              aria-label="Search movies"
            >
              <SearchIcon />
            </button>
          ) : (
            <input
              type="text"
              className="search-input"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={handleSearch}
              onBlur={handleSearchBlur}
              autoFocus
            />
          )}
        </div>
        <span className="username">{username}</span>
        {userProfile?.profileImage ? (
          <img
            src={`data:image/jpeg;base64,${userProfile.profileImage}`}
            alt="Profile"
            className="profile-image-small"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          />
        ) : (
          <div
            className="profile-icon"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            👤
          </div>
        )}
        {showProfileMenu && (
          <div className="profile-dropdown">
            <div
              className="dropdown-item"
              onClick={() => setShowEditProfile(true)}
            >
              Edit Profile
            </div>
            <div className="dropdown-item" onClick={handleLogout}>
              Sign Out
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;