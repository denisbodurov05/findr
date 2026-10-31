package dev.uktcteam.hackathon.pathfinding.logic;

import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinate;
import dev.uktcteam.hackathon.entities.itemcoordinate.StoreLayout;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CoordinateMatrix {

    private static final int[] DX = { 0, 0, 1, -1, 1, 1, -1, -1 };
    private static final int[] DY = { 1, -1, 0, 0, 1, -1, 1, -1 };

    public String[][] buildMatrix(List<ItemCoordinate> coordinates) {
        String[][] matrix = new String[StoreLayout.COLUMNS][StoreLayout.ROWS];

        for (int i = 0; i < StoreLayout.COLUMNS; i++) {
            for (int j = 0; j < StoreLayout.ROWS; j++) {
                matrix[i][j] = "";
            }
        }

        for (ItemCoordinate coordinate : coordinates) {
            int x = coordinate.getX();
            int y = coordinate.getY();

            StoreLayout.validateCoordinates(x, y);

            if (coordinate.isProduct()) {
                matrix[x][y] = "P" + coordinate.getProduct().getId();
            } else if (coordinate.isCheckout()) {
                boolean selfCheckout = "self_checkout".equals(coordinate.getCheckout().getName());
                matrix[x][y] = (selfCheckout ? "CA" : "S") + coordinate.getId();
            } else if (coordinate.isTrafficFlow()) {
                switch (coordinate.getTrafficFlow().getName()) {
                    case "entry" -> matrix[x][y] = "EN";
                    case "exit" -> matrix[x][y] = "EX";
                    case "blocked_path" -> matrix[x][y] = "BL";
                    default -> {
                    }
                }
            }
        }

        return matrix;
    }

    public HashMap<String, int[]> findProducts(String[][] matrix) {
        HashMap<String, int[]> products = findRouteStops(matrix);
        products.keySet().removeIf(id -> !id.startsWith("P"));
        return products;
    }

    public HashMap<String, int[]> findCheckouts(String[][] matrix) {
        HashMap<String, int[]> checkouts = findRouteStops(matrix);
        checkouts.keySet().removeIf(id -> !id.startsWith("S") && !id.startsWith("CA"));
        return checkouts;
    }

    public HashMap<String, int[]> findRouteStops(String[][] matrix) {
        HashMap<String, int[]> stops = new HashMap<>();
        int[] entrance = findEntrance(matrix);
        if (entrance == null) {
            return stops;
        }

        int[][] distances = search(matrix, entrance, null).distances();

        for (int i = 0; i < StoreLayout.COLUMNS; i++) {
            for (int j = 0; j < StoreLayout.ROWS; j++) {
                String value = matrix[i][j];
                if ((value.equals("EN") || value.equals("EX")) && distances[i][j] >= 0) {
                    stops.put(value, new int[] { i, j });
                } else if (value.startsWith("P") || value.startsWith("S") || value.startsWith("CA")) {
                    // ponytail: fixed entrance-nearest aisle stops keep segments continuous.
                    // Optimize across multiple pickup positions only if route quality requires it.
                    for (int d = 0; d < 4; d++) {
                        int x = i + DX[d];
                        int y = j + DY[d];
                        if (!isWalkable(matrix, x, y) || distances[x][y] < 0) {
                            continue;
                        }
                        int[] previous = stops.get(value);
                        if (previous == null || distances[x][y] < distances[previous[0]][previous[1]]) {
                            stops.put(value, new int[] { x, y });
                        }
                    }
                }
            }
        }

        return stops;
    }

    public int[] findEntrance(String[][] matrix) {
        for (int i = 0; i < StoreLayout.COLUMNS; i++) {
            for (int j = 0; j < StoreLayout.ROWS; j++) {
                if (matrix[i][j].equals("EN")) {
                    return new int[] { i, j };
                }
            }
        }
        return null;
    }

    public int[] findExit(String[][] matrix) {
        for (int i = 0; i < StoreLayout.COLUMNS; i++) {
            for (int j = 0; j < StoreLayout.ROWS; j++) {
                if (matrix[i][j].equals("EX")) {
                    return new int[] { i, j };
                }
            }
        }
        return null;
    }

    public int bfs(String[][] matrix, int[] start, int[] end) {
        List<int[]> path = bfsWithPath(matrix, start, end);
        return path == null ? -1 : path.size() - 1;
    }

    public List<int[]> bfsWithPath(String[][] matrix, int[] start, int[] end) {
        if (start == null || end == null
                || !isWalkable(matrix, start[0], start[1]) || !isWalkable(matrix, end[0], end[1])) {
            return null;
        }

        GridSearch result = search(matrix, start, end);
        if (result.distances()[end[0]][end[1]] < 0) {
            return null;
        }

        List<int[]> path = new ArrayList<>();
        for (int[] at = end; at != null; at = result.parents()[at[0]][at[1]]) {
            path.add(at);
        }
        Collections.reverse(path);
        return path;
    }

    private GridSearch search(String[][] matrix, int[] start, int[] end) {
        int[][] distances = new int[StoreLayout.COLUMNS][StoreLayout.ROWS];
        for (int[] column : distances) {
            Arrays.fill(column, -1);
        }
        int[][][] parents = new int[StoreLayout.COLUMNS][StoreLayout.ROWS][];
        Queue<int[]> queue = new ArrayDeque<>();
        queue.add(start);
        distances[start[0]][start[1]] = 0;

        while (!queue.isEmpty()) {
            int[] node = queue.poll();
            if (Arrays.equals(node, end)) {
                break;
            }

            for (int d = 0; d < 8; d++) {
                int nx = node[0] + DX[d];
                int ny = node[1] + DY[d];

                if (!isWalkable(matrix, nx, ny) || distances[nx][ny] >= 0) {
                    continue;
                }
                if (DX[d] != 0 && DY[d] != 0
                        && (!isWalkable(matrix, node[0], ny) || !isWalkable(matrix, nx, node[1]))) {
                    continue;
                }

                distances[nx][ny] = distances[node[0]][node[1]] + 1;
                parents[nx][ny] = node;
                queue.add(new int[] { nx, ny });
            }
        }
        return new GridSearch(distances, parents);
    }

    private boolean isWalkable(String[][] matrix, int x, int y) {
        if (x < 0 || x >= StoreLayout.COLUMNS || y < 0 || y >= StoreLayout.ROWS) {
            return false;
        }
        String value = matrix[x][y];
        return value.isEmpty() || value.equals("EN") || value.equals("EX");
    }

    private record GridSearch(int[][] distances, int[][][] parents) {
    }

    public HashMap<Pair, Integer> findShortestDistancesBetweenProducts(String[][] matrix) {
        HashMap<String, int[]> products = findProducts(matrix);
        HashMap<Pair, Integer> distances = new HashMap<>();

        for (String i : products.keySet()) {
            for (String j : products.keySet()) {
                if (!i.equals(j)) {
                    int[] start = products.get(i);
                    int[] end = products.get(j);
                    List<int[]> path = bfsWithPath(matrix, start, end);
                    if (path != null) {
                        distances.put(new Pair(i, j), path.size() - 1);
                    } else {
                        distances.put(new Pair(i, j), -1);
                    }
                }
            }
        }

        return distances;
    }

    public HashMap<Pair, Integer> findShortestDistancesBetweenProductsAndCheckouts(String[][] matrix) {
        HashMap<String, int[]> products = findProducts(matrix);
        HashMap<String, int[]> checkouts = findCheckouts(matrix);
        HashMap<Pair, Integer> distances = new HashMap<>();

        for (String i : products.keySet()) {
            for (String j : checkouts.keySet()) {
                int[] start = products.get(i);
                int[] end = checkouts.get(j);
                List<int[]> path = bfsWithPath(matrix, start, end);
                if (path != null) {
                    distances.put(new Pair(i, j), path.size() - 1);
                } else {
                    distances.put(new Pair(i, j), -1);
                }
            }
        }

        return distances;
    }

    public HashMap<String, Integer> findShortestDistancesFromEntranceToProducts(String[][] matrix) {
        int[] entrance = findEntrance(matrix);
        HashMap<String, int[]> products = findProducts(matrix);
        HashMap<String, Integer> distances = new HashMap<>();

        if (entrance == null) {
            return distances;
        }

        for (String product : products.keySet()) {
            int[] start = entrance;
            int[] end = products.get(product);
            List<int[]> path = bfsWithPath(matrix, start, end);
            if (path != null) {
                distances.put(product, path.size() - 1);
            } else {
                distances.put(product, -1);
            }
        }

        return distances;
    }

    public HashMap<String, Integer> findShortestDistancesFromExitToCheckouts(String[][] matrix) {
        int[] exit = findExit(matrix);
        HashMap<String, int[]> checkouts = findCheckouts(matrix);
        HashMap<String, Integer> distances = new HashMap<>();

        if (exit == null) {
            return distances;
        }

        for (String checkout : checkouts.keySet()) {
            int[] start = exit;
            int[] end = checkouts.get(checkout);
            List<int[]> path = bfsWithPath(matrix, start, end);
            if (path != null) {
                distances.put(checkout, path.size() - 1);
            } else {
                distances.put(checkout, -1);
            }
        }

        return distances;
    }
}
