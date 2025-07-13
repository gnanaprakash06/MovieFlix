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
    thriller: [],
    sciFi: [],
    fantasy: [],
    animation: []
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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [heroMovies, setHeroMovies] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isLoadingHero, setIsLoadingHero] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("popular");
  const [sortOrder, setSortOrder] = useState("a-z");

  const subscriptionPlans = [
    {
      name: "Basic",
      price: 199.00,
      priceId: "price_1RizszLfAxiezZFqDvjKOoEt",
      description: "Perfect for casual viewing with good quality streaming",
      popular: false,
      duration: "Monthly",
      bestFor: "Individual users",
      savings: null
    },
    {
      name: "Standard",
      price: 499.00,
      priceId: "price_1Rj0xYLfAxiezZFqczUP9j0h",
      description: "Great for families with multiple devices and premium features",
      popular: true,
      duration: "Quarterly",
      bestFor: "Small families",
      savings: "Save 15%"
    },
    {
      name: "Premium",
      price: 1499.00,
      priceId: "price_1Rj12sLfAxiezZFq58taqr2o",
      description: "Ultimate entertainment experience with the best quality and features",
      popular: false,
      duration: "Yearly",
      bestFor: "Large families",
      savings: "Save 25%"
    }
  ];

  const genres = [
    { id: "popular", name: "Popular", apiId: null },
    { id: "horror", name: "Horror", apiId: "27" },
    { id: "comedy", name: "Comedy", apiId: "35" },
    { id: "action", name: "Action", apiId: "28" },
    { id: "thriller", name: "Thriller", apiId: "53" },
    { id: "sciFi", name: "Sci-Fi", apiId: "878" },
    { id: "fantasy", name: "Fantasy", apiId: "14" },
    { id: "animation", name: "Animation", apiId: "16" }
  ];

  const sortMovies = (movies) => {
    if (!Array.isArray(movies)) return [];
    return [...movies].sort((a, b) => {
      const titleA = (a.title || a.name || "").toLowerCase();
      const titleB = (b.title || b.name || "").toLowerCase();
      if (sortOrder === "a-z") {
        return titleA.localeCompare(titleB);
      } else {
        return titleB.localeCompare(titleA);
      }
    });
  };

  useEffect(() => {
    if (!userEmail) {
      setError("No user email provided. Please sign in.");
      onNavigate("signin");
      return;
    }

    const storedUsername = getUsername();
    setUsername(storedUsername || userEmail.split("@")[0]);

    fetchUserProfile();
    fetchMovieCategories();
    fetchFavorites();
    fetchHeroMovies();
    fetchSubscriptionDetails();

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      setIsPaymentSuccess(true);
      handleSubscriptionSuccess(sessionId);
    }
  }, [userEmail]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) =>
        prevIndex === heroMovies.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);

  useEffect(() => {
    if (isPaymentSuccess && !isLoadingMovies && !isLoadingHero && subscriptionDetails?.subscriptionStatus === "active") {
      setAlertMessage("Payment Verified Successfully!");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setIsPaymentSuccess(false);
        window.history.replaceState({}, document.title, "/");
      }, 3000);
    } else if (!isLoadingMovies && subscriptionDetails?.subscriptionStatus !== "active") {
      setAlertMessage("Please subscribe to watch content");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  }, [isLoadingMovies, isLoadingHero, subscriptionDetails, isPaymentSuccess]);

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
          console.warn(`User profile not found for ${userEmail}, attempting to create...`);
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
          console.warn(`Favorites not found for ${userEmail}, initializing empty favorites...`);
          setFavorites([]);
          return;
        }
        throw new Error("Failed to fetch favorites");
      }
      const data = await response.json();
      setFavorites(sortMovies(data));
      setError(null);
    } catch (error) {
      console.error("Error fetching favorites:", error.message);
      setError(error.message || "Failed to load favorites");
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const fetchSubscriptionDetails = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:8081/api/movies/user/${userEmail}/subscription`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSubscriptionDetails(data);
      } else {
        setSubscriptionDetails({});
      }
    } catch (error) {
      console.error("Error fetching subscription details:", error.message);
      setSubscriptionDetails({});
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:8081/api/movies/user/${userEmail}/check-subscription`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.isActive;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error checking subscription status:", error.message);
      return false;
    }
  };

  const handleSubscriptionSuccess = async (sessionId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:8081/api/movies/user/${userEmail}/subscription/success`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        }
      );
      if (response.ok) {
        await fetchSubscriptionDetails();
        setShowChangePlan(false);
      } else {
        setError("Failed to process subscription");
      }
    } catch (error) {
      console.error("Error processing subscription success:", error.message);
      setError("Error processing subscription");
    }
  };

  const handleSelectPlan = async (priceId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:8081/api/movies/user/${userEmail}/subscription`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ priceId }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        setError("Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error initiating payment:", error.message);
      setError("Error initiating payment");
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `http://localhost:8081/api/movies/user/${userEmail}/subscription`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          await fetchSubscriptionDetails();
          setShowChangePlan(false);
          setAlertMessage("Subscription canceled successfully!");
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 3000);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to cancel subscription");
        }
      } catch (error) {
        console.error("Error canceling subscription:", error.message);
        setError("Error canceling subscription");
      }
    }
  };

  const filterMoviesByVoteCount = (movies, minVoteCount = 100) => {
    if (!Array.isArray(movies)) return [];
    return movies.filter((movie) => movie.vote_count >= minVoteCount);
  };

  const fetchMovieCategories = async () => {
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

      const [
        popularRes,
        horrorRes,
        comedyRes,
        actionRes,
        thrillerRes,
        sciFiRes,
        fantasyRes,
        animationRes
      ] = await Promise.all([
        fetch("http://localhost:8081/api/movies/popular", { headers }),
        fetch("http://localhost:8081/api/movies/content/genre?genreId=27&type=movie", { headers }),
        fetch("http://localhost:8081/api/movies/content/genre?genreId=35&type=movie", { headers }),
        fetch("http://localhost:8081/api/movies/content/genre?genreId=28&type=movie", { headers }),
        fetch("http://localhost:8081/api/movies/content/genre?genreId=53&type=movie", { headers }),
        fetch("http://localhost:8081/api/movies/content/genre?genreId=878&type=movie", { headers }),
        fetch("http://localhost:8081/api/movies/content/genre?genreId=14&type=movie", { headers }),
        fetch("http://localhost:8081/api/movies/content/genre?genreId=16&type=movie", { headers })
      ]);

      const [
        popular,
        horror,
        comedy,
        action,
        thriller,
        sciFi,
        fantasy,
        animation
      ] = await Promise.all([
        popularRes.json(),
        horrorRes.json(),
        comedyRes.json(),
        actionRes.json(),
        thrillerRes.json(),
        sciFiRes.json(),
        fantasyRes.json(),
        animationRes.json()
      ]);

      setMovies({
        popular: sortMovies(popular),
        horror: sortMovies(horror),
        comedy: sortMovies(comedy),
        action: sortMovies(action),
        thriller: sortMovies(thriller),
        sciFi: sortMovies(sciFi),
        fantasy: sortMovies(fantasy),
        animation: sortMovies(animation)
      });

      setError(null);
    } catch (error) {
      console.error("Error fetching movies:", error.message);
      setError("Failed to load movies. Please try again later.");
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
        const filteredHeroMovies = sortMovies(data.filter(movie => movie.vote_count >= 100).slice(0, 6));
        setHeroMovies(filteredHeroMovies);
      }
    } catch (error) {
      console.error("Error fetching hero movies:", error);
    } finally {
      setIsLoadingHero(false);
    }
  };

  const fetchMovieDetails = async (movieId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:8081/api/movies/details/${movieId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Failed to fetch movie details");
      }
    } catch (error) {
      console.error("Error fetching movie details:", error.message);
      setError("Failed to load movie details");
      return null;
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 1) {
      setIsSearching(true);
      try {
        const token = getAuthToken();
        const response = await fetch(
          `http://localhost:8081/api/movies/search?title=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(sortMovies(data));
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

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
    setSelectedGenre("popular");
    setSortOrder("a-z");
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
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
        setAlertMessage(`${movie.title || movie.name} added to favorites!`);
        setShowAlert(true);
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

  const handleMovieClick = async (movie) => {
    const isSubscribed = await checkSubscriptionStatus();
    if (isSubscribed) {
      const movieDetails = await fetchMovieDetails(movie.id);
      if (movieDetails) {
        setSelectedMovie(movieDetails);
        setShowMovieDetails(true);
      } else {
        setError("Failed to load movie details");
      }
    } else {
      setAlertMessage("Please subscribe to watch content");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  const handleProfileUpdate = () => {
    const storedUsername = getUsername();
    setUsername(storedUsername || userEmail.split("@")[0]);
    setShowEditProfile(false);
    fetchUserProfile();
  };

  const MovieCardShimmer = () => (
    <div className="movie-card shimmer-card">
      <div className="shimmer-poster"></div>
      <div className="shimmer-info">
        <div className="shimmer-title"></div>
      </div>
    </div>
  );

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
          Array(8)
            .fill(0)
            .map((_, index) => <MovieCardShimmer key={index} />)
        ) : movieList.length > 0 ? (
          sortMovies(movieList).map((movie) => (
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

  const renderFavorites = () => (
    <div className="movie-category">
      <h2 className="category-title favorites-title">Favorites</h2>
      <div className="movie-grid">
        {isLoadingFavorites ? (
          Array(6)
            .fill(0)
            .map((_, index) => <MovieCardShimmer key={index} />)
        ) : favorites.length > 0 ? (
          sortMovies(favorites).map((movie) => (
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

  const renderSubscriptions = () => (
    <div className="subscription-container">
      <h2 className="subscription-title">Your Subscription</h2>
      {subscriptionDetails?.subscriptionStatus === "active" ? (
        <div className="active-subscription">
          <h3>Active Subscription</h3>
          <p><strong>Plan:</strong> {subscriptionDetails.subscriptionPlan}</p>
          <p><strong>Price:</strong> ₹{subscriptionDetails.subscriptionPrice}</p>
          <p><strong>End Date:</strong> {subscriptionDetails.subscriptionEndDate}</p>
          <div className="subscription-actions">
            <button
              className="cancel-subscription-btn"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      ) : (
        <div className="subscription-plans">
          <div className="subscription-plans-header">
            <h3>Choose the plan that's right for you</h3>
            <p className="plans-subtitle">Join today, cancel anytime.</p>
          </div>
          <div className="plans-grid">
            {subscriptionPlans.map((plan) => (
              <div key={plan.name} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                <h4>{plan.name}</h4>
                <p className="plan-price">₹{plan.price}</p>
                <p className="plan-duration">{plan.name === 'Basic' ? 'per month' : plan.name === 'Standard' ? 'per quarter' : 'per year'}</p>
                <p className="plan-description">{plan.description}</p>
                <button
                  className="select-plan-btn"
                  onClick={() => handleSelectPlan(plan.priceId)}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderBrowseByGenre = () => (
    <div className="browse-genre-container">
      <h2 className="browse-genre-title">Browse by Genre</h2>
      <div className="genre-selector">
        <select
          value={selectedGenre}
          onChange={handleGenreChange}
          className="genre-select"
        >
          {genres.map(genre => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={handleSortChange}
          className="sort-select"
        >
          <option value="a-z">Sort A to Z</option>
          <option value="z-a">Sort Z to A</option>
        </select>
      </div>
      {renderMovieCategory(
        `${genres.find(g => g.id === selectedGenre)?.name} Movies`,
        movies[selectedGenre],
        isLoadingMovies
      )}
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

  return (
    <div className="movie-service-container">
      <div className={`background-content ${showMovieDetails ? 'blurred' : ''}`}>
        <Header
          username={username}
          userProfile={userProfile}
          currentView={currentView}
          setCurrentView={handleViewChange}
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          showSearchInput={showSearchInput}
          setShowSearchInput={setShowSearchInput}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          setShowEditProfile={setShowEditProfile}
          handleLogout={handleLogout}
        />

        <Alert
          message={alertMessage}
          isVisible={showAlert}
          onClose={() => setShowAlert(false)}
        />

        <main className="movie-content">
          {error && <div className="error-message">{error}</div>}
          {currentView === "home" && searchQuery.length >= 1 ? (
            <div className="search-results-container">
              <h2 className="search-results-title">
                {searchQuery.length === 1 ? 
                  `Movies starting with '${searchQuery}'` : 
                  `Search Results for '${searchQuery}'`
                }
              </h2>
              {isSearching ? (
                <div className="search-loading-container">
                  <div className="search-loading-spinner"></div>
                  <p className="search-loading-text">Searching for movies...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="movie-grid">
                  {sortMovies(searchResults).map((movie) => (
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
                  ))}
                </div>
              ) : (
                <div className="no-results-container">
                  <div className="no-results-content">
                    <svg className="search-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p className="no-results-message">No movies found starting with this letter</p>
                  </div>
                </div>
              )}
            </div>
          ) : currentView === "home" ? (
            <>
              <HeroSection />
              {renderMovieCategory("Popular Movies", movies.popular, isLoadingMovies)}
              {renderMovieCategory("Horror Movies", movies.horror, isLoadingMovies)}
              {renderMovieCategory("Comedy Movies", movies.comedy, isLoadingMovies)}
              {renderMovieCategory("Action Movies", movies.action, isLoadingMovies)}
              {renderMovieCategory("Thriller Movies", movies.thriller, isLoadingMovies)}
              {renderMovieCategory("Sci-Fi Movies", movies.sciFi, isLoadingMovies)}
              {renderMovieCategory("Fantasy Movies", movies.fantasy, isLoadingMovies)}
              {renderMovieCategory("Animation Movies", movies.animation, isLoadingMovies)}
            </>
          ) : currentView === "favorites" ? (
            renderFavorites()
          ) : currentView === "subscriptions" ? (
            renderSubscriptions()
          ) : (
            renderBrowseByGenre()
          )}
        </main>
      </div>
      {showMovieDetails && selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          onBack={() => {
            setShowMovieDetails(false);
            setSelectedMovie(null);
          }}
          isFavorite={favorites.some((fav) => fav.id === selectedMovie.id)}
          onToggleFavorite={() => {
            favorites.some((fav) => fav.id === selectedMovie.id)
              ? handleRemoveFromFavorites(selectedMovie.id)
              : handleAddToFavorites(selectedMovie);
          }}
        />
      )}
    </div>
  );
};
export default MovieService;