package com.example.MovieService.controller;

import com.example.MovieService.domain.User;
import com.example.MovieService.dto.UserDTO;
import com.example.MovieService.exception.UserAlreadyExistsException;
import com.example.MovieService.feignClient.UserAuthClient;
import com.example.MovieService.service.MovieService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowedHeaders = "*")
public class MovieController {

    private final UserAuthClient userAuthClient;
    private final MovieService movieService;
    private static final Logger logger = LoggerFactory.getLogger(MovieController.class);

    public MovieController(UserAuthClient userAuthClient, MovieService movieService) {
        this.userAuthClient = userAuthClient;
        this.movieService = movieService;
    }

    @PostMapping(value = "/signup", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registerUser(@RequestParam("users") @Valid User user,
                                          @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        try {
            if (profileImage != null && !profileImage.isEmpty()) {
                user.setProfileImage(profileImage.getBytes());
            }
            UserDTO authUser = new UserDTO();
            authUser.setEmail(user.getEmail());
            authUser.setPassword(user.getPassword());
            userAuthClient.registerUser(authUser);
            movieService.registerUser(user);
            return ResponseEntity.ok(user);
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing image: " + e.getMessage());
        } catch (MaxUploadSizeExceededException e) {
            return ResponseEntity.badRequest().body("File size exceeds limit (10MB)");
        }
    }

    // ADD THIS NEW ENDPOINT - Missing create profile endpoint
    @PostMapping("/users/{email}/create-profile")
    public ResponseEntity<?> createProfile(@PathVariable String email, @RequestBody Map<String, String> profileData) {
        try {
            Optional<User> existingUser = movieService.findByEmail(email);
            if (existingUser.isPresent()) {
                return ResponseEntity.ok(existingUser.get());
            }

            // Fetch username from auth service
            String username = fetchUsernameFromAuthService(email);
            if (username == null) {
                username = email.split("@")[0]; // Fallback to email prefix
            }

            // Create new user profile
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(username);
            newUser.setFavorites(new ArrayList<>());

            movieService.createProfile(newUser);
            return ResponseEntity.ok("Profile created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating profile: " + e.getMessage());
        }
    }

    private String fetchUsernameFromAuthService(String email) {
        try {
            // Make HTTP request to auth service to get user details
            RestTemplate restTemplate = new RestTemplate();
            String authServiceUrl = "http://localhost:8080/api/auth/user/" + email;

            ResponseEntity<Map> response = restTemplate.getForEntity(authServiceUrl, Map.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> userData = response.getBody();
                return (String) userData.get("username");
            }
        } catch (Exception e) {
            System.err.println("Error fetching username from auth service: " + e.getMessage());
        }
        return null;
    }

    @GetMapping("/users/{email}/profile")
    public ResponseEntity<?> getProfileData(@PathVariable String email) {
        Optional<User> userOptional = movieService.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Map<String, Object> response = new HashMap<>();
            response.put("name", user.getUsername());
            response.put("email", user.getEmail());
            if (user.getProfileImage() != null && user.getProfileImage().length > 0) {
                String base64Image = Base64.getEncoder().encodeToString(user.getProfileImage());
                response.put("profileImage", base64Image);
                logger.debug("Returning profile data for {}, image size: {}", email, user.getProfileImage().length);
            } else {
                response.put("profileImage", null);
                logger.debug("No profile image found for: {}", email);
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } else {
            logger.debug("User not found: {}", email);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping(value = "/users/{email}/profile", consumes = {"multipart/form-data"})
    public ResponseEntity<String> updateProfile(
            @PathVariable String email,
            @RequestParam(value = "username", required = false) String username,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestParam(value = "removeImage", required = false) String removeImage) {
        try {
            Optional<User> userOpt = movieService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found with email: " + email);
            }

            User existingUser = userOpt.get();
            if (username != null && !username.isBlank()) {
                existingUser.setUsername(username);
                // Update username in Auth Service SQL database
                updateUsernameInAuthService(email, username);
            }

            if ("true".equals(removeImage)) {
                existingUser.setProfileImage(null);
                logger.debug("Removed profileImage from MongoDB");
            }

            if (profileImage != null) {
                existingUser.setProfileImage(profileImage.getBytes());
                logger.debug("Updated profileImage in MongoDB");
            }

            movieService.updateUser(existingUser);
            logger.debug("User saved to MongoDB");
            return ResponseEntity.ok("Profile updated successfully");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing image: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

    private void updateUsernameInAuthService(String email, String username) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String authServiceUrl = "http://localhost:8080/api/auth/user/" + email + "/username";

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("username", username);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    authServiceUrl,
                    HttpMethod.PUT,
                    entity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                logger.debug("Username updated successfully in Auth Service");
            }
        } catch (Exception e) {
            logger.error("Error updating username in Auth Service: " + e.getMessage());
            // Don't throw exception to avoid breaking the profile update
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<List<Map<String, Object>>> getPopularMovies() {
        try {
            List<Map<String, Object>> movies = movieService.fetchPopularMovies();
            if (movies != null && !movies.isEmpty()) {
                return ResponseEntity.ok(movies);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("Error in getPopularMovies: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> getMovies(@RequestParam String title) {
        try {
            List<Map<String, Object>> movies = movieService.fetchMoviesFromTmdb(title);
            if (movies != null && !movies.isEmpty()) {
                return ResponseEntity.ok(movies);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("Error in searchMovies: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/user/{email}/favorites")
    public ResponseEntity<List<Map<String, Object>>> getUserFavorites(@PathVariable String email) {
        Optional<User> userOptional = movieService.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            List<Map<String, Object>> favorites = user.getFavorites() != null ? user.getFavorites() : new ArrayList<>();
            return ResponseEntity.ok(favorites);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/user/{email}/favorites")
    public ResponseEntity<String> addMovieToFavorites(@PathVariable String email, @RequestBody Map<String, Object> movie) {
        Optional<User> userOptional = movieService.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(404).body("User not found with email: " + email);
        }

        User user = userOptional.get();
        List<Map<String, Object>> favorites = user.getFavorites() != null ? new ArrayList<>(user.getFavorites()) : new ArrayList<>();
        String movieId = movie.get("id").toString();
        boolean movieExists = favorites.stream().anyMatch(fav -> fav.get("id").toString().equals(movieId));
        if (!movieExists) {
            favorites.add(movie);
            user.setFavorites(favorites);
            movieService.updateUser(user);
            logger.debug("test");
            return ResponseEntity.status(201).body("Movie added to favorites");
        }
        return ResponseEntity.ok("Movie already in favorites");
    }

    @DeleteMapping("/user/{email}/favorites/{movieId}")
    public ResponseEntity<String> removeMovieFromFavorites(
            @PathVariable String email,
            @PathVariable String movieId) {
        Optional<User> userOptional = movieService.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(404).body("User not found with email: " + email);
        }

        User user = userOptional.get();
        List<Map<String, Object>> favorites = user.getFavorites() != null ? new ArrayList<>(user.getFavorites()) : new ArrayList<>();
        boolean removed = favorites.removeIf(movie -> movie.get("id").toString().equals(movieId));
        if (removed) {
            user.setFavorites(favorites);
            movieService.updateUser(user);
            return ResponseEntity.ok("Movie removed from favorites");
        }
        return ResponseEntity.ok("Movie not found in favorites");
    }

    @GetMapping("/content/genre")
    public ResponseEntity<List<Map<String, Object>>> getContentByGenre(
            @RequestParam String genreId,
            @RequestParam String type) {
        try {
            List<Map<String, Object>> content = movieService.fetchMoviesByGenre(genreId, type);
            if (content != null && !content.isEmpty()) {
                return ResponseEntity.ok(content);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("Error in getContentByGenre: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}