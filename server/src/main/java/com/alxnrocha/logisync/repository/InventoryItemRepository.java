package com.alxnrocha.logisync.repository;

import com.alxnrocha.logisync.domain.entity.InventoryItem;
import com.alxnrocha.logisync.domain.enums.ReorderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {

    List<InventoryItem> findByWarehouseId(UUID warehouseId);

    List<InventoryItem> findByWarehouseCode(String warehouseCode);

    List<InventoryItem> findByReorderStatus(ReorderStatus reorderStatus);

    @Query("SELECT i FROM InventoryItem i WHERE i.reorderStatus IN ('LOW', 'CRITICAL')")
    List<InventoryItem> findActiveStockAlerts();

    @Query("SELECT i FROM InventoryItem i WHERE i.warehouse.id = :warehouseId AND i.product.id = :productId")
    Optional<InventoryItem> findByWarehouseAndProduct(@Param("warehouseId") UUID warehouseId, @Param("productId") UUID productId);

    @Query("SELECT COALESCE(SUM(i.quantityOnHand * i.product.unitCost), 0) FROM InventoryItem i")
    BigDecimal calculateTotalInventoryValuation();

    @Query("SELECT COALESCE(SUM(i.quantityOnHand), 0) FROM InventoryItem i")
    Long getTotalStockOnHand();

    @Query("SELECT COALESCE(SUM(i.quantityReserved), 0) FROM InventoryItem i")
    Long getTotalQuantityReserved();
}
