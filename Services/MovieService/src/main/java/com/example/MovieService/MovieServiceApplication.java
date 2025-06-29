package com.example.MovieService;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;

import javax.swing.*;

@SpringBootApplication
//@EnableFeignClients
//@ImportAutoConfiguration({FeignAutoConfiguration.class})
public class MovieServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MovieServiceApplication.class);
    }

}
