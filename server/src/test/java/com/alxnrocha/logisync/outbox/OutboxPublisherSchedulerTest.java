package com.alxnrocha.logisync.outbox;

import com.alxnrocha.logisync.config.RabbitMqConfig;
import com.alxnrocha.logisync.domain.entity.OutboxEvent;
import com.alxnrocha.logisync.domain.enums.OutboxStatus;
import com.alxnrocha.logisync.repository.OutboxEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OutboxPublisherSchedulerTest {

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private OutboxPublisherScheduler scheduler;

    private OutboxEvent pendingEvent;

    @BeforeEach
    void setUp() {
        pendingEvent = OutboxEvent.builder()
                .id(UUID.randomUUID())
                .aggregateType("Order")
                .aggregateId("ORD-2026-001")
                .eventType("ORDER_CREATED")
                .routingKey("supplychain.orders")
                .payload("{\"orderId\":\"ORD-2026-001\"}")
                .status(OutboxStatus.PENDING)
                .retryCount(0)
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should return 0 when no pending events exist")
    void shouldReturnZeroWhenNoPendingEvents() {
        when(outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING))
                .thenReturn(Collections.emptyList());

        int processed = scheduler.processPendingEvents();

        assertThat(processed).isZero();
        verifyNoInteractions(rabbitTemplate);
    }

    @Test
    @DisplayName("Should successfully publish pending event to RabbitMQ and mark as PUBLISHED")
    void shouldPublishPendingEventSuccessfully() {
        when(outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING))
                .thenReturn(List.of(pendingEvent));

        int processed = scheduler.processPendingEvents();

        assertThat(processed).isEqualTo(1);
        assertThat(pendingEvent.getStatus()).isEqualTo(OutboxStatus.PUBLISHED);
        assertThat(pendingEvent.getPublishedAt()).isNotNull();
        assertThat(pendingEvent.getErrorMemo()).isNull();

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMqConfig.EXCHANGE_NAME),
                eq("supplychain.orders"),
                eq("{\"orderId\":\"ORD-2026-001\"}")
        );
        verify(outboxEventRepository).save(pendingEvent);
    }

    @Test
    @DisplayName("Should increment retryCount when RabbitMQ publish fails")
    void shouldIncrementRetryOnFailure() {
        when(outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING))
                .thenReturn(List.of(pendingEvent));

        doThrow(new AmqpException("Broker connection refused"))
                .when(rabbitTemplate).convertAndSend(anyString(), anyString(), anyString());

        int processed = scheduler.processPendingEvents();

        assertThat(processed).isZero();
        assertThat(pendingEvent.getStatus()).isEqualTo(OutboxStatus.PENDING); // still pending for retry
        assertThat(pendingEvent.getRetryCount()).isEqualTo(1);
        assertThat(pendingEvent.getErrorMemo()).contains("Broker connection refused");

        verify(outboxEventRepository).save(pendingEvent);
    }

    @Test
    @DisplayName("Should mark event as FAILED when max retry count is reached")
    void shouldMarkAsFailedWhenMaxRetriesExceeded() {
        pendingEvent.setRetryCount(2); // Next retry will be 3 (MAX_RETRY_COUNT)

        when(outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING))
                .thenReturn(List.of(pendingEvent));

        doThrow(new AmqpException("Permanent unroutable exchange"))
                .when(rabbitTemplate).convertAndSend(anyString(), anyString(), anyString());

        int processed = scheduler.processPendingEvents();

        assertThat(processed).isZero();
        assertThat(pendingEvent.getStatus()).isEqualTo(OutboxStatus.FAILED);
        assertThat(pendingEvent.getRetryCount()).isEqualTo(3);
        assertThat(pendingEvent.getErrorMemo()).contains("Permanent unroutable exchange");

        verify(outboxEventRepository).save(pendingEvent);
    }
}
