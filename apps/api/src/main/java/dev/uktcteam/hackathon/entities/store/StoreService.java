package dev.uktcteam.hackathon.entities.store;

import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinate;
import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinateDetailsDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;

    public List<StoreSummaryDto> getStores() {
        return storeRepository.findAll(Sort.by("id")).stream()
                .map(this::toStoreSummaryDto)
                .toList();
    }

    public StoreDto getStore(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));

        StoreDto storeDto = new StoreDto();
        storeDto.setId(store.getId());
        storeDto.setName(store.getName());
        storeDto.setNameKey(getNameKey(store));
        storeDto.setDescription(store.getDescription());
        storeDto.setDescriptionKey(getDescriptionKey(store));
        storeDto.setAddress(store.getAddress());
        storeDto.setAddressKey(getAddressKey(store));

        int maxX = 0;
        int maxY = 0;
        for (ItemCoordinate item : store.getItemCoordinates()) {
            maxX = Math.max(maxX, item.getX());
            maxY = Math.max(maxY, item.getY());
        }

        ItemCoordinateDetailsDto[][] itemDetails = new ItemCoordinateDetailsDto[maxX+1][maxY+1];
        for (ItemCoordinate item : store.getItemCoordinates()) {
            ItemCoordinateDetailsDto itemCoordinateDetailsDto = new ItemCoordinateDetailsDto();

            if (item.isProduct()) {
                itemCoordinateDetailsDto.setIdentifierAndId(
                        "P" + item.getProduct().getId().toString()
                );
                itemCoordinateDetailsDto.setCategory(
                        "categories." + item.getProduct()
                                .getCategory()
                                .getName()
                );
            } else if (item.isCheckout()) {
                itemCoordinateDetailsDto.setIdentifierAndId(
                        "C"
                );
                itemCoordinateDetailsDto.setCategory(item.getCheckout().getName());
            } else if (item.isTrafficFlow()) {
                itemCoordinateDetailsDto.setIdentifierAndId(
                        "TF"
                );
                itemCoordinateDetailsDto.setCategory(item.getTrafficFlow().getName());
            }

            itemDetails[item.getX()][item.getY()] = itemCoordinateDetailsDto;
        }

        storeDto.setItemDetails(itemDetails);

        return storeDto;
    }

    private StoreSummaryDto toStoreSummaryDto(Store store) {
        StoreSummaryDto dto = new StoreSummaryDto();
        dto.setId(store.getId());
        dto.setName(store.getName());
        dto.setNameKey(getNameKey(store));
        dto.setDescription(store.getDescription());
        dto.setDescriptionKey(getDescriptionKey(store));
        dto.setAddress(store.getAddress());
        dto.setAddressKey(getAddressKey(store));
        return dto;
    }

    private String getNameKey(Store store) {
        return "stores." + store.getName() + ".name";
    }

    private String getDescriptionKey(Store store) {
        return "stores." + store.getName() + ".description";
    }

    private String getAddressKey(Store store) {
        return "stores." + store.getName() + ".address";
    }
}
