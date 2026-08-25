package com.alxnrocha.logisync.service;

import com.alxnrocha.logisync.domain.entity.InventoryItem;
import com.alxnrocha.logisync.domain.enums.ReorderStatus;
import com.alxnrocha.logisync.dto.InventoryItemResponseDTO;
import com.alxnrocha.logisync.dto.event.InventoryAllocatedEvent;
import com.alxnrocha.logisync.mapper.InventoryMapper;
import com.alxnrocha.logisync.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryMapper inventoryMapper;
    private final OutboxEventService outboxEventService;

    @Transactional(readOnly = true)
    public List<InventoryItemResponseDTO> getAllInventory(String warehouseCode, ReorderStatus reorderStatus) {
        List<InventoryItem> items;
        if (warehouseCode != null && !warehouseCode.isBlank()) {
            items = inventoryItemRepository.findByWarehouseCode(warehouseCode);
        } else if (reorderStatus != null) {
            items = inventoryItemRepository.findByReorderStatus(reorderStatus);
        } else {
            items = inventoryItemRepository.findAll();
        }
        return inventoryMapper.toDTOList(items);
    }

    @Transactional(readOnly = true)
    public List<InventoryItemResponseDTO> getStockAlerts() {
        List<InventoryItem> alerts = inventoryItemRepository.findActiveStockAlerts();
        return inventoryMapper.toDTOList(alerts);
    }

    @Transactional(readOnly = true)
    public InventoryItemResponseDTO getInventoryItemById(UUID id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found: " + id));
        return inventoryMapper.toDTO(item);
    }

    @Transactional
    public InventoryItemResponseDTO allocateStock(UUID itemId, int quantity) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found: " + itemId));

        int available = item.getQuantityOnHand() - item.getQuantityReserved();
        if (quantity > available) {
            throw new IllegalStateException(String.format("Insufficient stock for SKU %s. Requested: %d, Available: %d",
                    item.getProduct().getSku(), quantity, available));
        }

        item.setQuantityReserved(item.getQuantityReserved() + quantity);
        InventoryItem saved = inventoryItemRepository.save(item);

        // Transactional Outbox Event
        InventoryAllocatedEvent event = new InventoryAllocatedEvent(
                item.getProduct().getSku(),
                item.getWarehouse().getCode(),
                quantity,
                item.getQuantityOnHand() - item.getQuantityReserved()
        );

        outboxEventService.publishEvent(
                "Inventory",
                item.getProduct().getSku(),
                "INVENTORY_ALLOCATED",
                "supplychain.inventory.allocated",
                event
        );

        log.info("[STOCK ALLOCATED] SKU {} quantity {} in warehouse {}", item.getProduct().getSku(), quantity, item.getWarehouse().getCode());
        return inventoryMapper.toDTO(saved);
    }
}
