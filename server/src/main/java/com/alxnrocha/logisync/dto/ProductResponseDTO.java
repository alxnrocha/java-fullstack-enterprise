package com.alxnrocha.logisync.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ProductResponseDTO(
    UUID id,
    String sku,
    String barcode,
    String name,
    String category,
    BigDecimal unitCost,
    String unitOfMeasure,
    Integer minThreshold,
    Integer leadTimeDays,
    OffsetDateTime createdAt
) {}
