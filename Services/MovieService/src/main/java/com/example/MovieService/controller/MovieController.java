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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
                System.out.println("Returning profile data for " + email + ", image size: " + user.getProfileImage().length);
            } else {
                response.put("profileImage", null);
                System.out.println("No profile image found for: " + email);
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } else {
            System.out.println("User not found: " + email);
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
            Optional<User> userOptional = movieService.findByEmail(email);
            if (!userOptional.isPresent()) {
                return ResponseEntity.status(404).body("User not found with email: " + email);
            }

            User existingUser = userOptional.get();
            if (username != null && !username.trim().isEmpty()) {
                existingUser.setUsername(username);
            }

            if ("true".equals(removeImage)) {
                existingUser.setProfileImage(null);
                System.out.println("Removed profileImage from MongoDB");
            } else if (profileImage != null && !profileImage.isEmpty()) {
                byte[] imageBytes = profileImage.getBytes();
                existingUser.setProfileImage(imageBytes);
                System.out.println("Updated profileImage in MongoDB");
            }

            movieService.updateUser(existingUser);
            System.out.println("User saved to MongoDB");
            return ResponseEntity.ok("Profile updated successfully");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing image: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<List<Map<String,Object>>> getPopularMovies() {
        List<Map<String, Object>> movies = movieService.fetchPopularMovies();
        if (movies != null && !movies.isEmpty()) {
            return ResponseEntity.ok(movies);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String,Object>>> getMovies(@RequestParam String title) {
        List<Map<String, Object>> movies = movieService.fetchMoviesFromTmdb(title);
        if (movies != null && !movies.isEmpty()) {
            return ResponseEntity.ok(movies);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{email}/favorites")
    public ResponseEntity<List<Map<String,Object>>> getUserFavorites(@PathVariable String email) {
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
        if (!userOptional.isPresent()) {
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
        if (!userOptional.isPresent()) {
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
        List<Map<String, Object>> content = movieService.fetchMoviesByGenre(genreId, type);
        if (content != null && !content.isEmpty()) {
            return ResponseEntity.ok(content);
        }
        return ResponseEntity.notFound().build();
    }
}