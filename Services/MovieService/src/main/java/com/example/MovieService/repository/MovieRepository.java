package com.example.MovieService.repository;

import com.example.MovieService.domain.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends MongoRepository<User,String > {

    Optional<User> findByEmail(String email);

    List<User> findAllByEmail(String email);

}
