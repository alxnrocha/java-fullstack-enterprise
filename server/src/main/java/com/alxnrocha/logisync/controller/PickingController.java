package com.alxnrocha.logisync.controller;

import com.alxnrocha.logisync.dto.PickingBatchResponseDTO;
import com.alxnrocha.logisync.dto.ScanItemRequestDTO;
import com.alxnrocha.logisync.service.PickingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/picking")
@RequiredArgsConstructor
@Tag(name = "Picking Operations", description = "Warehouse Fulfillment, Barcode Scanning & Batch Dispatch")
@CrossOrigin(origins = "*")
public class PickingController {

    private final PickingService pickingService;

    @GetMapping("/batches")
    @Operation(summary = "List all picking batches")
    public ResponseEntity<List<PickingBatchResponseDTO>> getAllBatches() {
        return ResponseEntity.ok(pickingService.getAllBatches());
    }

    @GetMapping("/batches/{id}")
    @Operation(summary = "Get picking batch with all line items and progress")
    public ResponseEntity<PickingBatchResponseDTO> getBatchById(@PathVariable UUID id) {
        return ResponseEntity.ok(pickingService.getBatchById(id));
    }

    @PostMapping("/batches/{id}/scan")
    @Operation(summary = "Scan item barcode against batch checklist")
    public ResponseEntity<PickingBatchResponseDTO> scanItem(
            @PathVariable UUID id,
            @Valid @RequestBody ScanItemRequestDTO request
    ) {
        return ResponseEntity.ok(pickingService.scanItem(id, request));
    }

    @PostMapping("/batches/{id}/complete")
    @Operation(summary = "Complete batch and dispatch Outbox event")
    public ResponseEntity<PickingBatchResponseDTO> completeAndDispatchBatch(@PathVariable UUID id) {
        return ResponseEntity.ok(pickingService.completeAndDispatchBatch(id));
    }
}
