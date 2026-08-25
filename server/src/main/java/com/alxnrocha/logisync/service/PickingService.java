package com.alxnrocha.logisync.service;

import com.alxnrocha.logisync.domain.entity.PickingBatch;
import com.alxnrocha.logisync.domain.entity.PickingItem;
import com.alxnrocha.logisync.domain.enums.PickingBatchStatus;
import com.alxnrocha.logisync.dto.PickingBatchResponseDTO;
import com.alxnrocha.logisync.dto.ScanItemRequestDTO;
import com.alxnrocha.logisync.mapper.PickingMapper;
import com.alxnrocha.logisync.repository.PickingBatchRepository;
import com.alxnrocha.logisync.repository.PickingItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PickingService {

    private final PickingBatchRepository pickingBatchRepository;
    private final PickingItemRepository pickingItemRepository;
    private final PickingMapper pickingMapper;
    private final OutboxEventService outboxEventService;

    @Transactional(readOnly = true)
    public List<PickingBatchResponseDTO> getAllBatches() {
        List<PickingBatch> batches = pickingBatchRepository.findAll();
        return pickingMapper.toDTOList(batches);
    }

    @Transactional(readOnly = true)
    public PickingBatchResponseDTO getBatchById(UUID id) {
        PickingBatch batch = pickingBatchRepository.findByIdWithItems(id)
                .orElseThrow(() -> new IllegalArgumentException("Picking batch not found: " + id));
        return pickingMapper.toDTO(batch);
    }

    @Transactional
    public PickingBatchResponseDTO scanItem(UUID batchId, ScanItemRequestDTO request) {
        PickingBatch batch = pickingBatchRepository.findByIdWithItems(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Picking batch not found: " + batchId));

        PickingItem item = pickingItemRepository.findById(request.pickingItemId())
                .orElseThrow(() -> new IllegalArgumentException("Picking item not found: " + request.pickingItemId()));

        String expectedBarcode = item.getInventoryItem().getProduct().getBarcode();
        if (!expectedBarcode.equals(request.scannedBarcode())) {
            throw new IllegalArgumentException(String.format("Barcode mismatch! Expected: %s, Scanned: %s",
                    expectedBarcode, request.scannedBarcode()));
        }

        item.setIsScanned(true);
        item.setPickedQuantity(item.getRequiredQuantity());
        item.setStatus("COMPLETED");
        pickingItemRepository.save(item);

        // Recalculate batch progress
        int totalPicked = batch.getItems().stream()
                .filter(PickingItem::getIsScanned)
                .mapToInt(PickingItem::getPickedQuantity)
                .sum();
        batch.setPickedItems(totalPicked);

        boolean allCompleted = batch.getItems().stream().allMatch(PickingItem::getIsScanned);
        if (allCompleted) {
            batch.setStatus(PickingBatchStatus.PACKED);
        }

        PickingBatch saved = pickingBatchRepository.save(batch);
        log.info("[ITEM SCANNED] SKU {} barcode {} in batch {}", item.getInventoryItem().getProduct().getSku(), request.scannedBarcode(), batch.getBatchCode());
        return pickingMapper.toDTO(saved);
    }

    @Transactional
    public PickingBatchResponseDTO completeAndDispatchBatch(UUID batchId) {
        PickingBatch batch = pickingBatchRepository.findByIdWithItems(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Picking batch not found: " + batchId));

        batch.setStatus(PickingBatchStatus.DISPATCHED);
        PickingBatch saved = pickingBatchRepository.save(batch);

        // Disparar Outbox Event
        outboxEventService.publishEvent(
                "PickingBatch",
                saved.getBatchCode(),
                "ORDER_CONFIRMED",
                "supplychain.orders.confirmed",
                String.format("{\"batchCode\": \"%s\", \"customer\": \"%s\", \"status\": \"DISPATCHED\"}",
                        saved.getBatchCode(), saved.getCustomerName())
        );

        log.info("[BATCH DISPATCHED] Batch {} completed and dispatched", saved.getBatchCode());
        return pickingMapper.toDTO(saved);
    }
}
