package dev.uktcteam.hackathon.entities.product;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ProductDto {
    private Long productId;
    private String name;
    private String nameKey;
    private String image;
    private Long categoryId;
    private String categoryKey;
    @JsonProperty("isGolden")
    private boolean isGolden;

    ProductDto(Product product){
        this.productId = product.getId();
        this.name = product.getName();
        this.nameKey = "products." + product.getName();
        this.image = product.getImage();
        this.categoryId = product.getCategory().getId();
        this.categoryKey = "categories." + product.getCategory().getName();
        this.isGolden = product.getIsGolden();
    }
}
