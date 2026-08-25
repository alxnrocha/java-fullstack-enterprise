package com.alxnrocha.logisync.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record WarehouseResponseDTO(
    UUID id,
    String code,
    String name,
    String city,
    String country,
    BigDecimal latitude,
    BigDecimal longitude,
    Integer capacityPallets,
    Integer currentUtilization,
    Double utilizationPercent,
    String status,
    OffsetDateTime createdAt
) {}
