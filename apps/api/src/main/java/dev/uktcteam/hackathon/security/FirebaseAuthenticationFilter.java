package dev.uktcteam.hackathon.security;

import dev.uktcteam.hackathon.entities.user.User;
import dev.uktcteam.hackathon.entities.user.UserRepository;
import dev.uktcteam.hackathon.enums.Role;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final UserRepository userRepository;

    @Value("${application.security.firebase.project-id:}")
    private String firebaseProjectId;

    private JwtDecoder jwtDecoder;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Jwt jwt = getJwtDecoder().decode(authHeader.substring(BEARER_PREFIX.length()));
            User user = syncUser(jwt);
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(user.getEmail(), jwt, user.getRole().getAuthorities());

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);
        } catch (JwtException | IllegalStateException error) {
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Firebase token");
        }
    }

    private JwtDecoder getJwtDecoder() {
        if (jwtDecoder != null) {
            return jwtDecoder;
        }

        if (!StringUtils.hasText(firebaseProjectId)) {
            throw new IllegalStateException("FIREBASE_PROJECT_ID is not configured");
        }

        String issuer = "https://securetoken.google.com/" + firebaseProjectId;
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withIssuerLocation(issuer).build();
        OAuth2TokenValidator<Jwt> audienceValidator = jwt -> jwt.getAudience().contains(firebaseProjectId)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", "Invalid Firebase token audience", null)
                );

        decoder.setJwtValidator(new org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(issuer),
                audienceValidator
        ));
        jwtDecoder = decoder;
        return jwtDecoder;
    }

    private User syncUser(Jwt jwt) {
        String firebaseUid = jwt.getSubject();
        String email = Optional.ofNullable(jwt.getClaimAsString("email"))
                .filter(StringUtils::hasText)
                .map(String::trim)
                .map(String::toLowerCase)
                .orElse(firebaseUid + "@firebase.local");
        String displayName = Optional.ofNullable(jwt.getClaimAsString("name"))
                .filter(StringUtils::hasText)
                .orElseGet(() -> email.substring(0, email.indexOf("@")));

        User user = userRepository.findByFirebaseUid(firebaseUid).orElseGet(() -> {
            Optional<User> existingEmailUser = userRepository.findByEmailEqualsIgnoreCase(email);
            boolean emailVerified = Boolean.TRUE.equals(jwt.getClaim("email_verified"));

            if (existingEmailUser.isPresent() && !emailVerified) {
                throw new JwtException("A verified email is required to link this account");
            }

            return existingEmailUser.orElseGet(() -> User.builder()
                    .email(email)
                    .role(Role.USER)
                    .build());
        });

        user.setFirebaseUid(firebaseUid);
        user.setEmail(email);
        user.setName(displayName);

        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }

        return userRepository.save(user);
    }
}
