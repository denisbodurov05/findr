package dev.uktcteam.hackathon.security;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                if (request.getRequestURI().equals("/api/v1/auth/refresh")) {
                    authenticateWithToken(token, jwtService::extractUsernameFromRefreshToken,
                            jwtService::isRefreshTokenValid, request);
                } else {
                    authenticateWithToken(token, jwtService::extractUsernameJwt,
                            jwtService::isJwtTokenValid, request);
                }
            } catch (Exception ignored) {
                // Not an app-issued JWT (e.g. Firebase ID token or malformed token) —
                // leave unauthenticated and let downstream filters handle it.
            }
        }

        filterChain.doFilter(request, response);
    }

    private void authenticateWithToken(
            String token,
            TokenUsernameExtractor usernameExtractor,
            TokenValidator validator,
            HttpServletRequest request
    ) {
        String username = usernameExtractor.extract(token);
        if (username == null) {
            return;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (validator.isValid(token, userDetails)) {
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
    }

    @FunctionalInterface
    private interface TokenUsernameExtractor {
        String extract(String token);
    }

    @FunctionalInterface
    private interface TokenValidator {
        boolean isValid(String token, UserDetails userDetails);
    }
}
