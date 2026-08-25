package com.alxnrocha.logisync.dto;

import com.alxnrocha.logisync.domain.enums.PickingBatchStatus;
import com.alxnrocha.logisync.domain.enums.PriorityLevel;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record PickingBatchResponseDTO(
    UUID id,
    String batchCode,
    UUID warehouseId,
    String warehouseCode,
    String warehouseName,
    String customerName,
    PriorityLevel priority,
    PickingBatchStatus status,
    Integer totalItems,
    Integer pickedItems,
    Double progressPercent,
    BigDecimal totalWeightKg,
    BigDecimal totalVolumeM3,
    List<PickingItemResponseDTO> items,
    OffsetDateTime createdAt
) {}
