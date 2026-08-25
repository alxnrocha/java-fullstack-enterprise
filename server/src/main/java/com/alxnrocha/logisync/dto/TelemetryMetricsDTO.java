package com.alxnrocha.logisync.dto;

public record TelemetryMetricsDTO(
    Double jvmMemoryUsedGb,
    Double jvmMemoryMaxGb,
    Double jvmMemoryUtilizationPercent,
    Integer dbActiveConnections,
    Integer dbMaxConnections,
    Double dbPoolSaturationPercent,
    Long messageThroughputPerSec,
    Long deadLetterQueueErrors,
    Integer rabbitMqNodesHealthy,
    Integer rabbitMqQueuesActive,
    Integer rabbitMqConsumersActive,
    Long totalOutboxEventsProcessed,
    Long pendingOutboxEvents,
    Long failedOutboxEvents,
    Double deliverySuccessRatePercent
) {}
