package com.example.AuthService.repository;

import com.example.AuthService.domain.User;
import com.example.AuthService.exception.InvalidCredentialsException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    User findByEmailAndPassword(String mail, String password) throws InvalidCredentialsException;
}
