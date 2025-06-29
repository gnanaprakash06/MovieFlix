package com.example.MovieService.dto;

public class UserDTO {

    private String email;
    private String password;

    //Default Constructor
    public UserDTO(){}

    //Parameterized Constructor
    public UserDTO(String email, String password) {
        this.email = email;
        this.password = password;
    }

    //Getters and Setters
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
}
