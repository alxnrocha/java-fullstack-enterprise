package com.alxnrocha.logisync.controller;

import com.alxnrocha.logisync.domain.enums.ReorderStatus;
import com.alxnrocha.logisync.dto.InventoryItemResponseDTO;
import com.alxnrocha.logisync.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Multi-Tier Stock Matrix, SKU Management & Allocation")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "Get inventory items", description = "Filters items by warehouse code or reorder status")
    public ResponseEntity<List<InventoryItemResponseDTO>> getAllInventory(
            @RequestParam(required = false) String warehouseCode,
            @RequestParam(required = false) ReorderStatus reorderStatus
    ) {
        return ResponseEntity.ok(inventoryService.getAllInventory(warehouseCode, reorderStatus));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Get active stock alerts", description = "Returns SKUs marked as LOW or CRITICAL")
    public ResponseEntity<List<InventoryItemResponseDTO>> getStockAlerts() {
        return ResponseEntity.ok(inventoryService.getStockAlerts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inventory item by ID")
    public ResponseEntity<InventoryItemResponseDTO> getInventoryItemById(@PathVariable UUID id) {
        return ResponseEntity.ok(inventoryService.getInventoryItemById(id));
    }

    @PostMapping("/{id}/allocate")
    @Operation(summary = "Allocate stock quantity with transactional outbox trigger")
    public ResponseEntity<InventoryItemResponseDTO> allocateStock(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "1") int quantity
    ) {
        return ResponseEntity.ok(inventoryService.allocateStock(id, quantity));
    }
}
