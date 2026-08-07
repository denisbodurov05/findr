package dev.uktcteam.hackathon.entities.itemcoordinate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemCoordinateRepository extends JpaRepository<ItemCoordinate, Long> {

    List<ItemCoordinate> findByStoreId(Long storeId);

    void deleteByStoreId(Long storeId);
}
