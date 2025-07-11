package com.example.MovieService.service;

import com.example.MovieService.domain.User;
import com.example.MovieService.exception.UserAlreadyExistsException;
import com.example.MovieService.feignClient.UserAuthClient;
import com.example.MovieService.repository.MovieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final UserAuthClient userAuthClient;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    @Value("${tmdb.base.url}")
    private String tmdbBaseUrl; // TMDB URL

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
        user.setPassword(null); //Don't store the password in movie service
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
            logger.debug("Fetching popular movies from: {}", url);
            ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> response = responseEntity.getBody();
            logger.debug("TMDB Popular Response: {}", response);
            if (response != null && response.containsKey("results")) {
                List<Map<String, Object>> movies = (List<Map<String, Object>>) response.get("results");
                logger.debug("Found {} popular movies", movies.size());
                return enrichMoviesWithTrailersAndLogos(movies);
            }
            logger.debug("No results found in TMDB response");
            return new ArrayList<>();
        } catch (Exception e) {
            logger.debug("Error fetching popular movies: {}", e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> fetchMoviesFromTmdb(String title) {
        String url = tmdbBaseUrl + "/search/movie?api_key=" + tmdbApiKey + "&query=" + title;
        try {
            logger.debug("Searching movies with URL: {}", url);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            logger.debug("TMDB Search Response: {}", response);

            if (response != null && response.containsKey("results")) {
                List<Map<String, Object>> movies = (List<Map<String, Object>>) response.get("results");
                return enrichMoviesWithTrailersAndLogos(movies);
            }
            return new ArrayList<>();
        } catch (Exception e) {
            logger.debug("Error searching movies: {}", e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> fetchMoviesByGenre(String genreId, String type) {
        String endpoint = "movie".equals(type) ? "movie" : "tv";
        String url = String.format(tmdbBaseUrl + "/discover/%s?api_key=%s&with_genres=%s", endpoint, tmdbApiKey, genreId);
        logger.debug("Fetching {} by genre - URL: {}", type, url);
        try {
            ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> response = responseEntity.getBody();
            logger.debug("Genre fetch response status: {}", responseEntity.getStatusCode());
            if (response != null && response.containsKey("results")) {
                List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("results");
                logger.debug("Found " + content.size() + " items for genre " + genreId);
                return enrichMoviesWithTrailersAndLogos(content);
            }
            logger.debug("No results found for genre {}", genreId);
            return new ArrayList<>();
        } catch (Exception e) {
            logger.debug("Error fetching movies by genre {}: {}", genreId, e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
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
                    for (Map<String, Object> video : videos) {
                        String type = (String) video.get("type");
                        String site = (String) video.get("site");
                        if (("Trailer".equals(type) || "Teaser".equals(type)) && "YouTube".equals(site)) {
                            String videoKey = (String) video.get("key");
                            movie.put("trailerUrl", "https://www.youtube.com/embed/" + videoKey);
                            break;
                        }
                    }
                }
            } catch (Exception e) {
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
