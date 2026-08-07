package dev.uktcteam.hackathon.entities.user;

import dev.uktcteam.hackathon.enums.Role;
import dev.uktcteam.hackathon.security.auth.AuthenticationService;
import dev.uktcteam.hackathon.security.auth.requests.RegisterRequest;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserConfig {

    @Bean
    public CommandLineRunner commandLineRunner(
            AuthenticationService authenticationService,
            UserRepository userRepository
    ){
        return args -> {

            seedUserIfMissing(
                    userRepository,
                    authenticationService,
                    RegisterRequest.builder()
                            .username("Admin")
                            .email("admin@uktc.bg")
                            .password("Admin1234")
                            .build(),
                    Role.ADMIN
            );

            seedUserIfMissing(
                    userRepository,
                    authenticationService,
                    RegisterRequest.builder()
                            .username("Tomov")
                            .email("tomov@abv.bg")
                            .password("Tomov1234")
                            .build(),
                    Role.USER
            );

        };
    }

    private void seedUserIfMissing(
            UserRepository userRepository,
            AuthenticationService authenticationService,
            RegisterRequest request,
            Role role
    ) {
        if (userRepository.findByEmailEqualsIgnoreCase(request.getEmail()).isEmpty()) {
            authenticationService.registerWithRole(request, role);
        }
    }
}
