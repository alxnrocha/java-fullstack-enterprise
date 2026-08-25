package com.alxnrocha.logisync.repository;

import com.alxnrocha.logisync.domain.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {

    Optional<Warehouse> findByCode(String code);

    List<Warehouse> findByStatus(String status);

    @Query("SELECT COALESCE(SUM(w.currentUtilization), 0) FROM Warehouse w WHERE w.status = 'ACTIVE'")
    Long getTotalCurrentUtilization();

    @Query("SELECT COALESCE(SUM(w.capacityPallets), 0) FROM Warehouse w WHERE w.status = 'ACTIVE'")
    Long getTotalCapacityPallets();
}
