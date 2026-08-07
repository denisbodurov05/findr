package dev.uktcteam.hackathon.entities.store;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/v1/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping
    public ResponseEntity<List<StoreSummaryDto>> getStores() {
        return ResponseEntity.ok(storeService.getStores());
    }

    @GetMapping("{id}")
    public ResponseEntity<StoreDto> getStore(@PathVariable Long id) {
        StoreDto store = storeService.getStore(id);
        return ResponseEntity.ok(store);
    }
}
