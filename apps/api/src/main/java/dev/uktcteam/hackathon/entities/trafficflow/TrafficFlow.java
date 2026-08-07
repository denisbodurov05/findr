package dev.uktcteam.hackathon.entities.trafficflow;

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
@Table(name = "traffic_flow")
public class TrafficFlow {
    @Id
    @SequenceGenerator(
            name = "traffic_flow_sequence",
            sequenceName = "traffic_flow_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = SEQUENCE,
            generator = "traffic_flow_sequence"
    )
    @Column(
            name = "id",
            updatable = false
    )
    private Long id;

    private String name;

    @OneToMany(mappedBy = "trafficFlow", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCoordinate> itemCoordinates;

}
