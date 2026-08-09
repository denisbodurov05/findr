package dev.uktcteam.hackathon.entities.itemcoordinate;

import dev.uktcteam.hackathon.entities.checkout.CheckoutRepository;
import dev.uktcteam.hackathon.entities.checkout.Checkout;
import dev.uktcteam.hackathon.entities.product.Product;
import dev.uktcteam.hackathon.entities.product.ProductRepository;
import dev.uktcteam.hackathon.entities.store.Store;
import dev.uktcteam.hackathon.entities.store.StoreRepository;
import dev.uktcteam.hackathon.entities.trafficflow.TrafficFlow;
import dev.uktcteam.hackathon.entities.trafficflow.TrafficFlowRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

    public List<ItemCoordinateDto> getAllCoordinates() {
        return itemCoordinateRepository.findAll().stream()
                .map(ItemCoordinateDto::new)
                .toList();
    }

    @Transactional
    public ItemCoordinateDto createCoordinate(CreateItemCoordinateDto request) {
        if (request == null || request.storeId() == null) {
            throw new IllegalArgumentException("Store ID is required");
        }

        StoreLayout.validateCoordinates(request.x(), request.y());
        if (itemCoordinateRepository.existsByStoreIdAndXAndY(request.storeId(), request.x(), request.y())) {
            throw new IllegalArgumentException("The selected coordinate is already occupied");
        }

        Store store = requireStore(request.storeId());
        String kind = StoreLayout.normalizeKind(request.kind());
        validateSingleCellRules(kind, request.productId());

        ItemCoordinate coordinate = buildCoordinate(
                new LayoutCellDto(request.x(), request.y(), kind, request.productId()),
                store,
                loadProducts(kind.equals("PRODUCT") ? Set.of(request.productId()) : Set.of()),
                loadCheckout(kind),
                loadTrafficFlow(kind)
        );

        return new ItemCoordinateDto(itemCoordinateRepository.save(coordinate));
    }

    @Transactional
    public Long deleteCoordinate(Long id) {
        ItemCoordinate coordinate = itemCoordinateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coordinate not found"));
        Long storeId = coordinate.getStore().getId();
        itemCoordinateRepository.delete(coordinate);
        return storeId;
    }

    @Transactional
    public void replaceStoreLayout(Long storeId, List<LayoutCellDto> cells) {
        Store store = requireStore(storeId);
        LayoutResources resources = validateAndLoadResources(cells);

        List<ItemCoordinate> coordinates = new ArrayList<>();
        for (LayoutCellDto cell : cells) {
            coordinates.add(buildCoordinate(
                    new LayoutCellDto(cell.x(), cell.y(), StoreLayout.normalizeKind(cell.kind()), cell.productId()),
                    store,
                    resources.products(),
                    resources.checkouts().get(StoreLayout.normalizeKind(cell.kind())),
                    resources.trafficFlows().get(StoreLayout.normalizeKind(cell.kind()))
            ));
        }

        itemCoordinateRepository.deleteByStoreId(storeId);
        itemCoordinateRepository.saveAll(coordinates);
    }

    private LayoutResources validateAndLoadResources(List<LayoutCellDto> cells) {
        StoreLayout.LayoutSummary summary = StoreLayout.validate(cells);

        Map<String, Checkout> checkouts = new HashMap<>();
        Map<String, TrafficFlow> trafficFlows = new HashMap<>();
        for (String kind : summary.kinds()) {
            Checkout checkout = loadCheckout(kind);
            TrafficFlow trafficFlow = loadTrafficFlow(kind);
            if (checkout != null) {
                checkouts.put(kind, checkout);
            }
            if (trafficFlow != null) {
                trafficFlows.put(kind, trafficFlow);
            }
        }

        return new LayoutResources(loadProducts(summary.productIds()), checkouts, trafficFlows);
    }

    private void validateSingleCellRules(String kind, Long productId) {
        if (kind.equals("PRODUCT")) {
            if (productId == null) {
                throw new IllegalArgumentException("Product cells require a product ID");
            }
        } else if (productId != null) {
            throw new IllegalArgumentException("Only product cells may include a product ID");
        }
    }

    private Store requireStore(Long storeId) {
        if (storeId == null) {
            throw new IllegalArgumentException("Store ID is required");
        }
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));
    }

    private Map<Long, Product> loadProducts(Set<Long> productIds) {
        Map<Long, Product> products = new HashMap<>();
        productRepository.findAllById(productIds).forEach(product -> products.put(product.getId(), product));
        if (products.size() != productIds.size()) {
            throw new EntityNotFoundException("One or more products were not found");
        }
        return products;
    }

    private Checkout loadCheckout(String kind) {
        String name = switch (kind) {
            case "NORMAL_CHECKOUT" -> "normal_checkout";
            case "SELF_CHECKOUT" -> "self_checkout";
            default -> null;
        };
        return name == null ? null : checkoutRepository.findByName(name)
                .orElseThrow(() -> new EntityNotFoundException("Checkout type not found: " + name));
    }

    private TrafficFlow loadTrafficFlow(String kind) {
        String name = trafficFlowName(kind);
        return name == null ? null : trafficFlowRepository.findByName(name)
                .orElseThrow(() -> new EntityNotFoundException("Traffic-flow type not found: " + name));
    }

    private String trafficFlowName(String kind) {
        return switch (kind) {
            case "ENTRY" -> "entry";
            case "EXIT" -> "exit";
            case "BLOCKED" -> "blocked_path";
            default -> null;
        };
    }

    private ItemCoordinate buildCoordinate(
            LayoutCellDto cell,
            Store store,
            Map<Long, Product> products,
            Checkout checkout,
            TrafficFlow trafficFlow
    ) {
        ItemCoordinate coordinate = new ItemCoordinate();
        coordinate.setStore(store);
        coordinate.setX(cell.x());
        coordinate.setY(cell.y());

        switch (cell.kind()) {
            case "PRODUCT" -> coordinate.setProduct(products.get(cell.productId()));
            case "NORMAL_CHECKOUT", "SELF_CHECKOUT" -> coordinate.setCheckout(checkout);
            case "ENTRY", "EXIT", "BLOCKED" -> coordinate.setTrafficFlow(trafficFlow);
            default -> throw new IllegalArgumentException("Unknown layout cell kind: " + cell.kind());
        }
        return coordinate;
    }

    private record LayoutResources(
            Map<Long, Product> products,
            Map<String, Checkout> checkouts,
            Map<String, TrafficFlow> trafficFlows
    ) {
    }
}
