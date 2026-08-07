package dev.uktcteam.hackathon.exceptions;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CustomExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentials(BadCredentialsException exception) {
        ProblemDetail problemDetail = ProblemDetail
                .forStatusAndDetail(HttpStatusCode.valueOf(401), "Invalid credentials");
        problemDetail.setProperty("error", "invalid_credentials");
        return problemDetail;
    }

    @ExceptionHandler({ExpiredJwtException.class, JwtException.class})
    public ProblemDetail handleJwtException(RuntimeException exception) {
        ProblemDetail problemDetail = ProblemDetail
                .forStatusAndDetail(HttpStatusCode.valueOf(401), "Invalid or expired token");
        problemDetail.setProperty("error", "invalid_token");
        return problemDetail;
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException exception) {
        ProblemDetail problemDetail = ProblemDetail
                .forStatusAndDetail(HttpStatusCode.valueOf(403), "Not authorized");
        problemDetail.setProperty("error", "access_denied");
        return problemDetail;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleBadRequest(IllegalArgumentException exception) {
        ProblemDetail problemDetail = ProblemDetail
                .forStatusAndDetail(HttpStatusCode.valueOf(400), exception.getMessage());
        problemDetail.setProperty("error", "invalid_input");
        return problemDetail;
    }

    @ExceptionHandler({EntityNotFoundException.class, UsernameNotFoundException.class})
    public ProblemDetail handleNotFound(RuntimeException exception) {
        ProblemDetail problemDetail = ProblemDetail
                .forStatusAndDetail(HttpStatusCode.valueOf(404), exception.getMessage());
        problemDetail.setProperty("error", "not_found");
        return problemDetail;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleException(Exception exception) {
        ProblemDetail problemDetail = ProblemDetail
                .forStatusAndDetail(HttpStatusCode.valueOf(500), "Unexpected server error");
        problemDetail.setProperty("error", "server_error");
        return problemDetail;
    }
}
