package dev.uktcteam.hackathon.entities.itemcoordinate;

import lombok.Data;

@Data
public class ItemCoordinateDetailsDto {
    private String identifierAndId;
    private String indentifierAndId;
    private String category;

    public void setIdentifierAndId(String identifierAndId) {
        this.identifierAndId = identifierAndId;
        this.indentifierAndId = identifierAndId;
    }
}
