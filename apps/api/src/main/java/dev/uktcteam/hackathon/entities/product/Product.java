package dev.uktcteam.hackathon.entities.product;

import dev.uktcteam.hackathon.entities.category.Category;
import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinate;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "product",
    indexes = {
        @Index(name = "idx_is_golden", columnList = "is_golden")
    }
)
public class Product {

    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "image")
    private String image;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "is_golden", nullable = false)
    private Boolean isGolden;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCoordinate> itemCoordinates;

}
