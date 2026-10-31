package dev.uktcteam.hackathon.pathfinding.logic;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RouteOptimizerTest {

    private final RouteOptimizer optimizer = new RouteOptimizer(new CoordinateMatrix());

    @Test
    void adjacentProductsOnOppositeShelfFacesRequireAnAisleDetour() {
        String[][] matrix = new String[41][21];
        for (String[] column : matrix) {
            Arrays.fill(column, "");
        }
        matrix[0][3] = "EN";
        matrix[0][6] = "EX";
        for (int x = 24; x <= 25; x++) {
            for (int y = 2; y <= 4; y++) {
                matrix[x][y] = "P" + (x * 10 + y);
            }
        }
        matrix[24][3] = "P100";
        matrix[25][3] = "P103";
        matrix[28][3] = "S1";

        var route = new ArrayList<>(List.of("EN", "P100", "P103", "S1", "EX"));
        var paths = optimizer.getShortestRoutePath(matrix, route);
        var coordinates = new CoordinateMatrix();

        assertTrue(paths.get(1).size() > 2, "The route must go around the two-column shelf");
        for (int index = 0; index < paths.size(); index++) {
            CoordinateMatrixTest.assertWalkable(matrix, paths.get(index));
            if (index > 0) {
                var previous = paths.get(index - 1);
                assertArrayEquals(previous.get(previous.size() - 1), paths.get(index).get(0));
            }
        }
        assertEquals(
                paths.stream().mapToInt(path -> path.size() - 1).sum(),
                optimizer.calculateRouteDistance(route,
                        coordinates.findShortestDistancesBetweenProducts(matrix),
                        coordinates.findShortestDistancesBetweenProductsAndCheckouts(matrix),
                        coordinates.findShortestDistancesFromEntranceToProducts(matrix),
                        coordinates.findShortestDistancesFromExitToCheckouts(matrix))
        );
    }

    @Test
    void choosesSubsequentProductsFromTheCurrentProduct() {
        HashMap<String, Integer> fromEntrance = new HashMap<>();
        fromEntrance.put("P1", 1);
        fromEntrance.put("P2", 2);
        fromEntrance.put("P3", 3);

        HashMap<Pair, Integer> betweenProducts = new HashMap<>();
        betweenProducts.put(new Pair("P1", "P2"), 10);
        betweenProducts.put(new Pair("P1", "P3"), 1);
        betweenProducts.put(new Pair("P3", "P2"), 1);

        HashMap<Pair, Integer> toCheckout = new HashMap<>();
        toCheckout.put(new Pair("P2", "S1"), 1);
        toCheckout.put(new Pair("P3", "S1"), 5);

        HashMap<String, Integer> checkoutToExit = new HashMap<>();
        checkoutToExit.put("S1", 1);

        assertEquals(
                List.of("EN", "P1", "P3", "P2", "S1", "EX"),
                optimizer.findShortestRoute(
                        "EN",
                        "EX",
                        new String[] { "P1", "P2", "P3" },
                        List.of("S1"),
                        betweenProducts,
                        toCheckout,
                        fromEntrance,
                        checkoutToExit
                )
        );
    }
}
