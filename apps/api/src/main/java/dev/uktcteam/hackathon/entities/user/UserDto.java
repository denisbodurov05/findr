package dev.uktcteam.hackathon.entities.user;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String role;

    public UserDto(User user) {
        this.id = user.getId();
        this.username = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole().name();
    }
}
