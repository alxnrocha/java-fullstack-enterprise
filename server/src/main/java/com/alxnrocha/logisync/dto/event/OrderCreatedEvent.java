package com.alxnrocha.logisync.dto.event;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderCreatedEvent(
    String orderNumber,
    String customerId,
    OffsetDateTime orderDate,
    List<OrderItemPayload> items
) {
    public record OrderItemPayload(
        String sku,
        Integer quantity,
        BigDecimal unitPrice
    ) {}
}
