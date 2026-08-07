package dev.uktcteam.hackathon.entities.checkout;

import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinate;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import static jakarta.persistence.GenerationType.SEQUENCE;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "checkout")
public class Checkout {

    @Id
    @SequenceGenerator(
            name = "checkout_sequence",
            sequenceName = "checkout_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = SEQUENCE,
            generator = "checkout_sequence"
    )
    @Column(
            name = "id",
            updatable = false
    )
    private Long id;

    private String name;

    @OneToMany(mappedBy = "checkout", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCoordinate> itemCoordinates;
}
