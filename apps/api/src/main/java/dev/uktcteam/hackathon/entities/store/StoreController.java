package dev.uktcteam.hackathon.entities.store;

import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinateService;
import dev.uktcteam.hackathon.entities.itemcoordinate.LayoutCellDto;
import dev.uktcteam.hackathon.pathfinding.PathfindingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/v1/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;
    private final ItemCoordinateService itemCoordinateService;
    private final PathfindingService pathfindingService;

    @GetMapping
    public ResponseEntity<List<StoreSummaryDto>> getStores() {
        return ResponseEntity.ok(storeService.getStores());
    }

    @GetMapping("{id}")
    public ResponseEntity<StoreDto> getStore(@PathVariable Long id) {
        StoreDto store = storeService.getStore(id);
        return ResponseEntity.ok(store);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("{id}/layout")
    public ResponseEntity<Void> replaceLayout(@PathVariable Long id,
                                              @RequestBody List<LayoutCellDto> cells) {
        itemCoordinateService.replaceStoreLayout(id, cells);
        pathfindingService.invalidateCache(id);
        return ResponseEntity.noContent().build();
    }
}
