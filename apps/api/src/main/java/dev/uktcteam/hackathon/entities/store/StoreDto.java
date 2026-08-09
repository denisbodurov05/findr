package dev.uktcteam.hackathon.entities.store;

import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinateDetailsDto;
import lombok.Data;

@Data
public class StoreDto {
    private Long id;
    private String name;
    private String description;
    private ItemCoordinateDetailsDto[][] itemDetails;

}
