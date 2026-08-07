package dev.uktcteam.hackathon.entities.product;

import dev.uktcteam.hackathon.entities.product.request.CreateProductRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping()
    public ResponseEntity<ProductDto> createProduct(
            @RequestBody CreateProductRequest createProductRequest
    ) {
        ProductDto product = productService.createProduct(createProductRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }
    @GetMapping("/grouped-by-categories")
    public Map<String, List<ProductDto>> getAllProductsGroupedByCategories() {
        return productService.getAllProductsGroupedByCategories();
    }

}