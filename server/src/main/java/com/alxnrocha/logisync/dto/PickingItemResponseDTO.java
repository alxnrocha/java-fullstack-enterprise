package com.alxnrocha.logisync.dto;

import java.time.LocalDate;
import java.util.UUID;

public record PickingItemResponseDTO(
    UUID id,
    UUID inventoryItemId,
    String sku,
    String barcode,
    String productName,
    String batchNumber,
    String locationFormatted,
    Integer requiredQuantity,
    Integer pickedQuantity,
    Boolean isScanned,
    String status,
    LocalDate expirationDate
) {}
