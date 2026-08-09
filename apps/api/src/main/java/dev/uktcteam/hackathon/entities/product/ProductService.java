package dev.uktcteam.hackathon.entities.product;

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

    public Map<String, List<ProductDto>> getAllProductsGroupedByCategories() {
        List<Product> products = productRepository.findAll();
        Map<String, List<ProductDto>> groupedProducts = products.stream()
                .filter(product -> !product.getIsGolden())
                .collect(Collectors.groupingBy(
                        product -> "categories." + product.getCategory().getName(),
                        Collectors.mapping(ProductDto::new, Collectors.toList())
                ));
        return groupedProducts;
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
