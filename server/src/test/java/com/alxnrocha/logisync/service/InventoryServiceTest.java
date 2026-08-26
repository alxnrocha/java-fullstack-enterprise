package com.alxnrocha.logisync.service;

import com.alxnrocha.logisync.domain.entity.InventoryItem;
import com.alxnrocha.logisync.domain.entity.Product;
import com.alxnrocha.logisync.domain.entity.Warehouse;
import com.alxnrocha.logisync.domain.enums.ReorderStatus;
import com.alxnrocha.logisync.dto.InventoryItemResponseDTO;
import com.alxnrocha.logisync.dto.event.InventoryAllocatedEvent;
import com.alxnrocha.logisync.mapper.InventoryMapper;
import com.alxnrocha.logisync.repository.InventoryItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    @Mock
    private InventoryMapper inventoryMapper;

    @Mock
    private OutboxEventService outboxEventService;

    @InjectMocks
    private InventoryService inventoryService;

    private UUID itemId;
    private InventoryItem mockItem;
    private Product mockProduct;
    private Warehouse mockWarehouse;
    private InventoryItemResponseDTO mockDto;

    @BeforeEach
    void setUp() {
        itemId = UUID.randomUUID();

        mockProduct = Product.builder()
                .id(UUID.randomUUID())
                .sku("SKU-ROB-ARM-01")
                .name("Autonomous AGV Drive Motor Unit")
                .unitCost(new BigDecimal("1250.00"))
                .build();

        mockWarehouse = Warehouse.builder()
                .id(UUID.randomUUID())
                .code("W-ROT-01")
                .name("Rotterdam Central Hub")
                .build();

        mockItem = InventoryItem.builder()
                .id(itemId)
                .product(mockProduct)
                .warehouse(mockWarehouse)
                .quantityOnHand(100)
                .quantityReserved(20)
                .reorderStatus(ReorderStatus.OK)
                .build();

        mockDto = new InventoryItemResponseDTO(
                itemId,
                mockWarehouse.getId(),
                "W-ROT-01",
                "Rotterdam Central Hub",
                mockProduct.getId(),
                "SKU-ROB-ARM-01",
                "735008239001",
                "Autonomous AGV Drive Motor Unit",
                "INDUSTRIAL",
                new BigDecimal("1250.00"),
                "LOT-2026-001",
                "A01",
                "Rack-1",
                "Shelf-2",
                "A01/Rack-1/Shelf-2",
                100,
                30,
                70,
                null,
                ReorderStatus.OK,
                OffsetDateTime.now()
        );
    }

    @Test
    @DisplayName("Should return all inventory items mapped to DTOs")
    void shouldReturnAllInventoryItems() {
        when(inventoryItemRepository.findAll()).thenReturn(List.of(mockItem));
        when(inventoryMapper.toDTOList(any())).thenReturn(List.of(mockDto));

        List<InventoryItemResponseDTO> result = inventoryService.getAllInventory(null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).sku()).isEqualTo("SKU-ROB-ARM-01");
        verify(inventoryItemRepository).findAll();
    }

    @Test
    @DisplayName("Should return inventory filtered by warehouse code")
    void shouldReturnInventoryFilteredByWarehouseCode() {
        when(inventoryItemRepository.findByWarehouseCode("W-ROT-01")).thenReturn(List.of(mockItem));
        when(inventoryMapper.toDTOList(any())).thenReturn(List.of(mockDto));

        List<InventoryItemResponseDTO> result = inventoryService.getAllInventory("W-ROT-01", null);

        assertThat(result).hasSize(1);
        verify(inventoryItemRepository).findByWarehouseCode("W-ROT-01");
    }

    @Test
    @DisplayName("Should successfully allocate stock and publish Transactional Outbox event")
    void shouldAllocateStockSuccessfully() {
        when(inventoryItemRepository.findById(itemId)).thenReturn(Optional.of(mockItem));
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenReturn(mockItem);
        when(inventoryMapper.toDTO(any(InventoryItem.class))).thenReturn(mockDto);

        InventoryItemResponseDTO response = inventoryService.allocateStock(itemId, 10);

        assertThat(response).isNotNull();
        assertThat(mockItem.getQuantityReserved()).isEqualTo(30);

        verify(inventoryItemRepository).save(mockItem);
        verify(outboxEventService).publishEvent(
                eq("Inventory"),
                eq("SKU-ROB-ARM-01"),
                eq("INVENTORY_ALLOCATED"),
                eq("supplychain.inventory.allocated"),
                any(InventoryAllocatedEvent.class)
        );
    }

    @Test
    @DisplayName("Should throw IllegalStateException when allocating more than available quantity")
    void shouldThrowWhenAllocatingExcessQuantity() {
        when(inventoryItemRepository.findById(itemId)).thenReturn(Optional.of(mockItem));

        // Available is 100 - 20 = 80; requesting 85
        assertThatThrownBy(() -> inventoryService.allocateStock(itemId, 85))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Insufficient stock for SKU SKU-ROB-ARM-01");

        verify(inventoryItemRepository, never()).save(any());
        verify(outboxEventService, never()).publishEvent(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when inventory item is not found")
    void shouldThrowWhenItemNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(inventoryItemRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> inventoryService.allocateStock(nonExistentId, 5))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Inventory item not found");
    }
}
