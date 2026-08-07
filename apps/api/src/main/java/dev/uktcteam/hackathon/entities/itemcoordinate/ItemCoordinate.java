package dev.uktcteam.hackathon.entities.itemcoordinate;


import dev.uktcteam.hackathon.entities.checkout.Checkout;
import dev.uktcteam.hackathon.entities.product.Product;
import dev.uktcteam.hackathon.entities.store.Store;
import dev.uktcteam.hackathon.entities.trafficflow.TrafficFlow;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import static jakarta.persistence.GenerationType.SEQUENCE;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "item_coordinate")
public class ItemCoordinate {

    @Id
    @SequenceGenerator(
            name = "coordinate_sequence",
            sequenceName = "coordinate_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = SEQUENCE,
            generator = "coordinate_sequence"
    )
    @Column(
            name = "id",
            updatable = false
    )
    private Long id;

    @Column(name = "x")
    private int x;

    @Column(name = "y")
    private int y;

    @ManyToOne
    @JoinColumn(name = "store_id", nullable = true)
    private Store store;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = true)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "checkout_id", nullable = true)
    private Checkout checkout;

    @ManyToOne
    @JoinColumn(name = "traffic_flow_id", nullable = true)
    private TrafficFlow trafficFlow;

    public boolean isProduct() {
        return product != null;
    }

    public boolean isCheckout() {
        return checkout != null;
    }

    public boolean isTrafficFlow() {
        return trafficFlow != null;
    }
}