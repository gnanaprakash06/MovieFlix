package com.example.AuthService.security;

import com.example.AuthService.domain.User;

public interface SecurityTokenGenerator {
    String generateToken(User user);
}
