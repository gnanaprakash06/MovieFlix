package com.example.MovieService.domain;

import jakarta.persistence.Lob;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;
import java.util.Map;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String username;
    @Indexed(unique = true)
    @Field("email")
    private String email;
    private String password;

    @Lob
    private byte[] profileImage;
    private List<Map<String, Object>> favorites;

    // Subscription fields
    private String subscriptionPlan; // e.g., "Monthly", "Quarterly", "Yearly"
    private Double subscriptionPrice; // e.g., 199.00, 499.00, 1499.00
    private String subscriptionEndDate; // ISO date string
    private String subscriptionStatus; // e.g., "active", "inactive"

    public User() {}

    public User(String id, String username, String email, String password, byte[] profileImage) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.profileImage = profileImage;
    }
    // Getters and Setters
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

    // Subscription Getters and Setters
    public String getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(String subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }

    public Double getSubscriptionPrice() {
        return subscriptionPrice;
    }

    public void setSubscriptionPrice(Double subscriptionPrice) {
        this.subscriptionPrice = subscriptionPrice;
    }

    public String getSubscriptionEndDate() {
        return subscriptionEndDate;
    }

    public void setSubscriptionEndDate(String subscriptionEndDate) {
        this.subscriptionEndDate = subscriptionEndDate;
    }

    public String getSubscriptionStatus() {
        return subscriptionStatus;
    }

    public void setSubscriptionStatus(String subscriptionStatus) {
        this.subscriptionStatus = subscriptionStatus;
    }
}