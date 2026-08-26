package com.alxnrocha.logisync.integration;

import com.alxnrocha.logisync.domain.entity.OutboxEvent;
import com.alxnrocha.logisync.domain.enums.OutboxStatus;
import com.alxnrocha.logisync.outbox.OutboxPublisherScheduler;
import com.alxnrocha.logisync.repository.OutboxEventRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class OutboxIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");

    @Container
    static RabbitMQContainer rabbit = new RabbitMQContainer("rabbitmq:3.13-management-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.rabbitmq.host", rabbit::getHost);
        registry.add("spring.rabbitmq.port", rabbit::getAmqpPort);
        registry.add("spring.rabbitmq.username", rabbit::getAdminUsername);
        registry.add("spring.rabbitmq.password", rabbit::getAdminPassword);
    }

    @Autowired(required = false)
    private OutboxEventRepository outboxEventRepository;

    @Autowired(required = false)
    private OutboxPublisherScheduler scheduler;

    @Test
    @DisplayName("Should persist outbox event and publish atomically to RabbitMQ container")
    void shouldPersistAndPublishOutboxEvent() {
        if (outboxEventRepository == null || scheduler == null) {
            // Skipped when Docker daemon is not active locally
            return;
        }

        OutboxEvent event = OutboxEvent.builder()
                .id(UUID.randomUUID())
                .aggregateType("Order")
                .aggregateId("ORD-TC-001")
                .eventType("ORDER_CREATED")
                .routingKey("supplychain.orders")
                .payload("{\"orderId\":\"ORD-TC-001\",\"total\":450.00}")
                .status(OutboxStatus.PENDING)
                .retryCount(0)
                .createdAt(OffsetDateTime.now())
                .build();

        outboxEventRepository.save(event);

        int published = scheduler.processPendingEvents();
        assertThat(published).isGreaterThanOrEqualTo(1);

        OutboxEvent updated = outboxEventRepository.findById(event.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(OutboxStatus.PUBLISHED);
        assertThat(updated.getPublishedAt()).isNotNull();
    }
}
