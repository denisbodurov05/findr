package dev.uktcteam.hackathon.entities.product;

import dev.uktcteam.hackathon.entities.category.Category;
import dev.uktcteam.hackathon.entities.category.CategoryRepository;
import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinate;
import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinateRepository;
import dev.uktcteam.hackathon.entities.product.request.CreateProductRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ItemCoordinateRepository itemCoordinateRepository;
    private final CategoryRepository categoryRepository;

    public ProductDto createProduct(CreateProductRequest createProductRequest) {
        Category category = categoryRepository.findById(createProductRequest.getCategoryId())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Category not found. Please provide a valid category id."
                        ));

        Product product = Product.builder()
                .name(createProductRequest.getName())
                .image(createProductRequest.getImage())
                .category(category)
                .isGolden(createProductRequest.getIsGolden())
                .build();

        product = productRepository.save(product);

        return new ProductDto(product);
    }

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
