package com.alxnrocha.logisync.controller;

import com.alxnrocha.logisync.dto.WarehouseResponseDTO;
import com.alxnrocha.logisync.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/warehouses")
@RequiredArgsConstructor
@Tag(name = "Warehouses", description = "Multi-Hub Warehouse Management & Capacity Endpoints")
@CrossOrigin(origins = "*")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    @Operation(summary = "List all warehouse hubs", description = "Retrieves all active European logistics centers with capacity utilization")
    public ResponseEntity<List<WarehouseResponseDTO>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID")
    public ResponseEntity<WarehouseResponseDTO> getWarehouseById(@PathVariable UUID id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get warehouse by code (e.g. W-ROT-01)")
    public ResponseEntity<WarehouseResponseDTO> getWarehouseByCode(@PathVariable String code) {
        return ResponseEntity.ok(warehouseService.getWarehouseByCode(code));
    }
}
