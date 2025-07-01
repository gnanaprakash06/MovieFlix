package com.example.AuthService.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    public void sendOTPEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Password Reset OTP - MovieFlix");
            message.setText(buildOTPEmailBody(otp));

            emailSender.send(message);
            System.out.println("OTP email sent successfully to: " + toEmail);

        } catch (Exception e) {
            System.err.println("Failed to send OTP email to: " + toEmail);
            System.err.println("Error: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    private String buildOTPEmailBody(String otp) {
        return """
                Dear User,
                
                Your One-Time Password (OTP) is: %s
                
                This OTP is valid for 2 minutes. Please do not share this OTP with anyone.
                
                If you did not request this password reset, please ignore this email.
                
                Best regards,
                Netflix Demo Team""".formatted(otp);
    }
}