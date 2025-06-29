package com.example.MovieService.feignClient;

import com.example.MovieService.dto.UserDTO;
import jakarta.annotation.PostConstruct;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "auth-service", url = "http://localhost:8080")
public interface UserAuthClient {

    @PostMapping("/api/auth/signup")
    ResponseEntity<UserDTO> registerUser(@RequestBody UserDTO user);

    @GetMapping("/api/auth/users/{email}")
    ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email);

}
