package com.alxnrocha.logisync.dto.event;

import java.time.OffsetDateTime;

public record ShipmentDispatchedEvent(
    String trackingNumber,
    String originWarehouseCode,
    String destinationCity,
    String destinationCountry,
    String carrier,
    String transportMode,
    OffsetDateTime dispatchedAt
) {}
