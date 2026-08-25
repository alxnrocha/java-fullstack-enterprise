package com.alxnrocha.logisync.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummaryDTO(
    BigDecimal totalInventoryValuation,
    Long totalStockOnHand,
    Long totalQuantityReserved,
    Long activeShipmentsCount,
    Double orderFulfillmentSlaRate,
    Double warehouseUtilizationIndex,
    List<WarehouseResponseDTO> warehouses,
    List<ShipmentResponseDTO> activeShipments,
    List<InventoryItemResponseDTO> stockAlerts,
    List<OutboxEventResponseDTO> recentOutboxEvents
) {}
