package dev.uktcteam.hackathon.entities.itemcoordinate;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class StoreLayoutTest {

    @Test
    void acceptsBoundaryCoordinates() {
        assertDoesNotThrow(() -> StoreLayout.validateCoordinates(0, 0));
        assertDoesNotThrow(() -> StoreLayout.validateCoordinates(40, 20));
    }

    @Test
    void rejectsCoordinatesOutsideTheGrid() {
        assertThrows(IllegalArgumentException.class, () -> StoreLayout.validateCoordinates(-1, 0));
        assertThrows(IllegalArgumentException.class, () -> StoreLayout.validateCoordinates(41, 20));
        assertThrows(IllegalArgumentException.class, () -> StoreLayout.validateCoordinates(40, 21));
    }

    @Test
    void rejectsDuplicateCoordinatesBeforePersistence() {
        List<LayoutCellDto> cells = List.of(
                new LayoutCellDto(2, 3, "BLOCKED", null),
                new LayoutCellDto(2, 3, "ENTRY", null)
        );

        assertThrows(IllegalArgumentException.class, () -> StoreLayout.validate(cells));
    }

    @Test
    void acceptsRepeatedProductAndToolPlacements() {
        List<LayoutCellDto> cells = List.of(
                new LayoutCellDto(2, 3, "PRODUCT", 10L),
                new LayoutCellDto(3, 3, "PRODUCT", 10L),
                new LayoutCellDto(4, 3, "ENTRY", null),
                new LayoutCellDto(5, 3, "ENTRY", null)
        );

        assertDoesNotThrow(() -> StoreLayout.validate(cells));
    }
}
