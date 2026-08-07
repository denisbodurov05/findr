package dev.uktcteam.hackathon.pathfinding.logic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;

@Service
public class CoordinateMatrix {

    @Autowired
    private HashMapUtils hashMapUtils;

    public String[][] extractMatrix() {
        String[][] matrix = new String[41][21];

        for (int i = 0; i < 41; i++) {
            for (int j = 0; j < 21; j++) {
                matrix[i][j] = "";
            }
        }

        String csvFile = "src/main/resources/csv-data/placement.csv";
        String line;
        String csvSplitBy = ",";

        try (BufferedReader br = new BufferedReader(new FileReader(csvFile))) {
            br.readLine();

            while ((line = br.readLine()) != null) {
                String[] data = line.split(csvSplitBy);

                int x = Integer.parseInt(data[1]);
                int y = Integer.parseInt(data[2]);

                if (x >= 0 && x < 41 && y >= 0 && y < 21) {
                    matrix[x][y] = data[0];
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return matrix;
    }

    public ArrayList<Coordinate> findRouteBetween(String start, String end,
                                                  HashMap<Coordinate, Integer> shortestDistances,
                                                  HashMap<String, Coordinate> coordinates) {
        ArrayList<Coordinate> routeCoordinates = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        PriorityQueue<Coordinate> queue = new PriorityQueue<>(
                Comparator.comparingInt(coordinate -> coordinate.distance));

        queue.add(new Coordinate(start, start, 0));

        while (!queue.isEmpty()) {
            Coordinate current = queue.poll();

            if (visited.contains(current.point2)) {
                continue;
            }
            visited.add(current.point2);
            routeCoordinates.add(coordinates.get(current.point2));

            if (current.point2.equals(end)) {
                break;
            }

            for (Map.Entry<Coordinate, Integer> entry : shortestDistances.entrySet()) {
                Coordinate coordinate = entry.getKey();
                int distance = entry.getValue();

                if (coordinate.point1.equals(current.point2) && !visited.contains(coordinate.point2)) {
                    queue.add(new Coordinate(coordinate.point1, coordinate.point2, current.distance + distance));
                }
            }
        }

        return routeCoordinates;
    }

    public HashMap<String, int[]> findProducts(String[][] matrix) {
        HashMap<String, int[]> products = new HashMap<>();

        for (int i = 0; i < 41; i++) {
            for (int j = 0; j < 21; j++) {
                if (matrix[i][j].startsWith("P")) {
                    products.put(matrix[i][j], new int[] { i, j });
                }
            }
        }

        return products;
    }

    public HashMap<String, int[]> findCheckouts(String[][] matrix) {
        HashMap<String, int[]> checkouts = new HashMap<>();

        for (int i = 0; i < 41; i++) {
            for (int j = 0; j < 21; j++) {
                if (matrix[i][j].startsWith("S") || matrix[i][j].startsWith("CA")) {
                    checkouts.put(matrix[i][j], new int[] { i, j });
                }
            }
        }

        return checkouts;
    }

    public int[] findEntrance(String[][] matrix) {
        for (int i = 0; i < 41; i++) {
            for (int j = 0; j < 21; j++) {
                if (matrix[i][j].equals("EN")) {
                    return new int[] { i, j };
                }
            }
        }
        return null;
    }

    public int[] findExit(String[][] matrix) {
        for (int i = 0; i < 41; i++) {
            for (int j = 0; j < 21; j++) {
                if (matrix[i][j].equals("EX")) {
                    return new int[] { i, j };
                }
            }
        }
        return null;
    }

    public int bfs(String[][] matrix, int[] start, int[] end) {
        int[] dx = { 0, 0, 1, -1, 1, 1, -1, -1 };
        int[] dy = { 1, -1, 0, 0, 1, -1, 1, -1 };
        boolean[][] visited = new boolean[41][21];
        Queue<int[]> queue = new LinkedList<>();
        queue.add(start);
        visited[start[0]][start[1]] = true;
        int distance = 0;
        boolean fromProduct = matrix[start[0]][start[1]].startsWith("P");
        boolean checkoutPassed = matrix[start[0]][start[1]].startsWith("S")
                || matrix[start[0]][start[1]].startsWith("CA");
        ;

        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                int[] node = queue.poll();

                for (int d = 0; d < 8; d++) {
                    int nx = node[0] + dx[d];
                    int ny = node[1] + dy[d];

                    if (nx >= 0 && nx < 41 && ny >= 0 && ny < 21 && !visited[nx][ny] && !matrix[nx][ny].equals("BL")) {
                        if (fromProduct && matrix[nx][ny].startsWith("P")) {
                            continue;
                        }
                        if (matrix[nx][ny].startsWith("S") || matrix[nx][ny].startsWith("CA")) {
                            if (checkoutPassed) {
                                continue;
                            }
                        }
                        if (nx == end[0] && ny == end[1]) {
                            return distance + 1;
                        }
                        if (matrix[nx][ny].startsWith("P")) {
                            continue;
                        }
                        visited[nx][ny] = true;
                        queue.add(new int[] { nx, ny });
                        fromProduct = false;
                    }
                }
            }
            distance++;
        }
        return -1;
    }

    public List<int[]> bfsWithPath(String[][] matrix, int[] start, int[] end) {
        int[] dx = { 0, 0, 1, -1, 1, 1, -1, -1 };
        int[] dy = { 1, -1, 0, 0, 1, -1, 1, -1 };
        boolean[][] visited = new boolean[41][21];
        Queue<int[]> queue = new LinkedList<>();
        Map<int[], int[]> parent = new HashMap<>();
        queue.add(start);
        visited[start[0]][start[1]] = true;
        parent.put(start, null);
        boolean fromProduct = matrix[start[0]][start[1]].startsWith("P");
        boolean checkoutPassed = matrix[start[0]][start[1]].startsWith("S")
                || matrix[start[0]][start[1]].startsWith("CA");

        while (!queue.isEmpty()) {
            int[] node = queue.poll();

            for (int d = 0; d < 8; d++) {
                int nx = node[0] + dx[d];
                int ny = node[1] + dy[d];

                if (nx >= 0 && nx < 41 && ny >= 0 && ny < 21 && !visited[nx][ny] && !matrix[nx][ny].equals("BL")) {
                    if (fromProduct && matrix[nx][ny].startsWith("P")) {
                        continue;
                    }
                    if (matrix[nx][ny].startsWith("S") || matrix[nx][ny].startsWith("CA")) {
                        if (checkoutPassed) {
                            continue;
                        }
                    }
                    if (nx == end[0] && ny == end[1]) {
                        parent.put(end, node);
                        return reconstructPath(parent, start, end);
                    }
                    if (matrix[nx][ny].startsWith("P")) {
                        continue;
                    }
                    visited[nx][ny] = true;
                    int[] current = new int[] { nx, ny };
                    queue.add(current);
                    parent.put(current, node);
                }
            }
            fromProduct = false;
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

    public void saveRoutesToFiles() {
        String[][] matrix = extractMatrix();

        HashMap<Pair, Integer> shortestDistances = findShortestDistancesBetweenProducts(matrix);
        hashMapUtils.saveHashMapToFile(shortestDistances, "src/main/resources/algorithm-caches/shortestDistances.json");

        HashMap<Pair, Integer> productToCheckoutDistances = findShortestDistancesBetweenProductsAndCheckouts(matrix);
        hashMapUtils.saveHashMapToFile(productToCheckoutDistances,
                "src/main/resources/algorithm-caches/productToCheckoutDistances.json");

        HashMap<String, Integer> entranceToProductsDistances = findShortestDistancesFromEntranceToProducts(matrix);
        hashMapUtils.saveHashMapToFile(entranceToProductsDistances,
                "src/main/resources/algorithm-caches/entranceToProductsDistances.json");

        HashMap<String, Integer> exitToCheckoutsDistances = findShortestDistancesFromExitToCheckouts(matrix);
        hashMapUtils.saveHashMapToFile(exitToCheckoutsDistances,
                "src/main/resources/algorithm-caches/exitToCheckoutsDistances.json");
    }

    public void main(String[] args) {
        saveRoutesToFiles();
    }
}