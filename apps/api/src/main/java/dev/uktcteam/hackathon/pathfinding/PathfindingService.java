package dev.uktcteam.hackathon.pathfinding;

import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinateRepository;
import dev.uktcteam.hackathon.entities.product.ProductDto;
import dev.uktcteam.hackathon.entities.product.ProductService;
import dev.uktcteam.hackathon.entities.store.StoreRepository;
import dev.uktcteam.hackathon.pathfinding.logic.CoordinateMatrix;
import dev.uktcteam.hackathon.pathfinding.logic.Pair;
import dev.uktcteam.hackathon.pathfinding.logic.RouteOptimizer;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.util.*;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PathfindingService {

    private final RouteOptimizer routeOptimizer;
    private final CoordinateMatrix coordinateMatrix;
    private final ProductService productService;
    private final StoreRepository storeRepository;
    private final ItemCoordinateRepository itemCoordinateRepository;

    private final ConcurrentHashMap<Long, StoreRouteData> routeDataCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void warmUp() {
        storeRepository.findAll().forEach(store -> getRouteData(store.getId()));
    }

    public PathfindDto findPath(Long storeId, String[] products) {

        if (!storeRepository.existsById(storeId)) {
            throw new EntityNotFoundException("Store not found");
        }

        StoreRouteData routeData = getRouteData(storeId);

        // Only route through products that actually exist in the store layout.
        Set<String> placedProducts = routeData.entranceToProductsDistances().keySet();
        String[] requestedProducts = Arrays.stream(products)
                .filter(placedProducts::contains)
                .toArray(String[]::new);

        String entrance = "EN";

        String[] goldenEggs = { "P107", "P310", "P204", "P19", "P279" };

        List<String> checkouts = new ArrayList<>(routeData.exitToCheckoutsDistances().keySet());

        String exit = "EX";


        ArrayList<String> shortestRoute = routeOptimizer.findShortestRoute(entrance, exit, requestedProducts, checkouts,
                routeData.shortestDistances(), routeData.productToCheckoutDistances(), routeData.entranceToProductsDistances(),
                routeData.exitToCheckoutsDistances());

        shortestRoute = routeOptimizer.insertBestGoldenEgg(shortestRoute, goldenEggs, routeData.shortestDistances());

        shortestRoute = routeOptimizer.twoOpt(shortestRoute, routeData.shortestDistances(), routeData.productToCheckoutDistances(),
                routeData.entranceToProductsDistances(), routeData.exitToCheckoutsDistances());

        int totalDistance = routeOptimizer.calculateRouteDistance(shortestRoute, routeData.shortestDistances(),
                routeData.productToCheckoutDistances(), routeData.entranceToProductsDistances(), routeData.exitToCheckoutsDistances());

        ArrayList<List<int[]>> shortestRoutePath = routeOptimizer.getShortestRoutePath(routeData.matrix(), shortestRoute);

        TwoPointPathDto[] pathfind = new TwoPointPathDto[shortestRoutePath.size()];
        for (int i = 0; i < shortestRoutePath.size(); i++) {
            List<int[]> path = shortestRoutePath.get(i);

            TwoPointPathDto twoPointPathDto = new TwoPointPathDto();

            PointDto startPoint = new PointDto();
            startPoint.setX(path.get(0)[0]);
            startPoint.setY(path.get(0)[1]);
            startPoint.setId(shortestRoute.get(i));
            twoPointPathDto.setStart(startPoint);

            PointDto endPoint = new PointDto();
            endPoint.setX(path.get(path.size() - 1)[0]);
            endPoint.setY(path.get(path.size() - 1)[1]);
            endPoint.setId(shortestRoute.get(i + 1));
            twoPointPathDto.setEnd(endPoint);

            Point[] points = new Point[path.size() - 2];
            for (int j = 1; j < path.size() - 1; j++) {
                points[j - 1] = new Point(path.get(j)[0], path.get(j)[1]);
            }
            twoPointPathDto.setPath(points);

            pathfind[i] = twoPointPathDto;
        }


        ProductDto[] sorted = new ProductDto[shortestRoute.size()];

        for (int i = 0; i < shortestRoute.size(); i++) {
            String productId = shortestRoute.get(i);
            if (productId.charAt(0) != 'P') {
                continue;
            }

            productId = shortestRoute.get(i).substring(1);
            ProductDto product = productService.getProductById(Long.parseLong(productId));
            sorted[i] = product;
        }


        PathfindDto pathfindDto = PathfindDto.builder()
                .distance(totalDistance)
                .sorted(sorted)
                .pathfind(pathfind)
                .build();

        return pathfindDto;
    }

    public void invalidateCache(Long storeId) {
        routeDataCache.remove(storeId);
    }

    private StoreRouteData getRouteData(Long storeId) {
        return routeDataCache.computeIfAbsent(storeId, this::buildRouteData);
    }

    private StoreRouteData buildRouteData(Long storeId) {
        String[][] matrix = coordinateMatrix.buildMatrix(itemCoordinateRepository.findByStoreId(storeId));

        return new StoreRouteData(
                matrix,
                coordinateMatrix.findShortestDistancesBetweenProducts(matrix),
                coordinateMatrix.findShortestDistancesBetweenProductsAndCheckouts(matrix),
                coordinateMatrix.findShortestDistancesFromEntranceToProducts(matrix),
                coordinateMatrix.findShortestDistancesFromExitToCheckouts(matrix)
        );
    }

    private record StoreRouteData(
            String[][] matrix,
            HashMap<Pair, Integer> shortestDistances,
            HashMap<Pair, Integer> productToCheckoutDistances,
            HashMap<String, Integer> entranceToProductsDistances,
            HashMap<String, Integer> exitToCheckoutsDistances
    ) {
    }
}
