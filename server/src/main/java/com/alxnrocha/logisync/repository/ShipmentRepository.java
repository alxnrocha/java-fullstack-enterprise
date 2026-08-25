package com.alxnrocha.logisync.repository;

import com.alxnrocha.logisync.domain.entity.Shipment;
import com.alxnrocha.logisync.domain.enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    List<Shipment> findByStatus(ShipmentStatus status);

    @Query("SELECT s FROM Shipment s WHERE s.status = 'IN_TRANSIT' ORDER BY s.estimatedArrival ASC")
    List<Shipment> findActiveShipmentsInTransit();

    @Query("SELECT COUNT(s) FROM Shipment s WHERE s.status = 'IN_TRANSIT'")
    Long countActiveShipments();

    @Query("SELECT COUNT(s) FROM Shipment s WHERE s.status = 'DELIVERED'")
    Long countDeliveredShipments();
}
