package dev.uktcteam.hackathon.security.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(Authentication auth) {
        String role = auth.getAuthorities().stream()
                .map(Object::toString)
                .filter(a -> a.startsWith("ROLE_"))
                .findFirst()
                .orElse("ROLE_USER")
                .replace("ROLE_", "");
        return ResponseEntity.ok(Map.of("email", auth.getName(), "role", role));
    }
}
