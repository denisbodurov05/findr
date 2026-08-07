package dev.uktcteam.hackathon.entities.checkout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutDto {

    private String checkoutId;
    private Long coordinateId;
}
