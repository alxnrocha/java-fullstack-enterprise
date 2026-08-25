package com.alxnrocha.logisync.controller;

import com.alxnrocha.logisync.domain.entity.OutboxEvent;
import com.alxnrocha.logisync.dto.OutboxEventResponseDTO;
import com.alxnrocha.logisync.mapper.OutboxMapper;
import com.alxnrocha.logisync.outbox.OutboxPublisherScheduler;
import com.alxnrocha.logisync.service.OutboxEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/outbox")
@RequiredArgsConstructor
@Tag(name = "Outbox Pattern", description = "Transactional Outbox Event Inspector, Payloads & Reprocessing")
@CrossOrigin(origins = "*")
public class OutboxController {

    private final OutboxEventService outboxEventService;
    private final OutboxPublisherScheduler outboxPublisherScheduler;
    private final OutboxMapper outboxMapper;

    @GetMapping("/events")
    @Operation(summary = "Get recent outbox events", description = "Returns chronological event stream with delivery status and latency")
    public ResponseEntity<List<OutboxEventResponseDTO>> getRecentEvents() {
        List<OutboxEvent> events = outboxEventService.getRecentEvents();
        return ResponseEntity.ok(outboxMapper.toDTOList(events));
    }

    @GetMapping("/events/{id}")
    @Operation(summary = "Get outbox event by ID with JSON payload")
    public ResponseEntity<OutboxEventResponseDTO> getEventById(@PathVariable UUID id) {
        OutboxEvent event = outboxEventService.getEventById(id);
        return ResponseEntity.ok(outboxMapper.toDTO(event));
    }

    @PostMapping("/events/{id}/reprocess")
    @Operation(summary = "Reprocess a failed outbox event")
    public ResponseEntity<OutboxEventResponseDTO> reprocessEvent(@PathVariable UUID id) {
        OutboxEvent event = outboxEventService.reprocessEvent(id);
        return ResponseEntity.ok(outboxMapper.toDTO(event));
    }

    @PostMapping("/publish-pending")
    @Operation(summary = "Manually trigger immediate publishing of all pending outbox events")
    public ResponseEntity<Map<String, Object>> publishPendingEvents() {
        int count = outboxPublisherScheduler.processPendingEvents();
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "publishedCount", count));
    }
}
