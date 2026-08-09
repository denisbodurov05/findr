package dev.uktcteam.hackathon.entities.itemcoordinate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coordinates")
public class ItemCoordinateController {

    private final ItemCoordinateService itemCoordinateService;

    @Autowired
    public ItemCoordinateController(ItemCoordinateService itemCoordinateService) {
        this.itemCoordinateService = itemCoordinateService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ItemCoordinate>> getAllCoordinates() {
        List<ItemCoordinate> itemCoordinates = itemCoordinateService.getAllCoordinates();
        return ResponseEntity.ok(itemCoordinates);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ItemCoordinate> createCoordinate(@RequestBody ItemCoordinate itemCoordinate) {
        ItemCoordinate createdItemCoordinate = itemCoordinateService.saveCoordinate(itemCoordinate);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItemCoordinate);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoordinate(@PathVariable("id") Long id) {
        itemCoordinateService.deleteCoordinate(id);
        return ResponseEntity.noContent().build();
    }
}
