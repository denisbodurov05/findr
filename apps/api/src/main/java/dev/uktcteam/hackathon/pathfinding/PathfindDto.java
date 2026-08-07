package dev.uktcteam.hackathon.pathfinding;

import dev.uktcteam.hackathon.entities.product.ProductDto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PathfindDto {

    private Integer distance;

    private ProductDto[] sorted;

    private TwoPointPathDto[] pathfind;

}
