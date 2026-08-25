package com.alxnrocha.logisync.outbox;

import com.alxnrocha.logisync.config.RabbitMqConfig;
import com.alxnrocha.logisync.domain.entity.OutboxEvent;
import com.alxnrocha.logisync.domain.enums.OutboxStatus;
import com.alxnrocha.logisync.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxPublisherScheduler {

    private final OutboxEventRepository outboxEventRepository;
    private final RabbitTemplate rabbitTemplate;

    private static final int MAX_RETRY_COUNT = 3;

    @Scheduled(fixedDelayString = "${outbox.publisher.delay:2000}")
    @Transactional
    public void schedulePublishPendingEvents() {
        processPendingEvents();
    }

    @Transactional
    public int processPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);
        if (pendingEvents.isEmpty()) {
            return 0;
        }

        int publishedCount = 0;
        for (OutboxEvent event : pendingEvents) {
            try {
                rabbitTemplate.convertAndSend(
                        RabbitMqConfig.EXCHANGE_NAME,
                        event.getRoutingKey(),
                        event.getPayload()
                );

                event.setStatus(OutboxStatus.PUBLISHED);
                event.setPublishedAt(OffsetDateTime.now());
                event.setErrorMemo(null);
                publishedCount++;
                log.info("[OUTBOX PUBLISHED] Event {} sent to {} via key {}", event.getId(), RabbitMqConfig.EXCHANGE_NAME, event.getRoutingKey());
            } catch (Exception ex) {
                int nextRetry = event.getRetryCount() + 1;
                event.setRetryCount(nextRetry);
                event.setErrorMemo(ex.getMessage());

                if (nextRetry >= MAX_RETRY_COUNT) {
                    event.setStatus(OutboxStatus.FAILED);
                    log.error("[OUTBOX FAILED] Event {} reached max retries ({}) - error: {}", event.getId(), MAX_RETRY_COUNT, ex.getMessage());
                } else {
                    log.warn("[OUTBOX RETRY] Event {} failed attempt {} - will retry: {}", event.getId(), nextRetry, ex.getMessage());
                }
            }
            outboxEventRepository.save(event);
        }

        return publishedCount;
    }
}
