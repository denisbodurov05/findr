package dev.uktcteam.hackathon.pathfinding;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/pathfind")
@RequiredArgsConstructor
public class PathfindingController {

    private final PathfindingService pathfindingService;

    @GetMapping("{storeId}")
    public PathfindDto findPath(
            @PathVariable Long storeId,
            @RequestParam("products") String[] products
    ) {
        return pathfindingService.findPath(storeId, products);
    }

}
