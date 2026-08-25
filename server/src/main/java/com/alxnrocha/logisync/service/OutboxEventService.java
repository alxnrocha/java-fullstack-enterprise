package com.alxnrocha.logisync.service;

import com.alxnrocha.logisync.domain.entity.OutboxEvent;
import com.alxnrocha.logisync.domain.enums.OutboxStatus;
import com.alxnrocha.logisync.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxEventService {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public OutboxEvent publishEvent(String aggregateType, String aggregateId, String eventType, String routingKey, Object payload) {
        String jsonPayload;
        try {
            jsonPayload = (payload instanceof String) ? (String) payload : objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize outbox event payload for aggregate {}", aggregateId, e);
            throw new IllegalArgumentException("Payload serialization error", e);
        }

        String traceId = "1-" + UUID.randomUUID().toString().substring(0, 18);
        String spanId = UUID.randomUUID().toString().substring(0, 16);

        OutboxEvent event = OutboxEvent.builder()
                .aggregateType(aggregateType)
                .aggregateId(aggregateId)
                .eventType(eventType)
                .routingKey(routingKey)
                .payload(jsonPayload)
                .status(OutboxStatus.PENDING)
                .retryCount(0)
                .traceId(traceId)
                .spanId(spanId)
                .build();

        OutboxEvent saved = outboxEventRepository.save(event);
        log.info("[OUTBOX PERSISTED] Event {} type={} aggregateId={} routingKey={}", saved.getId(), eventType, aggregateId, routingKey);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<OutboxEvent> getRecentEvents() {
        return outboxEventRepository.findRecentEvents();
    }

    @Transactional(readOnly = true)
    public OutboxEvent getEventById(UUID id) {
        return outboxEventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Outbox event not found: " + id));
    }

    @Transactional
    public OutboxEvent reprocessEvent(UUID id) {
        OutboxEvent event = getEventById(id);
        event.setStatus(OutboxStatus.PENDING);
        event.setErrorMemo(null);
        return outboxEventRepository.save(event);
    }
}
