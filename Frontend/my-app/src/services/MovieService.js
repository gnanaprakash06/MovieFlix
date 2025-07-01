import React, { useState, useEffect } from 'react';
import { logout, getAuthToken } from '../services/authService';
import MovieDetails from './MovieDetails';
import './MovieService.css';
import EditProfile from '../components/EditProfile';

const MovieService = ({ userEmail, onNavigate }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMovieDetails, setShowMovieDetails] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [movies, setMovies] = useState({
    popular: [],
    horror: [],
    comedy: [],
    action: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchMovieCategories();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please sign in to view your profile.');
        onNavigate('signin');
        return;
      }
      const response = await fetch(`http://localhost:8081/api/movies/users/${userEmail}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      const data = await response.json();
      setUserProfile(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      setError(error.message || 'Failed to load user profile');
    }
  };

  const fetchMovieCategories = async (retryCount = 0) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please sign in to view movies.');
        onNavigate('signin');
        return;
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const fetchWithRetry = async (url, options, retries) => {
        try {
          const response = await fetch(url, options);
          if (!response.ok) {
            if (response.status === 429 && retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              return fetchWithRetry(url, options, retries - 1);
            }
            throw new Error(`HTTP ${response.status}`);
          }
          return response.json();
        } catch (error) {
          throw new Error(`Failed to fetch ${url}: ${error.message}`);
        }
      };

      const popularData = await fetchWithRetry(
        'http://localhost:8081/api/movies/popular',
        { headers },
        2
      );
      const horrorData = await fetchWithRetry(
        'http://localhost:8081/api/movies/content/genre?genreId=27&type=movie',
        { headers },
        2
      );
      const comedyData = await fetchWithRetry(
        'http://localhost:8081/api/movies/content/genre?genreId=35&type=movie',
        { headers },
        2
      );
      const actionData = await fetchWithRetry(
        'http://localhost:8081/api/movies/content/genre?genreId=28&type=movie',
        { headers },
        2
      );

      setMovies({
        popular: popularData || [],
        horror: horrorData || [],
        comedy: comedyData || [],
        action: actionData || []
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching movies:', error.message);
      setError(error.message || 'Failed to load movies. Please try again later.');
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setShowMovieDetails(true);
  };

  const renderMovieCategory = (title, movieList) => (
    <div className="movie-category">
      <h2 className="category-title">{title}</h2>
      <div className="movie-grid">
        {movieList.length > 0 ? (
          movieList.map((movie) => (
            <div 
              key={movie.id} 
              className="movie-card"
              onClick={() => handleMovieClick(movie)}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title || movie.name}
                className="movie-poster"
              />
              <div className="movie-info">
                <h3 className="movie-title">{movie.title || movie.name}</h3>
                <p className="movie-rating">⭐ {movie.vote_average}/10</p>
              </div>
            </div>
          ))
        ) : (
          <p>No movies available for {title}</p>
        )}
      </div>
    </div>
  );

  if (showEditProfile) {
    return (
      <EditProfile
        userEmail={userEmail}
        userProfile={userProfile}
        onClose={() => {
          setShowEditProfile(false);
          fetchUserProfile();
        }}
      />
    );
  }

  if (showMovieDetails && selectedMovie) {
    return (
      <MovieDetails
        movie={selectedMovie}
        onBack={() => {
          setShowMovieDetails(false);
          setSelectedMovie(null);
        }}
      />
    );
  }

  return (
    <div className="movie-service-container">
      <header className="movie-header">
        <div className="header-left">
          <h1 className="netflix-logo">MovieFlix</h1>
        </div>
        <div className="header-right">
          <span className="username">{userProfile?.name || 'User'}</span>
          {userProfile?.profileImage && (
            <img
              src={`data:image/jpeg;base64,${userProfile.profileImage}`}
              alt="Profile"
              className="profile-image-small"
            />
          )}
          <div className="profile-menu-container">
            <div 
              className="profile-icon"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              👤
            </div>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-item" onClick={() => setShowEditProfile(true)}>
                  Your Account
                </div>
                <div className="dropdown-item" onClick={() => setShowEditProfile(true)}>
                  Edit Profile
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  Sign Out
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="movie-content">
        {error && <div className="error-message">{error}</div>}
        {renderMovieCategory('Popular Movies', movies.popular)}
        {renderMovieCategory('Horror Movies', movies.horror)}
        {renderMovieCategory('Comedy Movies', movies.comedy)}
        {renderMovieCategory('Action Movies', movies.action)}
      </main>
    </div>
  );
};

export default MovieService;