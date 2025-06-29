package com.example.AuthService.security;

import com.example.AuthService.domain.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JWTSecurityTokenGeneratorImpl implements SecurityTokenGenerator{

    @Value("${jwt.secret}")
    private String secretKey;

    @Override
    public String createToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        return generateToken(claims,user.getEmail());
    }

    private String generateToken(Map<String, Object> claims, String email) {
        return Jwts.builder()
                .setIssuer("auth-service")
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }
}
