import { 
  Warehouse, 
  InventoryItem, 
  Shipment, 
  PickingBatch, 
  OutboxEvent, 
  DashboardSummary, 
  TelemetryMetrics,
  ReorderStatus,
  TransportMode
} from '../types/index.ts';
import { 
  initialWarehouses, 
  initialInventory, 
  initialShipments, 
  initialPickingBatch, 
  initialOutboxEvents, 
  initialTelemetryMetrics 
} from '../data/mockData.ts';

class MockEngine {
  private warehouses: Warehouse[] = [...initialWarehouses];
  private inventory: InventoryItem[] = [...initialInventory];
  private shipments: Shipment[] = [...initialShipments];
  private pickingBatch: PickingBatch = JSON.parse(JSON.stringify(initialPickingBatch));
  private outboxEvents: OutboxEvent[] = [...initialOutboxEvents];
  private telemetry: TelemetryMetrics = { ...initialTelemetryMetrics };

  // --- Warehouses ---
  public getWarehouses(): Warehouse[] {
    return [...this.warehouses];
  }

  public getWarehouseByCode(code: string): Warehouse | undefined {
    return this.warehouses.find(w => w.code === code);
  }

  // --- Inventory ---
  public getInventory(warehouseCode?: string, reorderStatus?: ReorderStatus): InventoryItem[] {
    let list = [...this.inventory];
    if (warehouseCode && warehouseCode !== 'ALL') {
      list = list.filter(item => item.warehouseCode === warehouseCode);
    }
    if (reorderStatus) {
      list = list.filter(item => item.reorderStatus === reorderStatus);
    }
    return list;
  }

  public getStockAlerts(): InventoryItem[] {
    return this.inventory.filter(item => item.reorderStatus === 'LOW' || item.reorderStatus === 'CRITICAL');
  }

  public allocateStock(itemId: string, quantity: number): InventoryItem {
    const index = this.inventory.findIndex(i => i.id === itemId);
    if (index === -1) throw new Error('Inventory item not found');

    const item = { ...this.inventory[index] };
    const available = item.quantityOnHand - item.quantityReserved;
    if (quantity > available) {
      throw new Error(`Insufficient stock for SKU ${item.sku}. Requested: ${quantity}, Available: ${available}`);
    }

    item.quantityReserved += quantity;
    item.quantityAvailable = item.quantityOnHand - item.quantityReserved;
    this.inventory[index] = item;

    // Disparar Outbox Event atômico
    this.publishOutboxEvent(
      'Inventory',
      item.sku,
      'INVENTORY_ALLOCATED',
      'inventory.allocated',
      JSON.stringify({
        sku: item.sku,
        warehouseCode: item.warehouseCode,
        allocatedQuantity: quantity,
        remainingAvailable: item.quantityAvailable
      }, null, 2)
    );

    return item;
  }

  // --- Shipments ---
  public getShipments(): Shipment[] {
    return [...this.shipments];
  }

  public getActiveShipments(): Shipment[] {
    return this.shipments.filter(s => s.status === 'IN_TRANSIT');
  }

  public getShipmentByTracking(tracking: string): Shipment | undefined {
    return this.shipments.find(s => s.trackingNumber === tracking);
  }

  public dispatchShipment(data: {
    originWarehouseCode: string;
    destinationCity: string;
    destinationCountry: string;
    carrier: string;
    transportMode: TransportMode;
  }): Shipment {
    const origin = this.warehouses.find(w => w.code === data.originWarehouseCode) || this.warehouses[0];
    const trackingNumber = `TRK-${Math.floor(10000 + Math.random() * 90000)}`;

    const newShipment: Shipment = {
      id: `d-${Date.now()}`,
      trackingNumber,
      originWarehouseId: origin.id,
      originWarehouseCode: origin.code,
      originWarehouseName: origin.name,
      destinationCity: data.destinationCity,
      destinationCountry: data.destinationCountry,
      carrier: data.carrier,
      status: 'IN_TRANSIT',
      transportMode: data.transportMode,
      currentLatitude: origin.latitude,
      currentLongitude: origin.longitude,
      progressPercent: 5,
      dispatchedAt: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      deliveredAt: null
    };

    this.shipments = [newShipment, ...this.shipments];

    // Outbox Event
    this.publishOutboxEvent(
      'Shipment',
      trackingNumber,
      'SHIPMENT_DISPATCHED',
      'supplychain.events.dispatch',
      JSON.stringify({
        trackingNumber,
        originWarehouse: origin.name,
        destinationCity: data.destinationCity,
        carrier: data.carrier,
        transportMode: data.transportMode,
        dispatchedAt: newShipment.dispatchedAt
      }, null, 2)
    );

    return newShipment;
  }

