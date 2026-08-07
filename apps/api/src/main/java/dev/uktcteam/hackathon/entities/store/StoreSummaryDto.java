package dev.uktcteam.hackathon.entities.store;

import lombok.Data;

@Data
public class StoreSummaryDto {
    private Long id;
    private String name;
    private String nameKey;
    private String description;
    private String descriptionKey;
    private String address;
    private String addressKey;
}
