package dev.uktcteam.hackathon.entities.itemcoordinate;

public record LayoutCellDto(
        int x,
        int y,
        String kind,
        Long productId
) {
}
