package com.alxnrocha.logisync.dto;

import com.alxnrocha.logisync.domain.enums.OutboxStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record OutboxEventResponseDTO(
    UUID id,
    String aggregateType,
    String aggregateId,
    String eventType,
    String routingKey,
    String payload,
    OutboxStatus status,
    Integer retryCount,
    String errorMemo,
    String traceId,
    String spanId,
    Long deliveryLatencyMs,
    OffsetDateTime createdAt,
    OffsetDateTime publishedAt
) {}
