package com.example.AuthService.services;

import com.example.AuthService.domain.Response;
import com.example.AuthService.domain.User;
import com.example.AuthService.exception.*;
import com.example.AuthService.repository.UserRepository;
import com.example.AuthService.security.SecurityTokenGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityTokenGenerator tokenGenerator;
    private final EmailService emailService;
    private final OTPService otpService;


    public AuthService(UserRepository userRepository, SecurityTokenGenerator tokenGenerator, PasswordEncoder passwordEncoder, EmailService emailService, OTPService otpService) {
        this.userRepository = userRepository;
        this.tokenGenerator = tokenGenerator;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.otpService = otpService;
    }

    public ResponseEntity<Response> signup(User user, String confirmPassword) throws UserAlreadyExistsException, PasswordMismatchException {

        // Check if user with username or email already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new UserAlreadyExistsException("Username " + user.getUsername() + " is already taken");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new UserAlreadyExistsException("User with email " + user.getEmail() + " already exists");
        }

        // Check password confirmation
        if (!user.getPassword().equals(confirmPassword)) {
            throw new PasswordMismatchException("Password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        Response response = new Response();
        response.setMessage("User Registered Successfully");
        response.setUser(savedUser);
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Response> login(String email, String password) throws InvalidCredentialsException, UserNotFoundException, UserAlreadyExistsException {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if(userOpt.isEmpty()) {
            throw new UserNotFoundException("User with the email " + email + " not found");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Password is incorrect");
        }

        String token = tokenGenerator.createToken(user);
        Response response = new Response();
        response.setMessage("Login successful");
        response.setToken(token);

        return ResponseEntity.ok(response);
    }

    // For forgot password flow - Step 1: Send OTP to user's email
    public ResponseEntity<Response> initiatePasswordReset(String email) throws UserNotFoundException, AuthServiceException {
        Response response = new Response();

        if (!userRepository.existsByEmail(email)) {
            throw new UserNotFoundException("User with email " + email + " not found");
        }

        try {
            String otp = otpService.generateOTP(email);
            emailService.sendOTPEmail(email, otp);
            response.setMessage("OTP sent to your email");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new AuthServiceException("Failed to initiate password reset: " + e.getMessage(), e);
        }
    }

    // For forgot password flow - Step 2: Verify OTP and reset password
    public ResponseEntity<Response> resetPassword(String email, String otp, String newPassword, String confirmPassword) throws PasswordMismatchException, UserNotFoundException, AuthServiceException {
        Response response = new Response();

        // Validate OTP first
        if (!otpService.validateOTP(email, otp)) {
            response.setError("Invalid or expired OTP");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new UserNotFoundException("User with email " + email + " not found");
        }

        User user = userOpt.get();

        // Check password confirmation
        if (!newPassword.equals(confirmPassword)) {
            throw new PasswordMismatchException("New password and confirm password do not match");
        }

        // Check if new password is same as old password
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
//            response.setError("New password cannot be the same as the old password");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            throw new PasswordMismatchException("New password cannot be the same as the old password");
        }

        try {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            otpService.clearOTP(email); // Clear the OTP after successful reset

            response.setMessage("Password reset successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new AuthServiceException("Failed to reset password: " + e.getMessage(), e);
        }
    }

}
