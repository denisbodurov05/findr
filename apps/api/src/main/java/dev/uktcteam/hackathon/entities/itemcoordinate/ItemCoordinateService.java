package dev.uktcteam.hackathon.entities.itemcoordinate;

import dev.uktcteam.hackathon.entities.checkout.CheckoutRepository;
import dev.uktcteam.hackathon.entities.product.ProductRepository;
import dev.uktcteam.hackathon.entities.store.StoreRepository;
import dev.uktcteam.hackathon.entities.trafficflow.TrafficFlowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ItemCoordinateService {

    private final ItemCoordinateRepository itemCoordinateRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final CheckoutRepository checkoutRepository;
    private final TrafficFlowRepository trafficFlowRepository;

    @Autowired
    public ItemCoordinateService(ItemCoordinateRepository itemCoordinateRepository,
                                 StoreRepository storeRepository,
                                 ProductRepository productRepository,
                                 CheckoutRepository checkoutRepository,
                                 TrafficFlowRepository trafficFlowRepository) {
        this.itemCoordinateRepository = itemCoordinateRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.checkoutRepository = checkoutRepository;
        this.trafficFlowRepository = trafficFlowRepository;
    }

    public List<ItemCoordinate> getAllCoordinates() {
        return itemCoordinateRepository.findAll();
    }

    public ItemCoordinate saveCoordinate(ItemCoordinate itemCoordinate) {
        return itemCoordinateRepository.save(itemCoordinate);
    }

    public void deleteCoordinate(Long id) {
        itemCoordinateRepository.deleteById(id);
    }

    @Transactional
    public void replaceStoreLayout(Long storeId, List<LayoutCellDto> cells) {
        itemCoordinateRepository.deleteByStoreId(storeId);

        List<ItemCoordinate> coordinates = new ArrayList<>();

        for (LayoutCellDto cell : cells) {
            ItemCoordinate coordinate = new ItemCoordinate();
            coordinate.setStore(storeRepository.getReferenceById(storeId));
            coordinate.setX(cell.x());
            coordinate.setY(cell.y());

            switch (cell.kind()) {
                case "PRODUCT" -> coordinate.setProduct(productRepository.getReferenceById(cell.productId()));
                case "NORMAL_CHECKOUT" ->
                        coordinate.setCheckout(checkoutRepository.findByName("normal_checkout").orElseThrow());
                case "SELF_CHECKOUT" ->
                        coordinate.setCheckout(checkoutRepository.findByName("self_checkout").orElseThrow());
                case "ENTRY" -> coordinate.setTrafficFlow(trafficFlowRepository.findByName("entry").orElseThrow());
                case "EXIT" -> coordinate.setTrafficFlow(trafficFlowRepository.findByName("exit").orElseThrow());
                case "BLOCKED" ->
                        coordinate.setTrafficFlow(trafficFlowRepository.findByName("blocked_path").orElseThrow());
                default -> throw new IllegalArgumentException("Unknown layout cell kind: " + cell.kind());
            }

            coordinates.add(coordinate);
        }

        itemCoordinateRepository.saveAll(coordinates);
    }
}
