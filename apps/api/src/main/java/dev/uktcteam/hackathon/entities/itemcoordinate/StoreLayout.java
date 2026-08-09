package dev.uktcteam.hackathon.entities.itemcoordinate;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public final class StoreLayout {

    public static final int COLUMNS = 41;
    public static final int ROWS = 21;
    public static final int MAX_CELLS = COLUMNS * ROWS;

    private StoreLayout() {
    }

    public static void validateCoordinates(int x, int y) {
        if (x < 0 || x >= COLUMNS || y < 0 || y >= ROWS) {
            throw new IllegalArgumentException(
                    "Coordinates must be inside the " + COLUMNS + "x" + ROWS + " store grid"
            );
        }
    }

    public static LayoutSummary validate(List<LayoutCellDto> cells) {
        if (cells == null) {
            throw new IllegalArgumentException("Layout cells are required");
        }
        if (cells.size() > MAX_CELLS) {
            throw new IllegalArgumentException("Layout contains more cells than the store grid");
        }

        Set<String> coordinates = new HashSet<>();
        Set<Long> productIds = new HashSet<>();
        Set<String> kinds = new HashSet<>();
        for (LayoutCellDto cell : cells) {
            if (cell == null) {
                throw new IllegalArgumentException("Layout cells cannot be null");
            }

            validateCoordinates(cell.x(), cell.y());
            if (!coordinates.add(cell.x() + "," + cell.y())) {
                throw new IllegalArgumentException("A coordinate can contain only one layout cell");
            }

            String kind = normalizeKind(cell.kind());
            kinds.add(kind);
            if (kind.equals("PRODUCT")) {
                if (cell.productId() == null) {
                    throw new IllegalArgumentException("Product cells require a product ID");
                }
                productIds.add(cell.productId());
            } else if (cell.productId() != null) {
                throw new IllegalArgumentException("Only product cells may include a product ID");
            }
        }

        return new LayoutSummary(Set.copyOf(productIds), Set.copyOf(kinds));
    }

    public static String normalizeKind(String kind) {
        if (kind == null || kind.isBlank()) {
            throw new IllegalArgumentException("Layout cell kind is required");
        }
        String normalized = kind.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "PRODUCT", "NORMAL_CHECKOUT", "SELF_CHECKOUT", "ENTRY", "EXIT", "BLOCKED" -> normalized;
            default -> throw new IllegalArgumentException("Unknown layout cell kind: " + kind);
        };
    }

    public record LayoutSummary(Set<Long> productIds, Set<String> kinds) {
    }
}
