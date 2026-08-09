package dev.uktcteam.hackathon.entities.store;

import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinate;
import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinateDetailsDto;
import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinateRepository;
import dev.uktcteam.hackathon.entities.itemcoordinate.StoreLayout;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final ItemCoordinateRepository itemCoordinateRepository;

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
        storeDto.setDescription(store.getDescription());

        ItemCoordinateDetailsDto[][] itemDetails =
                new ItemCoordinateDetailsDto[StoreLayout.COLUMNS][StoreLayout.ROWS];
        for (ItemCoordinate item : store.getItemCoordinates()) {
            StoreLayout.validateCoordinates(item.getX(), item.getY());
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
        dto.setDescription(store.getDescription());
        return dto;
    }

    public Store createStore(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Store name is required");
        }
        String normalizedName = name.trim();
        if (normalizedName.length() > 255) {
            throw new IllegalArgumentException("Store name must be 255 characters or fewer");
        }

        Store store = new Store();
        store.setName(normalizedName);
        store.setDescription("");
        return storeRepository.save(store);
    }

    @Transactional
    public void deleteStore(Long storeId) {
        if (!storeRepository.existsById(storeId)) {
            throw new EntityNotFoundException("Store not found");
        }
        itemCoordinateRepository.deleteByStoreId(storeId);
        storeRepository.deleteById(storeId);
    }

    public StoreSummaryDto toStoreSummary(Store store) {
        return toStoreSummaryDto(store);
    }

}
