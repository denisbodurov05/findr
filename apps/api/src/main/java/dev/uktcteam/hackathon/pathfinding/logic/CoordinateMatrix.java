package dev.uktcteam.hackathon.pathfinding.logic;

import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinate;
import dev.uktcteam.hackathon.entities.itemcoordinate.StoreLayout;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CoordinateMatrix {

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
        HashMap<String, int[]> products = new HashMap<>();

        for (int i = 0; i < StoreLayout.COLUMNS; i++) {
            for (int j = 0; j < StoreLayout.ROWS; j++) {
                if (matrix[i][j].startsWith("P")) {
                    products.put(matrix[i][j], new int[] { i, j });
                }
            }
        }

        return products;
    }

    public HashMap<String, int[]> findCheckouts(String[][] matrix) {
        HashMap<String, int[]> checkouts = new HashMap<>();

        for (int i = 0; i < StoreLayout.COLUMNS; i++) {
            for (int j = 0; j < StoreLayout.ROWS; j++) {
                if (matrix[i][j].startsWith("S") || matrix[i][j].startsWith("CA")) {
                    checkouts.put(matrix[i][j], new int[] { i, j });
                }
            }
        }

        return checkouts;
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
        if (start == null || end == null) {
            return null;
        }
        if (Arrays.equals(start, end)) {
            return List.of(start);
        }

        int[] dx = { 0, 0, 1, -1, 1, 1, -1, -1 };
        int[] dy = { 1, -1, 0, 0, 1, -1, 1, -1 };
        boolean[][] visited = new boolean[StoreLayout.COLUMNS][StoreLayout.ROWS];
        Queue<int[]> queue = new LinkedList<>();
        Map<int[], int[]> parent = new HashMap<>();
        queue.add(start);
        visited[start[0]][start[1]] = true;
        parent.put(start, null);

        while (!queue.isEmpty()) {
            int[] node = queue.poll();

            for (int d = 0; d < 8; d++) {
                int nx = node[0] + dx[d];
                int ny = node[1] + dy[d];

                if (nx < 0 || nx >= StoreLayout.COLUMNS || ny < 0 || ny >= StoreLayout.ROWS || visited[nx][ny]) {
                    continue;
                }

                boolean isEnd = nx == end[0] && ny == end[1];
                String value = matrix[nx][ny];
                boolean occupiedStop = value.startsWith("P") || value.startsWith("S") || value.startsWith("CA");
                if (value.equals("BL") || (occupiedStop && !isEnd)) {
                    continue;
                }

                int[] current = isEnd ? end : new int[] { nx, ny };
                visited[nx][ny] = true;
                parent.put(current, node);
                if (isEnd) {
                    return reconstructPath(parent, start, end);
                }
                queue.add(current);
            }
        }
        return null;
    }

    public List<int[]> reconstructPath(Map<int[], int[]> parent, int[] start, int[] end) {
        List<int[]> path = new ArrayList<>();
        for (int[] at = end; at != null; at = parent.get(at)) {
            path.add(at);
        }
        Collections.reverse(path);
        return path;
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
