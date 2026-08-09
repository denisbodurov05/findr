package dev.uktcteam.hackathon.entities.itemcoordinate;

public record CreateItemCoordinateDto(
        Long storeId,
        int x,
        int y,
        String kind,
        Long productId
) {
}
