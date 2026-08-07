package dev.uktcteam.hackathon.entities.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Optional<UserDto> getUser(Long id) {
        return userRepository.findById(id)
                .map(UserDto::new);
    }

}
