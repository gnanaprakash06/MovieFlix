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
public class AuthServiceImpl{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityTokenGenerator tokenGenerator;


    public AuthServiceImpl(UserRepository userRepository, SecurityTokenGenerator tokenGenerator, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenGenerator = tokenGenerator;
        this.passwordEncoder = passwordEncoder;
    }

    public ResponseEntity<Response> signup(User user, String confirmPassword) throws UserAlreadyExistsException, PasswordMismatchException {
        Response response = new Response();
        // Checks if User with the username already exists
        if (user != null) {
            Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
            if (existingUser.isPresent() && !existingUser.get().getUsername().equals(user.getUsername())) {
                throw new UserAlreadyExistsException();
            }
        }

        // Checks if user with email already exists
//        if (user != null && userRepository.findByEmail(user.getEmail())) {
//            throw new UserAlreadyExistsException();
//        }

        // Check password confirmation
        if (user != null && !user.getPassword().equals(confirmPassword)) {
            throw new PasswordMismatchException();
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        response.setMessage("User Registered Successfully");
        response.setUser(savedUser);
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Response> login(String email, String password) throws InvalidCredentialsException, UserNotFoundException, UserAlreadyExistsException {
        Response response = new Response();
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        String token = tokenGenerator.createToken(user);
        response.setMessage("Login successful");
        response.setToken(token);

        return ResponseEntity.ok(response);
    }
}
