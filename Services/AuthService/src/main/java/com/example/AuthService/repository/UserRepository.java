package com.example.AuthService.repository;

import com.example.AuthService.domain.User;
import com.example.AuthService.exception.UserAlreadyExistsException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username) throws UserAlreadyExistsException;
    Optional<User> findByEmail(String email) throws UserAlreadyExistsException;
}
