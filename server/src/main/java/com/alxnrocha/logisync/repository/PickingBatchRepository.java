package com.alxnrocha.logisync.repository;

import com.alxnrocha.logisync.domain.entity.PickingBatch;
import com.alxnrocha.logisync.domain.enums.PickingBatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PickingBatchRepository extends JpaRepository<PickingBatch, UUID> {

    Optional<PickingBatch> findByBatchCode(String batchCode);

    List<PickingBatch> findByWarehouseId(UUID warehouseId);

    List<PickingBatch> findByStatus(PickingBatchStatus status);

    @Query("SELECT b FROM PickingBatch b LEFT JOIN FETCH b.items WHERE b.id = :id")
    Optional<PickingBatch> findByIdWithItems(@Param("id") UUID id);
}
