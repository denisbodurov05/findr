package dev.uktcteam.hackathon.entities.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByName(String name);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByIsGolden(boolean isGolden);

    @Query("""
            select distinct product
            from Product product
            join fetch product.category
            join product.itemCoordinates coordinate
            where coordinate.store.id = :storeId
            order by product.name
            """)
    List<Product> findAvailableByStoreId(@Param("storeId") Long storeId);
}
