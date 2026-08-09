package dev.uktcteam.hackathon.entities.user;

import dev.uktcteam.hackathon.enums.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserConfig {

    @Bean
    public CommandLineRunner commandLineRunner(UserRepository userRepository) {
        return args -> {
            seedUserIfMissing(
                    userRepository,
                    "Admin",
                    "admin@uktc.bg",
                    Role.ADMIN
            );

            seedUserIfMissing(
                    userRepository,
                    "Tomov",
                    "tomov@abv.bg",
                    Role.USER
            );
        };
    }

    private void seedUserIfMissing(
            UserRepository userRepository,
            String name,
            String email,
            Role role
    ) {
        if (userRepository.findByEmailEqualsIgnoreCase(email).isEmpty()) {
            userRepository.save(User.builder()
                    .name(name)
                    .email(email)
                    .role(role)
                    .build());
        }
    }
}
