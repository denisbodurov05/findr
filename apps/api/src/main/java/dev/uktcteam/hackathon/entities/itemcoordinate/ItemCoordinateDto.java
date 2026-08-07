package dev.uktcteam.hackathon.entities.itemcoordinate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemCoordinateDto {
    private Long id;
    private int x;
    private int y;
    private Long storeId;
    private Long productId;
    private Long checkoutId;
    private Long trafficFlowId;

    public ItemCoordinateDto(ItemCoordinate itemCoordinate) {
        this.id = itemCoordinate.getId();
        this.x = itemCoordinate.getX();
        this.y = itemCoordinate.getY();
        this.storeId = itemCoordinate.getStore().getId();
        this.productId = itemCoordinate.getProduct().getId();
        this.checkoutId = itemCoordinate.getCheckout().getId();
        this.trafficFlowId = itemCoordinate.getTrafficFlow().getId();
    }
}
