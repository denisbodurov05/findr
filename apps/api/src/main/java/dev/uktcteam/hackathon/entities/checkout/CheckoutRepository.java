package dev.uktcteam.hackathon.entities.checkout;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CheckoutRepository extends JpaRepository<Checkout, Long> {

    Optional<Checkout> findByName(String name);
}
