package com.alxnrocha.logisync.service;

import com.alxnrocha.logisync.domain.entity.Shipment;
import com.alxnrocha.logisync.domain.entity.Warehouse;
import com.alxnrocha.logisync.domain.enums.ShipmentStatus;
import com.alxnrocha.logisync.dto.DispatchShipmentRequestDTO;
import com.alxnrocha.logisync.dto.ShipmentResponseDTO;
import com.alxnrocha.logisync.dto.event.ShipmentDispatchedEvent;
import com.alxnrocha.logisync.mapper.ShipmentMapper;
import com.alxnrocha.logisync.repository.ShipmentRepository;
import com.alxnrocha.logisync.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final WarehouseRepository warehouseRepository;
    private final ShipmentMapper shipmentMapper;
    private final OutboxEventService outboxEventService;

    @Transactional(readOnly = true)
    public List<ShipmentResponseDTO> getAllShipments(ShipmentStatus status) {
        List<Shipment> shipments = (status != null)
                ? shipmentRepository.findByStatus(status)
                : shipmentRepository.findAll();
        return shipmentMapper.toDTOList(shipments);
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponseDTO> getActiveShipmentsInTransit() {
        List<Shipment> active = shipmentRepository.findActiveShipmentsInTransit();
        return shipmentMapper.toDTOList(active);
    }

    @Transactional(readOnly = true)
    public ShipmentResponseDTO getShipmentById(UUID id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found: " + id));
        return shipmentMapper.toDTO(shipment);
    }

    @Transactional(readOnly = true)
    public ShipmentResponseDTO getShipmentByTrackingNumber(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found with tracking number: " + trackingNumber));
        return shipmentMapper.toDTO(shipment);
    }

    @Transactional
    public ShipmentResponseDTO dispatchShipment(DispatchShipmentRequestDTO request) {
        Warehouse originWarehouse = warehouseRepository.findById(request.originWarehouseId())
                .orElseThrow(() -> new IllegalArgumentException("Origin warehouse not found: " + request.originWarehouseId()));

        String trackingNumber = "TRK-" + (10000 + (int)(Math.random() * 89999));

        Shipment shipment = Shipment.builder()
                .trackingNumber(trackingNumber)
                .originWarehouse(originWarehouse)
                .destinationCity(request.destinationCity())
                .destinationCountry(request.destinationCountry())
                .carrier(request.carrier())
                .transportMode(request.transportMode())
                .status(ShipmentStatus.IN_TRANSIT)
                .progressPercent(10)
                .currentLatitude(originWarehouse.getLatitude())
                .currentLongitude(originWarehouse.getLongitude())
                .dispatchedAt(OffsetDateTime.now())
                .estimatedArrival(OffsetDateTime.now().plusDays(2))
                .build();

        Shipment saved = shipmentRepository.save(shipment);

        // Transactional Outbox Event
        ShipmentDispatchedEvent event = new ShipmentDispatchedEvent(
                saved.getTrackingNumber(),
                originWarehouse.getCode(),
                saved.getDestinationCity(),
                saved.getDestinationCountry(),
                saved.getCarrier(),
                saved.getTransportMode().name(),
                saved.getDispatchedAt()
        );

        outboxEventService.publishEvent(
                "Shipment",
                saved.getTrackingNumber(),
                "SHIPMENT_DISPATCHED",
                "supplychain.events.dispatch",
                event
        );

        log.info("[SHIPMENT DISPATCHED] Tracking {} from {} to {}", saved.getTrackingNumber(), originWarehouse.getCode(), saved.getDestinationCity());
        return shipmentMapper.toDTO(saved);
    }
}
