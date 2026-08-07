package dev.uktcteam.hackathon.entities.itemcoordinate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemCoordinateService {

    private final ItemCoordinateRepository itemCoordinateRepository;

    @Autowired
    public ItemCoordinateService(ItemCoordinateRepository itemCoordinateRepository) {
        this.itemCoordinateRepository = itemCoordinateRepository;
    }

    public List<ItemCoordinate> getAllCoordinates() {
        return itemCoordinateRepository.findAll();
    }

    public ItemCoordinate saveCoordinate(ItemCoordinate itemCoordinate) {
        return itemCoordinateRepository.save(itemCoordinate);
    }

    public void deleteCoordinate(Long id) {
        itemCoordinateRepository.deleteById(id);
    }
}
