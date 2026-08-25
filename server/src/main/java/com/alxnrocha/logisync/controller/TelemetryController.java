package com.alxnrocha.logisync.controller;

import com.alxnrocha.logisync.dto.TelemetryMetricsDTO;
import com.alxnrocha.logisync.service.TelemetryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/telemetry")
@RequiredArgsConstructor
@Tag(name = "Telemetry & Observability", description = "JVM, Connection Pool, and RabbitMQ Live Metrics")
@CrossOrigin(origins = "*")
public class TelemetryController {

    private final TelemetryService telemetryService;

    @GetMapping("/metrics")
    @Operation(summary = "Get system telemetry and message throughput metrics")
    public ResponseEntity<TelemetryMetricsDTO> getTelemetryMetrics() {
        return ResponseEntity.ok(telemetryService.getTelemetryMetrics());
    }
}
