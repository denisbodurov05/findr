package dev.uktcteam.hackathon.security.auth;

import dev.uktcteam.hackathon.security.auth.requests.AuthenticationRequest;
import dev.uktcteam.hackathon.security.auth.requests.RegisterRequest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AuthRequestValidatorTest {

    @Test
    void acceptsValidRegistrationRequests() {
        RegisterRequest request = RegisterRequest.builder()
                .username("Denis")
                .email("denis@example.com")
                .password("Password1")
                .build();

        assertDoesNotThrow(() -> AuthRequestValidator.validateRegistration(request));
    }

    @Test
    void rejectsWeakRegistrationPasswords() {
        RegisterRequest request = RegisterRequest.builder()
                .username("Denis")
                .email("denis@example.com")
                .password("password")
                .build();

        assertThrows(IllegalArgumentException.class, () -> AuthRequestValidator.validateRegistration(request));
    }

    @Test
    void rejectsInvalidAuthenticationEmail() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("not-an-email")
                .password("Password1")
                .build();

        assertThrows(IllegalArgumentException.class, () -> AuthRequestValidator.validateAuthentication(request));
    }
}
