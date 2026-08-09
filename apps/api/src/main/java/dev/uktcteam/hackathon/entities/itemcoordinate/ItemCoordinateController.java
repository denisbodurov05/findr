package dev.uktcteam.hackathon.entities.itemcoordinate;

import dev.uktcteam.hackathon.pathfinding.PathfindingService;
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
    private final PathfindingService pathfindingService;

    @Autowired
    public ItemCoordinateController(ItemCoordinateService itemCoordinateService,
                                    PathfindingService pathfindingService) {
        this.itemCoordinateService = itemCoordinateService;
        this.pathfindingService = pathfindingService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ItemCoordinateDto>> getAllCoordinates() {
        List<ItemCoordinateDto> itemCoordinates = itemCoordinateService.getAllCoordinates();
        return ResponseEntity.ok(itemCoordinates);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ItemCoordinateDto> createCoordinate(@RequestBody CreateItemCoordinateDto request) {
        ItemCoordinateDto createdItemCoordinate = itemCoordinateService.createCoordinate(request);
        pathfindingService.invalidateCache(createdItemCoordinate.getStoreId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItemCoordinate);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoordinate(@PathVariable("id") Long id) {
        Long storeId = itemCoordinateService.deleteCoordinate(id);
        pathfindingService.invalidateCache(storeId);
        return ResponseEntity.noContent().build();
    }
}
