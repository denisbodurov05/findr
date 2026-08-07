package dev.uktcteam.hackathon.security.auth;

import dev.uktcteam.hackathon.security.auth.requests.AuthenticationRequest;
import dev.uktcteam.hackathon.security.auth.requests.RegisterRequest;

import java.util.regex.Pattern;

final class AuthRequestValidator {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$");

    private AuthRequestValidator() {
    }

    static void validateRegistration(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().length() < 3) {
            throw new IllegalArgumentException("Name must be at least 3 characters long");
        }

        validateEmail(request.getEmail());
        validatePassword(request.getPassword());
    }

    static void validateAuthentication(AuthenticationRequest request) {
        validateEmail(request.getEmail());

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
    }

    private static void validateEmail(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    private static void validatePassword(String password) {
        if (password == null || !PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException("Password must be at least 8 characters and include a letter and a number");
        }
    }
}
