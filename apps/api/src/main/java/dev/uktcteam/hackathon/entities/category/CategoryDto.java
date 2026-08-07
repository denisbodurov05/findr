package dev.uktcteam.hackathon.entities.category;

import lombok.Data;

@Data
public class CategoryDto {
    private Long id;
    private String name;
    private String nameKey;

    public CategoryDto(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.nameKey = "categories." + category.getName();
    }
}
