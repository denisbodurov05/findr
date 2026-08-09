package dev.uktcteam.hackathon.pathfinding.logic;

import dev.uktcteam.hackathon.entities.itemcoordinate.StoreLayout;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

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

    private String[][] emptyMatrix() {
        String[][] matrix = new String[StoreLayout.COLUMNS][StoreLayout.ROWS];
        for (String[] column : matrix) {
            Arrays.fill(column, "");
        }
        return matrix;
    }
}