  // --- Picking & Packing ---
  public getPickingBatch(): PickingBatch {
    return { ...this.pickingBatch, items: [...this.pickingBatch.items] };
  }

  public scanItem(barcode: string): { success: boolean; message: string; batch: PickingBatch } {
    const item = this.pickingBatch.items.find(i => i.barcode === barcode);
    if (!item) {
      return { success: false, message: `Barcode ${barcode} not found in checklist!`, batch: this.getPickingBatch() };
    }

    item.isScanned = true;
    item.pickedQuantity = item.requiredQuantity;
    item.status = 'COMPLETED';

    const pickedCount = this.pickingBatch.items.filter(i => i.isScanned).length;
    this.pickingBatch.pickedItems = pickedCount;
    this.pickingBatch.progressPercent = Math.round((pickedCount / this.pickingBatch.items.length) * 100);

    if (pickedCount === this.pickingBatch.items.length) {
      this.pickingBatch.status = 'PACKED';
    }

    return { 
      success: true, 
      message: `Scanned SKU ${item.sku} successfully!`, 
      batch: this.getPickingBatch() 
    };
  }

  public completeAndDispatchPickingBatch(): PickingBatch {
    this.pickingBatch.status = 'DISPATCHED';

    this.publishOutboxEvent(
      'PickingBatch',
      this.pickingBatch.batchCode,
      'ORDER_CONFIRMED',
      'supplychain.orders',
      JSON.stringify({
        batchCode: this.pickingBatch.batchCode,
        customerName: this.pickingBatch.customerName,
        totalItems: this.pickingBatch.totalItems,
        weightKg: this.pickingBatch.totalWeightKg,
        status: 'DISPATCHED'
      }, null, 2)
    );

    return this.getPickingBatch();
  }

  // --- Outbox Events ---
  public getOutboxEvents(): OutboxEvent[] {
    return [...this.outboxEvents];
  }

  public reprocessOutboxEvent(id: string): OutboxEvent {
    const event = this.outboxEvents.find(e => e.id === id);
    if (!event) throw new Error('Outbox event not found');

    event.status = 'PUBLISHED';
    event.errorMemo = null;
    event.retryCount = 0;
    event.publishedAt = new Date().toISOString();
    return { ...event };
  }

  public publishOutboxEvent(
    aggregateType: string,
    aggregateId: string,
    eventType: string,
    routingKey: string,
    payload: string
  ): OutboxEvent {
    const newEvent: OutboxEvent = {
      id: `outbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      aggregateType,
      aggregateId,
      eventType,
      routingKey,
      payload,
      status: 'PUBLISHED',
      retryCount: 0,
      errorMemo: null,
      traceId: `1-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
      spanId: Math.random().toString(36).substring(2, 12),
      deliveryLatencyMs: Math.floor(8 + Math.random() * 12),
      createdAt: new Date().toISOString(),
      publishedAt: new Date(Date.now() + 15).toISOString()
    };

    this.outboxEvents = [newEvent, ...this.outboxEvents];
    this.telemetry.totalOutboxEventsProcessed += 1;
    return newEvent;
  }

  // --- Telemetry & Dashboard ---
  public getTelemetry(): TelemetryMetrics {
    return { ...this.telemetry };
  }

  public getDashboardSummary(): DashboardSummary {
    const valuation = this.inventory.reduce((acc, curr) => acc + (curr.quantityOnHand * curr.unitCost), 0);
    const stockOnHand = this.inventory.reduce((acc, curr) => acc + curr.quantityOnHand, 0);
    const reserved = this.inventory.reduce((acc, curr) => acc + curr.quantityReserved, 0);

    return {
      totalInventoryValuation: Math.round(valuation * 100) / 100,
      totalStockOnHand: stockOnHand,
      totalQuantityReserved: reserved,
      activeShipmentsCount: this.getActiveShipments().length,
      orderFulfillmentSlaRate: 99.4,
      warehouseUtilizationIndex: 87.2,
      warehouses: this.getWarehouses(),
      activeShipments: this.getActiveShipments(),
      stockAlerts: this.getStockAlerts(),
      recentOutboxEvents: this.getOutboxEvents().slice(0, 10)
    };
  }
}

export const mockEngine = new MockEngine();
