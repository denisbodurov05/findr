package dev.uktcteam.hackathon.entities.product;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/grouped-by-categories")
    public Map<String, List<ProductDto>> getAllProductsGroupedByCategories() {
        return productService.getAllProductsGroupedByCategories();
    }

}
