package dev.uktcteam.hackathon.pathfinding.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class RouteOptimizer {

    private final CoordinateMatrix coordinateMatrix;

    public int calculateRouteDistance(ArrayList<String> route,
                                      HashMap<Pair, Integer> shortestDistances,
                                      HashMap<Pair, Integer> productToCheckoutDistances,
                                      HashMap<String, Integer> entranceToProductsDistances,
                                      HashMap<String, Integer> exitToCheckoutsDistances) {
        int totalDistance = 0;

        totalDistance += entranceToProductsDistances.get(route.get(1));

        for (int i = 1; i < route.size() - 3; i++) {
            Pair pair = new Pair(route.get(i), route.get(i + 1));
            totalDistance += shortestDistances.get(pair);
        }

        Pair lastProductToCheckout = new Pair(route.get(route.size() - 3), route.get(route.size() - 2));
        totalDistance += productToCheckoutDistances.get(lastProductToCheckout);

        totalDistance += exitToCheckoutsDistances.get(route.get(route.size() - 2));

        return totalDistance;
    }

    public ArrayList<String> findShortestRoute(String entrance, String exit, String[] products,
                                               List<String> checkouts,
                                               HashMap<Pair, Integer> shortestDistances,
                                               HashMap<Pair, Integer> productToCheckoutDistances,
                                               HashMap<String, Integer> entranceToProductsDistances,
                                               HashMap<String, Integer> exitToCheckoutsDistances) {

        ArrayList<String> route = new ArrayList<>();
        route.add(entrance);

        Set<String> remainingProducts = new HashSet<>(Arrays.asList(products));

        String currentLocation = entrance;

        while (!remainingProducts.isEmpty()) {
            String nearestProduct = null;
            int shortestDistance = Integer.MAX_VALUE;

            for (String product : remainingProducts) {
                int distance = currentLocation.equals(entrance)
                        ? entranceToProductsDistances.getOrDefault(product, Integer.MAX_VALUE)
                        : shortestDistances.getOrDefault(new Pair(currentLocation, product), Integer.MAX_VALUE);
                if (distance >= 0 && distance < shortestDistance) {
                    nearestProduct = product;
                    shortestDistance = distance;
                }
            }

            if (nearestProduct == null) {
                throw new IllegalArgumentException("The requested products are not connected by a walkable route");
            }

            route.add(nearestProduct);
            remainingProducts.remove(nearestProduct);
            currentLocation = nearestProduct;
        }

        String nearestCheckout = null;
        int shortestCheckoutDistance = Integer.MAX_VALUE;

        for (String checkout : checkouts) {
            Pair pair = new Pair(currentLocation, checkout);
            int distance = productToCheckoutDistances.getOrDefault(pair, Integer.MAX_VALUE);
            if (distance >= 0 && distance < shortestCheckoutDistance) {
                nearestCheckout = checkout;
                shortestCheckoutDistance = distance;
            }
        }

        if (nearestCheckout == null) {
            throw new IllegalArgumentException("No reachable checkout is available");
        }

        route.add(nearestCheckout);

        route.add(exit);

        return route;
    }

    public ArrayList<String> insertBestGoldenEgg(ArrayList<String> route, String[] goldenEggs,
                                                 HashMap<Pair, Integer> shortestDistances) {
        int minimalIncrease = Integer.MAX_VALUE;
        String bestGoldenEgg = null;
        int bestPosition = -1;

        for (String goldenEgg : goldenEggs) {
            if (route.contains(goldenEgg)) {
                continue;
            }
            for (int i = 1; i < route.size() - 2; i++) {
                String current = route.get(i);
                String next = route.get(i + 1);
                Pair currentToGoldenEgg = new Pair(current, goldenEgg);
                Pair goldenEggToNext = new Pair(goldenEgg, next);
                Pair currentToNext = new Pair(current, next);

                if (!shortestDistances.containsKey(currentToGoldenEgg)
                        || !shortestDistances.containsKey(goldenEggToNext)
                        || shortestDistances.get(currentToGoldenEgg) < 0
                        || shortestDistances.get(goldenEggToNext) < 0
                        || shortestDistances.getOrDefault(currentToNext, -1) < 0) {
                    continue;
                }
                int increase = shortestDistances.get(currentToGoldenEgg) + shortestDistances.get(goldenEggToNext)
                        - shortestDistances.get(currentToNext);

                if (increase < minimalIncrease) {
                    minimalIncrease = increase;
                    bestGoldenEgg = goldenEgg;
                    bestPosition = i + 1;
                }
            }
        }

        if (bestGoldenEgg != null && bestPosition != -1) {
            route.add(bestPosition, bestGoldenEgg);
        }

        return route;
    }

    public ArrayList<List<int[]>> getShortestRoutePath(String[][] matrix, ArrayList<String> shortestRoute) {

        Set<String> elementsSet = new HashSet<>(shortestRoute);

        HashMap<String, int[]> elementCoords = new HashMap<>();

        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[i].length; j++) {
                if (elementsSet.contains(matrix[i][j])) {
                    elementCoords.put(matrix[i][j], new int[] { i, j });
                }
            }
        }

        ArrayList<List<int[]>> shortestRoutePath = new ArrayList<>();

        for (int index = 0; index < shortestRoute.size() - 1; index++) {
            List<int[]> path = coordinateMatrix.bfsWithPath(matrix, elementCoords.get(shortestRoute.get(index)),
                    elementCoords.get(shortestRoute.get(index + 1)));
            shortestRoutePath.add(path);
        }
        return shortestRoutePath;
    }

    public ArrayList<String> twoOpt(ArrayList<String> route,
                                    HashMap<Pair, Integer> shortestDistances,
                                    HashMap<Pair, Integer> productToCheckoutDistances,
                                    HashMap<String, Integer> entranceToProductsDistances,
                                    HashMap<String, Integer> exitToCheckoutsDistances) {
        boolean improved = true;
        int currentDistance = calculateRouteDistance(route, shortestDistances, productToCheckoutDistances,
                entranceToProductsDistances, exitToCheckoutsDistances);

        while (improved) {
            improved = false;
            for (int i = 1; i < route.size() - 3; i++) {
                for (int j = i + 1; j < route.size() - 2; j++) {
                    reverseSublist(route, i, j);
                    int newDistance = calculateRouteDistance(route, shortestDistances, productToCheckoutDistances,
                            entranceToProductsDistances, exitToCheckoutsDistances);

                    if (newDistance < currentDistance) {
                        currentDistance = newDistance;
                        improved = true;
                    } else {
                        reverseSublist(route, i, j); // revert the swap
                    }
                }
            }
        }
        return route;
    }

    private void reverseSublist(ArrayList<String> route, int i, int j) {
        while (i < j) {
            String temp = route.get(i);
            route.set(i, route.get(j));
            route.set(j, temp);
            i++;
            j--;
        }
    }
}
