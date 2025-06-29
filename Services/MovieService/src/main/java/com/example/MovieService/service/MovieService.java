package com.example.MovieService.service;

import com.example.MovieService.domain.User;
import com.example.MovieService.exception.UserAlreadyExistsException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface MovieService {

    void registerUser(User user) throws UserAlreadyExistsException; //Calls UserAuthService

    List<Map<String, Object>> fetchMoviesFromTmdb(String title);



    List<Map<String, Object>> fetchPopularMovies();
    Optional<User> findByEmail(String email);

    void updateUser(User existingUser);

    List<Map<String, Object>> fetchMoviesByGenre(String genreId, String type);
    List<User> findAllByEmail(String email);

}
