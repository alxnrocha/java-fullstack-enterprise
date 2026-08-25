package com.alxnrocha.logisync.dto.event;

public record InventoryAllocatedEvent(
    String sku,
    String warehouseCode,
    Integer allocatedQuantity,
    Integer remainingAvailable
) {}
