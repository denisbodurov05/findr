package dev.uktcteam.hackathon.entities.product.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {
    private String name;
    private String image;
    private Long categoryId;
    private Boolean isGolden;
}
