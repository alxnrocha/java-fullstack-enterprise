package com.alxnrocha.logisync.repository;

import com.alxnrocha.logisync.domain.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySku(String sku);

    Optional<Product> findByBarcode(String barcode);

    List<Product> findByCategory(String category);

    @Query("SELECT p FROM Product p WHERE LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchProducts(@Param("query") String query);
}
