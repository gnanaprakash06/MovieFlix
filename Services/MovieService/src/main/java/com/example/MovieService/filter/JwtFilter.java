package com.example.MovieService.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;

public class JwtFilter extends GenericFilterBean {

public void doFilter (ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
                        throws IOException, ServletException {

    HttpServletRequest request =(HttpServletRequest)servletRequest;
    HttpServletResponse response = (HttpServletResponse) servletResponse;

    String path =request.getRequestURI(); // Get the request URL

    // Enforce filter security in JWT Validation of Signup & Login
    if (path.contains("/signup") || path.contains("/login")) {
        filterChain.doFilter(request, response);
        return;
    }

    final String authHeader =request.getHeader("Authorization");

    if (request.getMethod().equals("OPTIONS")) {
        response.setStatus(HttpServletResponse.SC_OK);
        filterChain.doFilter(request, response);
        return;
    }

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        throw new ServletException("Missing or Invalid Token");
    }

    String token = authHeader.substring(7); // Remove the prefix "Bearer "

    Claims claims = Jwts.parser()
            .setSigningKey("secretKey")  // Ensure this matches the secret used for signing
            .parseClaimsJws(token)
            .getBody();

    request.setAttribute("claims", claims);

    filterChain.doFilter(request, response);
}
}
