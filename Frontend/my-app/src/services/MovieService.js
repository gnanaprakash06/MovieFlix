import React, { useState, useEffect } from "react";
import { logout, getAuthToken, getUsername } from "../services/authService";
import MovieDetails from "./MovieDetails";
import EditProfile from "../components/EditProfile";
import Header from "../components/Header";
import "./MovieService.css";

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
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  // Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Hero section states
  const [heroMovies, setHeroMovies] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isLoadingHero, setIsLoadingHero] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setError("No user email provided. Please sign in.");
      onNavigate("signin");
      return;
    }

    //Get username from localStorage
    const storedUsername = getUsername();
    setUsername(storedUsername || userEmail.split("@")[0]);

    fetchUserProfile();
    fetchMovieCategories();
    fetchFavorites();
    fetchHeroMovies();
  }, [userEmail]);

  // Hero rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => 
        prevIndex === heroMovies.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Please sign in to view your profile.");
        onNavigate("signin");
        return;
      }
      const response = await fetch(
        `http://localhost:8081/api/movies/users/${userEmail}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(
            `User profile not found for ${userEmail}, attempting to create...`
          );
          await createUserProfile();
          return;
        }
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      const data = await response.json();
      setUserProfile(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
      setError(error.message || "Failed to load user profile");
    }
  };

  const createUserProfile = async () => {
    if (!userEmail) {
      setError("Cannot create profile: No user email provided.");
      return;
    }
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:8081/api/movies/users/${userEmail}/create-profile`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail, username: username }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create user profile");
      }
    } catch (error) {
      console.error("Error creating user profile:", error.message);
      setError("Failed to create user profile");
    }
  };

  const fetchFavorites = async () => {
    if (!userEmail) {
      setError("Cannot fetch favorites: No user email provided.");
      return;
    }
    setIsLoadingFavorites(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:8081/api/movies/user/${userEmail}/favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(
            `Favorites not found for ${userEmail}, initializing empty favorites...`
          );
          setFavorites([]);
          return;
        }
        throw new Error("Failed to fetch favorites");
      }
      const data = await response.json();
      setFavorites(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching favorites:", error.message);
      setError(error.message || "Failed to load favorites");
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const filterMoviesByVoteCount = (movies, minVoteCount = 10) => {
    if (!Array.isArray(movies)) return [];
    return movies.filter((movie) => movie.vote_count >= minVoteCount);
  };

  const fetchMovieCategories = async (retryCount = 0) => {
    setIsLoadingMovies(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        setError("Please sign in to view movies.");
        onNavigate("signin");
        return;
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const [result1, result2, result3, result4] = await Promise.all([
        fetch("http://localhost:8081/api/movies/popular", { headers }),
        fetch(
          "http://localhost:8081/api/movies/content/genre?genreId=27&type=movie",
          { headers }
        ),
        fetch(
          "http://localhost:8081/api/movies/content/genre?genreId=35&type=movie",
          { headers }
        ),
        fetch(
          "http://localhost:8081/api/movies/content/genre?genreId=28&type=movie",
          { headers }
        ),
      ]);

      const [res1, res2, res3, res4] = await Promise.all([
        result1.json(),
        result2.json(),
        result3.json(),
        result4.json(),
      ]);

      setMovies({
        popular: res1,
        horror: res2,
        comedy: res3,
        action: res4,
      });

      setError(null);
    } catch (error) {
      console.error("Error fetching movies:", error.message);
      setError(
        error.message || "Failed to load movies. Please try again later."
      );
    } finally {
      setIsLoadingMovies(false);
    }
  };

  const fetchHeroMovies = async () => {
    setIsLoadingHero(true);
    try {
      const token = getAuthToken();
      const response = await fetch("http://localhost:8081/api/movies/popular", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Get first 6 movies for hero section
        setHeroMovies(data.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching hero movies:", error);
    } finally {
      setIsLoadingHero(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const token = getAuthToken();
        const response = await fetch(
          `http://localhost:8081/api/movies/search?title=${encodeURIComponent(
            query
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(filterMoviesByVoteCount(data));
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error searching movies:", error.message);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleAddToFavorites = async (movie) => {
    if (!userEmail) {
      setError("Cannot add to favorites: No user email provided.");
      return;
    }
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:8081/api/movies/user/${userEmail}/favorites`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(movie),
        }
      );
      if (response.ok) {
        await fetchFavorites();
        setError(null);
        // Show success alert
        setAlertMessage(`${movie.title || movie.name} added to favorites!`);
        setShowAlert(true);
        // Auto-hide alert after 3 seconds
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      } else {
        throw new Error("Failed to add movie to favorites");
      }
    } catch (error) {
      console.error("Error adding to favorites:", error.message);
      setError("Failed to add movie to favorites");
    }
  };

  const handleRemoveFromFavorites = async (movieId) => {
    if (!userEmail) {
      setError("Cannot remove from favorites: No user email provided.");
      return;
    }
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:8081/api/movies/user/${userEmail}/favorites/${movieId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        await fetchFavorites();
        setError(null);
      } else {
        throw new Error("Failed to remove movie from favorites");
      }
    } catch (error) {
      console.error("Error removing from favorites:", error.message);
      setError("Failed to remove movie from favorites");
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate("home");
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setShowMovieDetails(true);
  };

  // Function to update username after profile edit
  const handleProfileUpdate = () => {
    const storedUsername = getUsername();
    setUsername(storedUsername || userEmail.split("@")[0]);
    setShowEditProfile(false);
    fetchUserProfile();
  };

  // Shimmer component for movie cards
  const MovieCardShimmer = () => (
    <div className="movie-card shimmer-card">
      <div className="shimmer-poster"></div>
      <div className="shimmer-info">
        <div className="shimmer-title"></div>
      </div>
    </div>
  );

  // Alert Component
  const Alert = ({ message, isVisible, onClose }) => {
    if (!isVisible) return null;
    
    return (
      <div className="alert-container">
        <div className="alert-box">
          <div className="alert-content">
            <span className="alert-icon">✓</span>
            <span className="alert-message">{message}</span>
          </div>
          <button className="alert-close" onClick={onClose}>×</button>
        </div>
      </div>
    );
  };

  // Hero Section Component
  const HeroSection = () => {
    if (isLoadingHero) {
      return (
        <div className="hero-section">
          <div className="hero-shimmer">
            <div className="hero-shimmer-background"></div>
            <div className="hero-shimmer-content">
              <div className="hero-shimmer-title"></div>
              <div className="hero-shimmer-subtitle"></div>
              <div className="hero-shimmer-overview"></div>
              <div className="hero-shimmer-button"></div>
            </div>
          </div>
        </div>
      );
    }

    if (heroMovies.length === 0) return null;

    const currentMovie = heroMovies[currentHeroIndex];

    return (
      <div className="hero-section">
        <div className="hero-background">
          <img
            src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
            alt={currentMovie.title}
            className="hero-backdrop"
          />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h3 className="hero-category">Recommended Movies</h3>
            <h1 className="hero-title">{currentMovie.title}</h1>
            <p className="hero-overview">
              {currentMovie.overview?.substring(0, 200)}...
            </p>
            <div className="hero-actions">
              <button 
                className="hero-watch-btn"
                onClick={() => handleMovieClick(currentMovie)}
              >
                Watch Now
              </button>
            </div>
          </div>
        </div>
        
        <div className="hero-indicators">
          {heroMovies.map((_, index) => (
            <div
              key={index}
              className={`hero-indicator ${index === currentHeroIndex ? 'active' : ''}`}
              onClick={() => setCurrentHeroIndex(index)}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderMovieCategory = (title, movieList, isLoading = false) => (
    <div className="movie-category">
      <h2 className="category-title">{title}</h2>
      <div className="movie-grid">
        {isLoading ? (
          // Show shimmer cards while loading
          Array(8)
            .fill(0)
            .map((_, index) => <MovieCardShimmer key={index} />)
        ) : movieList.length > 0 ? (
          movieList.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="favorite-btn-container">
                <button
                  className="favorite-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    favorites.some((fav) => fav.id === movie.id)
                      ? handleRemoveFromFavorites(movie.id)
                      : handleAddToFavorites(movie);
                  }}
                >
                  {favorites.some((fav) => fav.id === movie.id) ? "❤️" : "🤍"}
                </button>
              </div>
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title || movie.name}
                className="movie-poster"
              />
              <div className="movie-info">
                <h3 className="movie-title">{movie.title || movie.name}</h3>
              </div>
            </div>
          ))
        ) : (
          <p>No movies available for {title}</p>
        )}
      </div>
    </div>
  );

  // Updated renderFavorites function with centered title and heart icon
  const renderFavorites = () => (
    <div className="movie-category">
      <h2 className="category-title favorites-title"></h2>
      <div className="movie-grid">
        {isLoadingFavorites ? (
          // Show shimmer cards while loading favorites
          Array(6)
            .fill(0)
            .map((_, index) => <MovieCardShimmer key={index} />)
        ) : favorites.length > 0 ? (
          favorites.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="favorite-btn-container">
                <button
                  className="favorite-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFromFavorites(movie.id);
                  }}
                >
                  ❤️
                </button>
              </div>
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title || movie.name}
                className="movie-poster"
              />
              <div className="movie-info">
                <h3 className="movie-title">{movie.title || movie.name}</h3>
              </div>
            </div>
          ))
        ) : (
          <div className="no-favorites-container">
            <div className="no-favorites-content">
              <svg 
                className="heart-icon" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <p className="no-favorites-text">No Favorites Added</p>
            </div>
          </div>
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
        onProfileUpdate={handleProfileUpdate}
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
      <Header 
        username={username}
        userProfile={userProfile}
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        showSearchInput={showSearchInput}
        setShowSearchInput={setShowSearchInput}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        setShowEditProfile={setShowEditProfile}
        handleLogout={handleLogout}
      />

      {/* Alert Component */}
      <Alert 
        message={alertMessage} 
        isVisible={showAlert} 
        onClose={() => setShowAlert(false)} 
      />

      <main className="movie-content">
        {error && <div className="error-message">{error}</div>}
        {currentView === "home" && searchQuery.length > 2 ? (
          renderMovieCategory("Search Results", searchResults, isSearching)
        ) : currentView === "home" ? (
          <>
            <HeroSection />
            {renderMovieCategory(
              "Popular Movies",
              movies.popular,
              isLoadingMovies
            )}
            {renderMovieCategory(
              "Horror Movies",
              movies.horror,
              isLoadingMovies
            )}
            {renderMovieCategory(
              "Comedy Movies",
              movies.comedy,
              isLoadingMovies
            )}
            {renderMovieCategory(
              "Action Movies",
              movies.action,
              isLoadingMovies
            )}
          </>
        ) : (
          renderFavorites()
        )}
      </main>
    </div>
  );
};

export default MovieService;