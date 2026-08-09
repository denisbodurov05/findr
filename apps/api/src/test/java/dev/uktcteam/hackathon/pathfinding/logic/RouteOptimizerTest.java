package dev.uktcteam.hackathon.pathfinding.logic;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RouteOptimizerTest {

    private final RouteOptimizer optimizer = new RouteOptimizer(new CoordinateMatrix());

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
