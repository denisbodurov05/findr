package dev.uktcteam.hackathon.entities.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailEqualsIgnoreCase(@NonNull String email);

    Optional<User> findByFirebaseUid(@NonNull String firebaseUid);

}
