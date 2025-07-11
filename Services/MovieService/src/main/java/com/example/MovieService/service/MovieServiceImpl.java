package com.example.MovieService.service;

import com.example.MovieService.domain.User;
import com.example.MovieService.exception.UserAlreadyExistsException;
import com.example.MovieService.feignClient.UserAuthClient;
import com.example.MovieService.repository.MovieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final UserAuthClient userAuthClient;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String tmdbApiKey = "4833b1d3a2c00e56714bd2905095d5c8";
    private static final String tmdbBaseUrl = "https://api.themoviedb.org/3";
    private static final Logger logger = LoggerFactory.getLogger(MovieServiceImpl.class);

    public MovieServiceImpl(MovieRepository movieRepository, UserAuthClient userAuthClient) {
        this.movieRepository = movieRepository;
        this.userAuthClient = userAuthClient;
    }

    @Override
    public List<User> findAllByEmail(String email) {
        return movieRepository.findAllByEmail(email);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return movieRepository.findByEmail(email);
    }

    @Override
    public void registerUser(User user) throws UserAlreadyExistsException {
        if (movieRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("User with email " + user.getEmail() + " already exists.");
        }
        user.setPassword(null);
        movieRepository.save(user);
    }

    @Override
    public void createProfile(User user) {
        logger.debug("Creating profile for: {}", user.getEmail());
        user.setPassword(null);
        if (user.getFavorites() == null) {
            user.setFavorites(new ArrayList<>());
        }
        movieRepository.save(user);
        logger.debug("Profile created successfully: {}", user.getEmail());
    }

    @Override
    public void updateUser(User user) {
        logger.debug("Attempting to save user: {}", user.getEmail());
        movieRepository.save(user);
        logger.debug("User saved successfully: {}", user.getEmail());
    }

    @Override
    public List<Map<String, Object>> fetchPopularMovies() {
        String url = tmdbBaseUrl + "/movie/popular?api_key=" + tmdbApiKey;
        try {
            ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> response = responseEntity.getBody();
            if (response != null && response.containsKey("results")) {
                List<Map<String, Object>> movies = (List<Map<String, Object>>) response.get("results");
                // Filter by vote count
                return enrichMoviesWithTrailersAndLogos(movies.stream()
                        .filter(movie -> {
                            Integer voteCount = (Integer) movie.get("vote_count");
                            return voteCount != null && voteCount >= 100;
                        })
                        .collect(Collectors.toList()));
            }
            return new ArrayList<>();
        } catch (Exception e) {
            logger.debug("Error fetching popular movies: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> fetchMoviesByGenre(String genreId, String type) {
        String endpoint = "movie".equals(type) ? "movie" : "tv";
        String url = String.format(tmdbBaseUrl + "/discover/%s?api_key=%s&with_genres=%s", endpoint, tmdbApiKey, genreId);
        try {
            ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> response = responseEntity.getBody();
            if (response != null && response.containsKey("results")) {
                List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("results");
                // Filter by vote count
                return enrichMoviesWithTrailersAndLogos(content.stream()
                        .filter(movie -> {
                            Integer voteCount = (Integer) movie.get("vote_count");
                            return voteCount != null && voteCount >= 100;
                        })
                        .collect(Collectors.toList()));
            }
            return new ArrayList<>();
        } catch (Exception e) {
            logger.debug("Error fetching movies by genre {}: {}", genreId, e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> fetchMoviesFromTmdb(String title) {
        // Remove any wildcard characters that might cause issues
        String sanitizedTitle = title.replace("*", "").replace("?", "").trim();

        // Handle single-letter search
        if (sanitizedTitle.length() == 1) {
            String letter = sanitizedTitle.toLowerCase();
            String url = tmdbBaseUrl + "/discover/movie?api_key=" + tmdbApiKey;
            try {
                logger.debug("Fetching movies starting with letter: {}", letter);
                ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
                Map<String, Object> response = responseEntity.getBody();
                logger.debug("TMDB Discover Response: {}", response);
                if (response != null && response.containsKey("results")) {
                    List<Map<String, Object>> movies = (List<Map<String, Object>>) response.get("results");

                    // Remove duplicates based on movie ID
                    Map<String, Map<String, Object>> uniqueMovies = new HashMap<>();
                    for (Map<String, Object> movie : movies) {
                        String movieId = movie.get("id").toString();
                        uniqueMovies.putIfAbsent(movieId, movie);
                    }

                    // Filter movies starting with the specified letter
                    List<Map<String, Object>> filteredMovies = uniqueMovies.values().stream()
                            .filter(movie -> {
                                String movieTitle = (String) movie.get("title");
                                Integer voteCount = (Integer) movie.get("vote_count");
                                return movieTitle != null &&
                                        !movieTitle.isEmpty() &&
                                        movieTitle.toLowerCase().startsWith(letter) &&
                                        voteCount != null &&
                                        voteCount >= 100;
                            })
                            .collect(Collectors.toList());

                    logger.debug("Found {} movies starting with letter {}", filteredMovies.size(), letter);
                    return enrichMoviesWithTrailersAndLogos(filteredMovies);
                }
                logger.debug("No results found for letter {}", letter);
                return new ArrayList<>();
            } catch (Exception e) {
                logger.debug("Error fetching movies for letter {}: {}", letter, e.getMessage());
                e.printStackTrace();
                return new ArrayList<>();
            }
        } else {
            // Handle multi-character search
            String url = tmdbBaseUrl + "/search/movie?api_key=" + tmdbApiKey + "&query=" + sanitizedTitle;
            try {
                logger.debug("Searching movies with URL: {}", url);
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                logger.debug("TMDB Search Response: {}", response);
                if (response != null && response.containsKey("results")) {
                    List<Map<String, Object>> movies = (List<Map<String, Object>>) response.get("results");

                    // Remove duplicates based on movie ID
                    Map<String, Map<String, Object>> uniqueMovies = new HashMap<>();
                    for (Map<String, Object> movie : movies) {
                        String movieId = movie.get("id").toString();
                        uniqueMovies.putIfAbsent(movieId, movie);
                    }

                    // Filter movies containing the search query
                    List<Map<String, Object>> filteredMovies = uniqueMovies.values().stream()
                            .filter(movie -> {
                                String movieTitle = (String) movie.get("title");
                                Integer voteCount = (Integer) movie.get("vote_count");
                                return movieTitle != null &&
                                        movieTitle.toLowerCase().contains(sanitizedTitle.toLowerCase()) &&
                                        voteCount != null &&
                                        voteCount >= 100;
                            })
                            .collect(Collectors.toList());

                    return enrichMoviesWithTrailersAndLogos(filteredMovies);
                }
                return new ArrayList<>();
            } catch (Exception e) {
                logger.debug("Error searching movies: {}", e.getMessage());
                e.printStackTrace();
                return new ArrayList<>();
            }
        }
    }

    @Override
    public Map<String, Object> fetchMovieDetails(String movieId) {
        String url = tmdbBaseUrl + "/movie/" + movieId + "?api_key=" + tmdbApiKey;
        try {
            logger.debug("Fetching movie details for ID {} with URL: {}", movieId, url);
            Map<String, Object> movie = restTemplate.getForObject(url, Map.class);
            if (movie != null) {
                List<Map<String, Object>> movies = new ArrayList<>();
                movies.add(movie);
                return enrichMoviesWithTrailersAndLogos(movies).get(0);
            }
            logger.debug("No movie found for ID: {}", movieId);
            return null;
        } catch (Exception e) {
            logger.debug("Error fetching movie details for ID {}: {}", movieId, e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public Map<String, Object> getSubscriptionDetails(String email) {
        Optional<User> userOptional = movieRepository.findByEmail(email);
        Map<String, Object> subscriptionDetails = new HashMap<>();
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            subscriptionDetails.put("subscriptionPlan", user.getSubscriptionPlan());
            subscriptionDetails.put("subscriptionPrice", user.getSubscriptionPrice());
            subscriptionDetails.put("subscriptionEndDate", user.getSubscriptionEndDate());
            subscriptionDetails.put("subscriptionStatus", user.getSubscriptionStatus());
        }
        return subscriptionDetails;
    }

    @Override
    public void updateSubscription(String email, String plan, Double price, String endDate, String status) {
        Optional<User> userOptional = movieRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setSubscriptionPlan(plan);
            user.setSubscriptionPrice(price);
            user.setSubscriptionEndDate(endDate);
            user.setSubscriptionStatus(status);
            movieRepository.save(user);
            logger.debug("Subscription updated for user: {}", email);
        }
    }

    @Override
    public void cancelSubscription(String email) {
        Optional<User> userOptional = movieRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setSubscriptionPlan(null);
            user.setSubscriptionPrice(null);
            user.setSubscriptionEndDate(null);
            user.setSubscriptionStatus("inactive");
            movieRepository.save(user);
            logger.debug("Subscription canceled for user: {}", email);
        } else {
            logger.debug("User not found for subscription cancellation: {}", email);
        }
    }

    private List<Map<String, Object>> enrichMoviesWithTrailersAndLogos(List<Map<String, Object>> movies) {
        for (Map<String, Object> movie : movies) {
            Integer movieId = (Integer) movie.get("id");

            // Trailer
            String videoUrl = tmdbBaseUrl + "/movie/" + movieId + "/videos?api_key=" + tmdbApiKey;
            try {
                Map<String, Object> videoResponse = restTemplate.getForObject(videoUrl, Map.class);
                if (videoResponse != null && videoResponse.containsKey("results")) {
                    List<Map<String, Object>> videos = (List<Map<String, Object>>) videoResponse.get("results");
                    Optional<Map<String, Object>> trailer = videos.stream()
                            .filter(video -> {
                                String type = (String) video.get("type");
                                String site = (String) video.get("site");
                                return ("Trailer".equals(type) || "Teaser".equals(type)) && "YouTube".equals(site);
                            })
                            .findFirst();
                    if (trailer.isPresent()) {
                        String videoKey = (String) trailer.get().get("key");
                        movie.put("trailerUrl", "https://www.youtube.com/embed/" + videoKey);
                    } else {
                        movie.put("trailerUrl", null);
                    }
                } else {
                    movie.put("trailerUrl", null);
                }
            } catch (Exception e) {
                movie.put("trailerUrl", null);
                logger.debug("Error fetching videos for movie ID {}: {}", movieId, e.getMessage());
            }

            // Logos
            String imagesUrl = tmdbBaseUrl + "/movie/" + movieId + "/images?api_key=" + tmdbApiKey + "&include_image_language=en,null";
            try {
                Map<String, Object> imagesResponse = restTemplate.getForObject(imagesUrl, Map.class);
                if (imagesResponse != null && imagesResponse.containsKey("logos")) {
                    List<Map<String, Object>> logos = (List<Map<String, Object>>) imagesResponse.get("logos");
                    Optional<Map<String, Object>> logoOpt = logos.stream()
                            .filter(logo -> "en".equals(logo.get("iso_639_1")))
                            .findFirst()
                            .or(() -> logos.stream().findFirst());
                    if (logoOpt.isPresent()) {
                        String logoPath = (String) logoOpt.get().get("file_path");
                        movie.put("logo_path", "https://image.tmdb.org/t/p/original" + logoPath);
                    } else {
                        movie.put("logo_path", null);
                    }
                } else {
                    movie.put("logo_path", null);
                }
            } catch (Exception e) {
                movie.put("logo_path", null);
                logger.debug("Error fetching logos for movie ID {}: {}", movieId, e.getMessage());
            }
        }
        return movies;
    }
}