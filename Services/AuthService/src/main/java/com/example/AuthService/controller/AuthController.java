package com.example.AuthService.controller;

import com.example.AuthService.domain.Response;
import com.example.AuthService.domain.User;
import com.example.AuthService.exception.*;
import com.example.AuthService.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<Response> signup(@RequestBody Map<String, String> request) throws PasswordMismatchException, UserAlreadyExistsException {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");

        User user = new User(username, email, password);
        return authService.signup(user, confirmPassword);
    }

    @PostMapping("/login")
    public ResponseEntity<Response> login(@RequestBody Map<String, String> request) throws UserNotFoundException, InvalidCredentialsException, UserAlreadyExistsException {
        String email = request.get("email");
        String password = request.get("password");

        return authService.login(email, password);
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            // Assuming you have a user service/repository in auth service
            Optional<User> user = authService.findByEmail(email);
            if (user.isPresent()) {
                Map<String, Object> userData = new HashMap<>();
                userData.put("email", user.get().getEmail());
                userData.put("username", user.get().getUsername());
                // Don't include password for security
                return ResponseEntity.ok(userData);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching user: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Response> forgotPassword(@RequestBody Map<String, String> request) throws UserNotFoundException, AuthServiceException {
        String email = request.get("email");

        Response response = new Response();
        if (email == null || email.trim().isEmpty()) {
            response.setError("Email is required");
            return ResponseEntity.status(400).body(response);
        }

        return authService.initiatePasswordReset(email);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Response> resetPassword(@RequestBody Map<String, String> request) throws UserNotFoundException, PasswordMismatchException, AuthServiceException {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        Response response = new Response();

        if (email == null || email.trim().isEmpty()) {
            response.setError("Email is required");
            return ResponseEntity.status(400).body(response);
        }

        if (otp == null || otp.trim().isEmpty()) {
            response.setError("OTP is required");
            return ResponseEntity.status(400).body(response);
        }

        if (newPassword == null || newPassword.trim().isEmpty()) {
            response.setError("New password is required");
            return ResponseEntity.status(400).body(response);
        }

        if (confirmPassword == null || confirmPassword.trim().isEmpty()) {
            response.setError("Confirm password is required");
            return ResponseEntity.status(400).body(response);
        }

        return authService.resetPassword(email, otp, newPassword, confirmPassword);
    }
    @PutMapping("/user/{email}/username")
    public ResponseEntity<?> updateUsername(@PathVariable String email, @RequestBody Map<String, String> request) {
        try {
            String newUsername = request.get("username");
            if (newUsername == null || newUsername.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username cannot be empty");
            }

            Optional<User> userOpt = authService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();

            // Check if username is already taken by another user
            if (authService.existsByUsernameAndNotEmail(newUsername, email)) {
                return ResponseEntity.badRequest().body("Username is already taken");
            }

            user.setUsername(newUsername);
            authService.updateUser(user);

            return ResponseEntity.ok("Username updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating username: " + e.getMessage());
        }
    }

}