package com.alxnrocha.logisync.repository;

import com.alxnrocha.logisync.domain.entity.OutboxEvent;
import com.alxnrocha.logisync.domain.enums.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    List<OutboxEvent> findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus status);

    List<OutboxEvent> findByStatusAndRetryCountLessThan(OutboxStatus status, int maxRetries);

    @Query("SELECT e FROM OutboxEvent e ORDER BY e.createdAt DESC")
    List<OutboxEvent> findRecentEvents();

    @Query("SELECT COUNT(e) FROM OutboxEvent e WHERE e.status = 'FAILED'")
    Long countFailedEvents();

    @Query("SELECT COUNT(e) FROM OutboxEvent e WHERE e.status = 'PUBLISHED'")
    Long countPublishedEvents();

    @Query("SELECT COUNT(e) FROM OutboxEvent e WHERE e.status = 'PENDING'")
    Long countPendingEvents();
}
