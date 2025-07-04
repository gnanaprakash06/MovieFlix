import React, { useState, useEffect } from 'react';
import { logout, getAuthToken, getUsername } from '../services/authService';
import MovieDetails from './MovieDetails';
import EditProfile from '../components/EditProfile';
import './MovieService.css';

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
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  // const [profileRetryCount, setProfileRetryCount] = useState(0);
  const [username, setUsername] = useState('');
    // Loading states for shimmer effect
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      setError('No user email provided. Please sign in.');
      onNavigate('signin');
      return;
    }

    //Get username from localStorage
    const storedUsername = getUsername();
    setUsername(storedUsername || userEmail.split('@')[0]);

    fetchUserProfile();
    fetchMovieCategories();
    fetchFavorites();
  }, [userEmail]);

  const fetchUserProfile = async () => {
    // if (profileRetryCount >= 3) {
    //   setError('Failed to fetch user profile after multiple attempts.');
    //   return;
    // }
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
        // if (response.status === 404 && profileRetryCount < 3) {
        if (response.status === 404){
          console.warn(`User profile not found for ${userEmail}, attempting to create...`);
          // setProfileRetryCount(prev => prev + 1);
          await createUserProfile();
          // return fetchUserProfile(); // Retry after creating profile
          return;
        }
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      const data = await response.json();
      setUserProfile(data);
      // setProfileRetryCount(0);
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      setError(error.message || 'Failed to load user profile');
    }
  };

  const createUserProfile = async () => {
    if (!userEmail) {
      setError('Cannot create profile: No user email provided.');
      return;
    }
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:8081/api/movies/users/${userEmail}/create-profile`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // body: JSON.stringify({ email: userEmail, username: userEmail.split('@')[0] })
        body: JSON.stringify({ email: userEmail, username: username })
      });
      if (!response.ok) {
        throw new Error('Failed to create user profile');
      }
    } catch (error) {
      console.error('Error creating user profile:', error.message);
      setError('Failed to create user profile');
    }
  };

  const fetchFavorites = async () => {
    if (!userEmail) {
      setError('Cannot fetch favorites: No user email provided.');
      return;
    }
    setIsLoadingFavorites(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:8081/api/movies/user/${userEmail}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Favorites not found for ${userEmail}, initializing empty favorites...`);
          setFavorites([]);
          return;
        }
        throw new Error('Failed to fetch favorites');
      }
      const data = await response.json();
      setFavorites(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching favorites:', error.message);
      setError(error.message || 'Failed to load favorites');
          } finally {
      setIsLoadingFavorites(false);
    }
  };

  const filterMoviesByVoteCount = (movies, minVoteCount = 10) => {
    if (!Array.isArray(movies)) return [];
    return movies.filter(movie => movie.vote_count >= minVoteCount);
  };

  const fetchMovieCategories = async (retryCount = 0) => {
    setIsLoadingMovies(true);
    try {
      const token =await getAuthToken();
      if (!token) {
        setError('Please sign in to view movies.');
        onNavigate('signin');
        return;
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
          const [result1,result2,result3,result4] = await Promise.all([ fetch(
        'http://localhost:8081/api/movies/popular',
        { headers }),
            fetch(
        'http://localhost:8081/api/movies/content/genre?genreId=27&type=movie',
        { headers }),
         fetch(
        'http://localhost:8081/api/movies/content/genre?genreId=35&type=movie',
        { headers }),
          fetch(
        'http://localhost:8081/api/movies/content/genre?genreId=28&type=movie',
        { headers })
      ]);

      const [res1,res2,res3,res4]
 = await Promise.all([result1.json(),result2.json(),result3.json(),result4.json()]);

    setMovies({
        popular: res1,
        horror: res2,
        comedy: res3,
        action: res4
      });     

      // const fetchWithRetry = async (url, options, retries) => {
      //   try {
      //     const response = await fetch(url, options);
      //     if (!response.ok) {
      //       if (response.status === 429 && retries > 0) {
      //         await new Promise(resolve => setTimeout(resolve, 1000));
      //         return await fetchWithRetry(url, options, retries - 1);
      //       }
      //       throw new Error(`HTTP ${response.status}`);
      //     }
      //     const result =await response.json()
      //     return result;
      //   } catch (error) {
      //     throw new Error(`Failed to fetch ${url}: ${error.message}`);
      //   }
      // };

      // const popularData = await fetchWithRetry(
      //   'http://localhost:8081/api/movies/popular',
      //   { headers },
      //   2
      // );
      // const horrorData = await fetchWithRetry(
      //   'http://localhost:8081/api/movies/content/genre?genreId=27&type=movie',
      //   { headers },
      //   2
      // );
      // const comedyData = await fetchWithRetry(
      //   'http://localhost:8081/api/movies/content/genre?genreId=35&type=movie',
      //   { headers },
      //   2
      // );
      // const actionData = await fetchWithRetry(
      //   'http://localhost:8081/api/movies/content/genre?genreId=28&type=movie',
      //   { headers },
      //   2
      // );

      // setMovies({
      //   popular: popularData,
      //   horror: horrorData,
      //   comedy: comedyData,
      //   action: actionData
      // });
      setError(null);
    } catch (error) {
      console.error('Error fetching movies:', error.message);
      setError(error.message || 'Failed to load movies. Please try again later.');
       } finally {
      setIsLoadingMovies(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const token = getAuthToken();
        const response = await fetch(`http://localhost:8081/api/movies/search?title=${encodeURIComponent(query)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSearchResults(filterMoviesByVoteCount(data));
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching movies:', error.message);
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
      setError('Cannot add to favorites: No user email provided.');
      return;
    }
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:8081/api/movies/user/${userEmail}/favorites`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movie)
      });
      if (response.ok) {
        await fetchFavorites();
        setError(null);
      } else {
        throw new Error('Failed to add movie to favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error.message);
      setError('Failed to add movie to favorites');
    }
  };

  const handleRemoveFromFavorites = async (movieId) => {
    if (!userEmail) {
      setError('Cannot remove from favorites: No user email provided.');
      return;
    }
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:8081/api/movies/user/${userEmail}/favorites/${movieId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        await fetchFavorites();
        setError(null);
      } else {
        throw new Error('Failed to remove movie from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error.message);
      setError('Failed to remove movie from favorites');
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

    // Function to update username after profile edit
  const handleProfileUpdate = () => {
    const storedUsername = getUsername();
    setUsername(storedUsername || userEmail.split('@')[0]);
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

  const renderMovieCategory = (title, movieList, isLoading = false) => (
    <div className="movie-category">
      <h2 className="category-title">{title}</h2>
      <div className="movie-grid">
        {isLoading ? (
          // Show shimmer cards while loading
          Array(8).fill(0).map((_, index) => (
            <MovieCardShimmer key={index} />
          ))
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
                    favorites.some(fav => fav.id === movie.id)
                      ? handleRemoveFromFavorites(movie.id)
                      : handleAddToFavorites(movie);
                  }}
                >
                  {favorites.some(fav => fav.id === movie.id) ? '❤️' : '🤍'}
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

  const renderFavorites = () => (
    <div className="movie-category">
      <h2 className="category-title">Favorites</h2>
      <div className="movie-grid">
        {isLoadingFavorites ? (
          // Show shimmer cards while loading favorites
          Array(6).fill(0).map((_, index) => (
            <MovieCardShimmer key={index} />
          ))
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
          <p>No favorites added</p>
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
          <nav className="header-nav">
            <button
              className={currentView === 'home' ? 'nav-link active' : 'nav-link'}
              onClick={() => setCurrentView('home')}
            >
              Home
            </button>
            <button
              className={currentView === 'favorites' ? 'nav-link active' : 'nav-link'}
              onClick={() => setCurrentView('favorites')}
            >
              Favorites
            </button>
          </nav>
        </div>
        <div className="header-right">
          <input
            type="text"
            className="search-input"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={handleSearch}
          />
          {/* <span className="username">{userProfile?.name || getUsername() || 'User'}</span> */}
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
              <div className="dropdown-item" onClick={() => setShowEditProfile(true)}>
                Edit Profile
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                Sign Out
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="movie-content">
        {error && <div className="error-message">{error}</div>}
        {currentView === 'home' && searchQuery.length > 2 ? (
          renderMovieCategory('Search Results', searchResults, isSearching)
        ) : currentView === 'home' ? (
          <>
            {renderMovieCategory('Popular Movies', movies.popular, isLoadingMovies)}
            {renderMovieCategory('Horror Movies', movies.horror, isLoadingMovies)}
            {renderMovieCategory('Comedy Movies', movies.comedy, isLoadingMovies)}
            {renderMovieCategory('Action Movies', movies.action, isLoadingMovies)}
          </>
        ) : (
          renderFavorites()
        )}
      </main>
    </div>
  );
};

export default MovieService;