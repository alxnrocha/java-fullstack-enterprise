package com.alxnrocha.logisync.amqp;

import com.alxnrocha.logisync.config.RabbitMqConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SupplyChainEventListener {

    @RabbitListener(queues = RabbitMqConfig.QUEUE_ORDERS)
    public void handleOrderEvent(Object message) {
        log.info("[AMQP CONSUMER] Received event from {}: {}", RabbitMqConfig.QUEUE_ORDERS, message);
    }

    @RabbitListener(queues = RabbitMqConfig.QUEUE_INVENTORY)
    public void handleInventoryEvent(Object message) {
        log.info("[AMQP CONSUMER] Received event from {}: {}", RabbitMqConfig.QUEUE_INVENTORY, message);
    }

    @RabbitListener(queues = RabbitMqConfig.QUEUE_DISPATCH)
    public void handleDispatchEvent(Object message) {
        log.info("[AMQP CONSUMER] Received event from {}: {}", RabbitMqConfig.QUEUE_DISPATCH, message);
    }

    @RabbitListener(queues = RabbitMqConfig.QUEUE_TELEMETRY)
    public void handleTelemetryEvent(Object message) {
        log.info("[AMQP CONSUMER] Received event from {}: {}", RabbitMqConfig.QUEUE_TELEMETRY, message);
    }

    @RabbitListener(queues = RabbitMqConfig.QUEUE_DLQ)
    public void handleDeadLetterEvent(Object message) {
        log.warn("[AMQP DLQ MONITOR] Dead Letter Event Received: {}", message);
    }
}
