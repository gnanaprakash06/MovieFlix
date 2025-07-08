package com.example.AuthService.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

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
    private static final Logger logger = LoggerFactory.getLogger(OTPService.class);

    public String generateOTP(String email) {
        // Generate a 6-digit OTP
        String otp = String.format("%06d", random.nextInt(999999));

        // Set expiry time (2 minutes from now)
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        // Store OTP with expiry time
        otpStorage.put(email, new OTPData(otp, expiryTime));

        logger.debug("Generated OTP for {}: {} (expires at: {})", email, otp, expiryTime);

        return otp;
    }

    public boolean validateOTP(String email, String otp) {
        OTPData otpData = otpStorage.get(email);

        if (otpData == null) {
            logger.debug("No OTP found for email: {}", email);
            return false;
        }

        if (otpData.isExpired()) {
            logger.debug("OTP expired for email: {}", email);
            otpStorage.remove(email); // Remove expired OTP
            return false;
        }

        boolean isValid = otpData.getOtp().equals(otp);
        logger.debug("OTP validation for {}: {}", email, isValid ? "SUCCESS" : "FAILED");

        return isValid;
    }

    public void clearOTP(String email) {
        otpStorage.remove(email);
        logger.debug("Cleared OTP for email: {}", email);
    }

    // Method to clean up expired OTPs (can be called periodically)
    public void cleanupExpiredOTPs() {
        otpStorage.entrySet().removeIf(entry -> entry.getValue().isExpired());
        logger.debug("Cleaned up expired OTPs");
    }
}