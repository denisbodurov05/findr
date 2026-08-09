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

        String[] normalizedProducts = products == null ? new String[0] : Arrays.stream(products)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(product -> !product.isEmpty())
                .distinct()
                .toArray(String[]::new);

        if (normalizedProducts.length == 0) {
            return emptyPath();
        }

        StoreRouteData routeData = getRouteData(storeId);

        if (coordinateMatrix.findEntrance(routeData.matrix()) == null
                || coordinateMatrix.findExit(routeData.matrix()) == null) {
            return emptyPath();
        }

        Set<String> reachableProducts = routeData.entranceToProductsDistances().entrySet().stream()
                .filter(entry -> entry.getValue() >= 0)
                .map(Map.Entry::getKey)
                .collect(java.util.stream.Collectors.toSet());
        String[] requestedProducts = Arrays.stream(normalizedProducts)
                .filter(reachableProducts::contains)
                .toArray(String[]::new);

        if (requestedProducts.length == 0) {
            throw new IllegalArgumentException("None of the requested products are present and reachable in this store");
        }

        String entrance = "EN";

        String[] goldenEggs = { "P107", "P310", "P204", "P19", "P279" };

        List<String> checkouts = routeData.exitToCheckoutsDistances().entrySet().stream()
                .filter(entry -> entry.getValue() >= 0)
                .map(Map.Entry::getKey)
                .filter(checkout -> Arrays.stream(requestedProducts).anyMatch(product -> {
                    Integer distance = routeData.productToCheckoutDistances().get(new Pair(product, checkout));
                    return distance != null && distance >= 0;
                }))
                .toList();

        if (checkouts.isEmpty()) {
            return emptyPath();
        }

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


        return PathfindDto.builder()
                .distance(totalDistance)
                .sorted(sorted)
                .pathfind(pathfind)
                .build();
    }

    public void invalidateCache(Long storeId) {
        routeDataCache.remove(storeId);
    }

    private PathfindDto emptyPath() {
        return PathfindDto.builder()
                .distance(0)
                .sorted(new ProductDto[0])
                .pathfind(new TwoPointPathDto[0])
                .build();
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
