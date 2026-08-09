package dev.uktcteam.hackathon.entities.product;

import dev.uktcteam.hackathon.entities.store.StoreRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;

    public Map<String, List<ProductDto>> getAllProductsGroupedByCategories() {
        return groupByCategory(productRepository.findAll());
    }

    public Map<String, List<ProductDto>> getProductsGroupedByCategories(Long storeId) {
        if (!storeRepository.existsById(storeId)) {
            throw new EntityNotFoundException("Store not found");
        }
        return groupByCategory(productRepository.findAvailableByStoreId(storeId));
    }

    private Map<String, List<ProductDto>> groupByCategory(List<Product> products) {
        return products.stream()
                .filter(product -> !product.getIsGolden())
                .collect(Collectors.groupingBy(
                        product -> "categories." + product.getCategory().getName(),
                        Collectors.mapping(ProductDto::new, Collectors.toList())
                ));
    }

    public ProductDto getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Product not found. Please provide a valid product id."
                        ));
        return new ProductDto(product);
    }
}
