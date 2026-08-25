package com.alxnrocha.logisync.dto.event;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record TelemetryIngestedEvent(
    String trackingNumber,
    BigDecimal latitude,
    BigDecimal longitude,
    Double speedKmh,
    Double fuelPercent,
    OffsetDateTime recordedAt
) {}
