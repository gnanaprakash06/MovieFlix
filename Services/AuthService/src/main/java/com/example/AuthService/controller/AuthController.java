package com.example.AuthService.controller;

import com.example.AuthService.domain.Response;
import com.example.AuthService.domain.User;
import com.example.AuthService.exception.InvalidCredentialsException;
import com.example.AuthService.exception.PasswordMismatchException;
import com.example.AuthService.exception.UserAlreadyExistsException;
import com.example.AuthService.exception.UserNotFoundException;
import com.example.AuthService.services.AuthServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("api/auth")
public class AuthController {

    private final AuthServiceImpl authServiceImpl;

    public AuthController(AuthServiceImpl authServiceImpl) {
        this.authServiceImpl = authServiceImpl;
    }

    @PostMapping("/signup")
    public ResponseEntity<Response> signup(@RequestBody Map<String, String> request) throws PasswordMismatchException, UserAlreadyExistsException {
        String username = request.get("username");
        String email = request.get("email");
        String phoneNumber = request.get("phoneNumber");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");

        User user = new User(username, email, phoneNumber, password);
        return authServiceImpl.signup(user, confirmPassword);

    }

    @PostMapping("/login")
    public ResponseEntity<Response> login(@RequestBody Map<String, String> request) throws UserNotFoundException, InvalidCredentialsException, UserAlreadyExistsException {
        String email = request.get("email");
        String password = request.get("password");

        return authServiceImpl.login(email, password);
    }
}
