package dev.uktcteam.hackathon.pathfinding.logic;

import dev.uktcteam.hackathon.entities.itemcoordinate.StoreLayout;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CoordinateMatrixTest {

    private final CoordinateMatrix matrixService = new CoordinateMatrix();

    @Test
    void missingEntranceAndExitProduceEmptyDistanceMaps() {
        String[][] matrix = emptyMatrix();
        matrix[3][3] = "P1";
        matrix[5][5] = "S1";

        assertTrue(matrixService.findShortestDistancesFromEntranceToProducts(matrix).isEmpty());
        assertTrue(matrixService.findShortestDistancesFromExitToCheckouts(matrix).isEmpty());
    }

    @Test
    void pathSearchHandlesMissingEndpoints() {
        assertNull(matrixService.bfsWithPath(emptyMatrix(), null, new int[] { 1, 1 }));
    }

    @Test
    void diagonalCannotEscapeBetweenBlockedCorners() {
        String[][] matrix = emptyMatrix();
        matrix[1][0] = "BL";
        matrix[0][1] = "BL";

        assertNull(matrixService.bfsWithPath(matrix, new int[] { 0, 0 }, new int[] { 1, 1 }));
    }

    @Test
    void diagonalDetoursAroundAShelfOrCheckoutCorner() {
        for (String obstacle : new String[] { "P1", "S1", "CA1", "BL" }) {
            String[][] matrix = emptyMatrix();
            matrix[1][0] = obstacle;

            var path = matrixService.bfsWithPath(matrix, new int[] { 0, 0 }, new int[] { 1, 1 });

            assertNotNull(path);
            assertEquals(3, path.size(), obstacle);
            assertWalkable(matrix, path);
        }
    }

    @Test
    void unobstructedDiagonalsRemainAvailable() {
        assertEquals(1, matrixService.bfs(emptyMatrix(), new int[] { 0, 0 }, new int[] { 1, 1 }));
    }

    @Test
    void shelfCellsCannotBeWalkingEndpoints() {
        String[][] matrix = emptyMatrix();
        matrix[1][1] = "P1";

        assertNull(matrixService.bfsWithPath(matrix, new int[] { 0, 1 }, new int[] { 1, 1 }));
        assertNull(matrixService.bfsWithPath(matrix, new int[] { 1, 1 }, new int[] { 2, 1 }));
    }

    @Test
    void aShelfWallCannotBeUsedToReachTheOtherSide() {
        String[][] matrix = emptyMatrix();
        matrix[0][1] = "EN";
        for (int y = 0; y < StoreLayout.ROWS; y++) {
            matrix[1][y] = "BL";
        }
        matrix[1][1] = "P1";
        matrix[3][1] = "P2";

        var stops = matrixService.findProducts(matrix);

        assertArrayEquals(new int[] { 0, 1 }, stops.get("P1"));
        assertNull(stops.get("P2"));
    }

    @Test
    void repeatedProductPlacementsUseTheNearestReachableAisle() {
        String[][] matrix = emptyMatrix();
        matrix[0][0] = "EN";
        matrix[1][0] = "P1";
        matrix[30][10] = "P1";

        assertArrayEquals(new int[] { 0, 0 }, matrixService.findProducts(matrix).get("P1"));
    }

    static void assertWalkable(String[][] matrix, List<int[]> path) {
        for (int index = 0; index < path.size(); index++) {
            int[] cell = path.get(index);
            assertTrue(isFloor(matrix[cell[0]][cell[1]]), Arrays.toString(cell));
            if (index == 0) {
                continue;
            }
            int[] previous = path.get(index - 1);
            assertEquals(1, Math.max(Math.abs(previous[0] - cell[0]), Math.abs(previous[1] - cell[1])));
            if (previous[0] != cell[0] && previous[1] != cell[1]) {
                assertTrue(isFloor(matrix[previous[0]][cell[1]]));
                assertTrue(isFloor(matrix[cell[0]][previous[1]]));
            }
        }
    }

    private static boolean isFloor(String value) {
        return value.isEmpty() || value.equals("EN") || value.equals("EX");
    }

    private String[][] emptyMatrix() {
        String[][] matrix = new String[StoreLayout.COLUMNS][StoreLayout.ROWS];
        for (String[] column : matrix) {
            Arrays.fill(column, "");
        }
        return matrix;
    }
}
