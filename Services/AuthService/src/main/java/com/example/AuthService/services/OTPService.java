package com.example.AuthService.services;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OTPService {

    private static class OTPData {
        private final String otp;
        private final LocalDateTime expiryTime;

        public OTPData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }

        public String getOtp() {
            return otp;
        }

        public LocalDateTime getExpiryTime() {
            return expiryTime;
        }

        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryTime);
        }
    }

    private final Map<String, OTPData> otpStorage = new HashMap<>();
    private final Random random = new Random();
    private static final int OTP_EXPIRY_MINUTES = 2;

    public String generateOTP(String email) {
        // Generate a 6-digit OTP
        String otp = String.format("%06d", random.nextInt(999999));

        // Set expiry time (10 minutes from now)
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        // Store OTP with expiry time
        otpStorage.put(email, new OTPData(otp, expiryTime));

        System.out.println("Generated OTP for " + email + ": " + otp + " (expires at: " + expiryTime + ")");

        return otp;
    }

    public boolean validateOTP(String email, String otp) {
        OTPData otpData = otpStorage.get(email);

        if (otpData == null) {
            System.out.println("No OTP found for email: " + email);
            return false;
        }

        if (otpData.isExpired()) {
            System.out.println("OTP expired for email: " + email);
            otpStorage.remove(email); // Remove expired OTP
            return false;
        }

        boolean isValid = otpData.getOtp().equals(otp);
        System.out.println("OTP validation for " + email + ": " + (isValid ? "SUCCESS" : "FAILED"));

        return isValid;
    }

    public void clearOTP(String email) {
        otpStorage.remove(email);
        System.out.println("Cleared OTP for email: " + email);
    }

    // Method to clean up expired OTPs (can be called periodically)
    public void cleanupExpiredOTPs() {
        otpStorage.entrySet().removeIf(entry -> entry.getValue().isExpired());
        System.out.println("Cleaned up expired OTPs");
    }
}