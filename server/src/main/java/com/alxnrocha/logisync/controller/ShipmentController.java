package com.alxnrocha.logisync.controller;

import com.alxnrocha.logisync.domain.enums.ShipmentStatus;
import com.alxnrocha.logisync.dto.DispatchShipmentRequestDTO;
import com.alxnrocha.logisync.dto.ShipmentResponseDTO;
import com.alxnrocha.logisync.service.ShipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
@Tag(name = "Shipments", description = "Freight Logistics, Live Fleet Tracking & Dispatch Control")
@CrossOrigin(origins = "*")
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    @Operation(summary = "Get all shipments", description = "Optionally filter by shipment status")
    public ResponseEntity<List<ShipmentResponseDTO>> getAllShipments(
            @RequestParam(required = false) ShipmentStatus status
    ) {
        return ResponseEntity.ok(shipmentService.getAllShipments(status));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active shipments in transit")
    public ResponseEntity<List<ShipmentResponseDTO>> getActiveShipments() {
        return ResponseEntity.ok(shipmentService.getActiveShipmentsInTransit());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shipment by ID")
    public ResponseEntity<ShipmentResponseDTO> getShipmentById(@PathVariable UUID id) {
        return ResponseEntity.ok(shipmentService.getShipmentById(id));
    }

    @GetMapping("/tracking/{trackingNumber}")
    @Operation(summary = "Get shipment by tracking number")
    public ResponseEntity<ShipmentResponseDTO> getShipmentByTrackingNumber(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(shipmentService.getShipmentByTrackingNumber(trackingNumber));
    }

    @PostMapping("/dispatch")
    @Operation(summary = "Dispatch a new shipment with Transactional Outbox event generation")
    public ResponseEntity<ShipmentResponseDTO> dispatchShipment(@Valid @RequestBody DispatchShipmentRequestDTO request) {
        ShipmentResponseDTO response = shipmentService.dispatchShipment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
