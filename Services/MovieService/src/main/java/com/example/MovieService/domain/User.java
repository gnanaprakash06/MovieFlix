package com.example.MovieService.domain;

import jakarta.persistence.Lob;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String username;
    @Indexed(unique = true)
    private String email;
    private String password;

    @Lob
    private byte[] profileImage;
    private List<Map<String, Object>> favorites;

    public User() {}

    public User(String id, String username, String email, String password, byte[] profileImage) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.profileImage = profileImage;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public byte[] getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(byte[] profileImage) {
        this.profileImage = profileImage;
    }

    public List<Map<String, Object>> getFavorites() {
        return favorites;
    }

    public void setFavorites(List<Map<String, Object>> favorites) {
        this.favorites = favorites;
    }
}