package com.example.AuthService.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Password and confirm password do not match")
public class PasswordMismatchException extends Exception {

}
