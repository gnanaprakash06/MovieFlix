package com.example.AuthService.controller;

import com.example.AuthService.domain.Response;
import com.example.AuthService.domain.User;
import com.example.AuthService.exception.*;
import com.example.AuthService.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
        String phoneNumber = request.get("phoneNumber");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");

        User user = new User(username, email, phoneNumber, password);
        return authService.signup(user, confirmPassword);

    }

    @PostMapping("/login")
    public ResponseEntity<Response> login(@RequestBody Map<String, String> request) throws UserNotFoundException, InvalidCredentialsException, UserAlreadyExistsException {
        String email = request.get("email");
        String password = request.get("password");

        return authService.login(email, password);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Response> forgotPassword(@RequestBody Map<String, String> request) throws UserNotFoundException, AuthServiceException, AuthServiceException {
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

        // Validate required fields
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

}