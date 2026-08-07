package dev.uktcteam.hackathon.security.auth;

import dev.uktcteam.hackathon.entities.user.UserDto;
import dev.uktcteam.hackathon.enums.Role;
import dev.uktcteam.hackathon.entities.user.User;
import dev.uktcteam.hackathon.entities.user.UserRepository;
import dev.uktcteam.hackathon.security.JwtService;
import dev.uktcteam.hackathon.security.auth.requests.AuthenticationRequest;
import dev.uktcteam.hackathon.security.auth.requests.RegisterRequest;
import dev.uktcteam.hackathon.security.auth.responses.AuthenticationResponse;
import dev.uktcteam.hackathon.security.auth.responses.RefreshTokenResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;


    public AuthenticationResponse register(RegisterRequest request) {
        return createSessionForNewUser(request, Role.USER);
    }

    public AuthenticationResponse registerWithRole(RegisterRequest request, Role role) {
        return createSessionForNewUser(request, role);
    }

    private AuthenticationResponse createSessionForNewUser(RegisterRequest request, Role role) {
        AuthRequestValidator.validateRegistration(request);
        String email = normalizeEmail(request.getEmail());

        if (userRepository.findByEmailEqualsIgnoreCase(email).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getUsername().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        user = userRepository.save(user);

        return createAuthenticationResponse(user);
    }


    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        AuthRequestValidator.validateAuthentication(request);
        String email = normalizeEmail(request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.getPassword()
                )
        );
        User user = userRepository.findByEmailEqualsIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return createAuthenticationResponse(user);
    }

    public RefreshTokenResponse refreshToken(HttpServletRequest request) {
        String refreshToken = extractBearerToken(request);
        String username = jwtService.extractUsernameFromRefreshToken(refreshToken);
        User user = userRepository.findByEmailEqualsIgnoreCase(username)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (!jwtService.isRefreshTokenValid(refreshToken, user)) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        return RefreshTokenResponse.builder()
                .accessToken(jwtService.generateJwtToken(user))
                .refreshToken(refreshToken)
                .build();
    }

    private AuthenticationResponse createAuthenticationResponse(User user) {
        var jwtToken = jwtService.generateJwtToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return AuthenticationResponse
                .builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .user(new UserDto(user))
                .build();
    }

    private String extractBearerToken(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BadCredentialsException("Refresh token is required");
        }

        return authHeader.substring(7);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
