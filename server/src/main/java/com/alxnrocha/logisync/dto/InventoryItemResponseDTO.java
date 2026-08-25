package com.alxnrocha.logisync.dto;

import com.alxnrocha.logisync.domain.enums.ReorderStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record InventoryItemResponseDTO(
    UUID id,
    UUID warehouseId,
    String warehouseCode,
    String warehouseName,
    UUID productId,
    String sku,
    String barcode,
    String productName,
    String category,
    BigDecimal unitCost,
    String batchNumber,
    String locationAisle,
    String locationRack,
    String locationShelf,
    String locationFormatted,
    Integer quantityOnHand,
    Integer quantityReserved,
    Integer quantityAvailable,
    LocalDate expirationDate,
    ReorderStatus reorderStatus,
    OffsetDateTime createdAt
) {}
