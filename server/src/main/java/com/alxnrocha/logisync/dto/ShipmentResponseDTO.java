package com.alxnrocha.logisync.dto;

import com.alxnrocha.logisync.domain.enums.ShipmentStatus;
import com.alxnrocha.logisync.domain.enums.TransportMode;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ShipmentResponseDTO(
    UUID id,
    String trackingNumber,
    UUID originWarehouseId,
    String originWarehouseCode,
    String originWarehouseName,
    String destinationCity,
    String destinationCountry,
    String carrier,
    ShipmentStatus status,
    TransportMode transportMode,
    BigDecimal currentLatitude,
    BigDecimal currentLongitude,
    Integer progressPercent,
    OffsetDateTime dispatchedAt,
    OffsetDateTime estimatedArrival,
    OffsetDateTime deliveredAt
) {}
