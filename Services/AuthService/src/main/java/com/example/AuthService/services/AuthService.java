package com.example.AuthService.services;

import com.example.AuthService.domain.Response;
import com.example.AuthService.domain.User;
import com.example.AuthService.exception.InvalidCredentialsException;
import com.example.AuthService.exception.PasswordMismatchException;
import com.example.AuthService.exception.UserAlreadyExistsException;
import com.example.AuthService.exception.UserNotFoundException;
import com.example.AuthService.repository.UserRepository;
import com.example.AuthService.security.SecurityTokenGenerator;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityTokenGenerator tokenGenerator;


    public AuthService(UserRepository userRepository, SecurityTokenGenerator tokenGenerator, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenGenerator = tokenGenerator;
        this.passwordEncoder = passwordEncoder;
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
}
