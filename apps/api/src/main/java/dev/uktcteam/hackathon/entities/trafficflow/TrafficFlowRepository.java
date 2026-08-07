package dev.uktcteam.hackathon.entities.trafficflow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrafficFlowRepository extends JpaRepository<TrafficFlow, Long> {

    Optional<TrafficFlow> findByName(String name);
}
