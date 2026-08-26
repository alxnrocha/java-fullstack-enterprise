import { describe, it, expect, beforeEach } from 'vitest';
import { mockEngine } from '../api/mockEngine.ts';

describe('MockEngine Database & Event Dispatcher', () => {
  beforeEach(() => {
    mockEngine.reset();
  });

  it('should initialize with 3 European warehouses', () => {
    const warehouses = mockEngine.getWarehouses();
    expect(warehouses).toHaveLength(3);
    expect(warehouses.map(w => w.code)).toContain('W-ROT-01');
    expect(warehouses.map(w => w.code)).toContain('W-FRA-03');
    expect(warehouses.map(w => w.code)).toContain('W-BCN-02');
  });

  it('should retrieve inventory items with SKU metadata', () => {
    const items = mockEngine.getInventory();
    expect(items.length).toBeGreaterThan(0);
    const first = items[0];
    expect(first).toHaveProperty('sku');
    expect(first).toHaveProperty('quantityOnHand');
    expect(first).toHaveProperty('quantityReserved');
    expect(first).toHaveProperty('unitCost');
  });

  it('should successfully allocate inventory and publish outbox event', () => {
    const items = mockEngine.getInventory();
    const target = items[0];
    const initialReserved = target.quantityReserved;
    const initialEventsCount = mockEngine.getOutboxEvents().length;

    const updated = mockEngine.allocateStock(target.id, 10);
    expect(updated.quantityReserved).toBe(initialReserved + 10);

    const outboxEvents = mockEngine.getOutboxEvents();
    expect(outboxEvents.length).toBe(initialEventsCount + 1);
    const latestEvent = outboxEvents[0];
    expect(latestEvent.eventType).toBe('INVENTORY_ALLOCATED');
    expect(latestEvent.status).toBe('PUBLISHED');
  });

  it('should throw error when allocating more stock than available', () => {
    const items = mockEngine.getInventory();
    const target = items[0];
    const excess = target.quantityOnHand + 99999;

    expect(() => {
      mockEngine.allocateStock(target.id, excess);
    }).toThrow(/Insufficient stock/);
  });

  it('should dispatch a new cargo shipment and create outbox entry', () => {
    const initialShipments = mockEngine.getShipments().length;
    const initialEvents = mockEngine.getOutboxEvents().length;

    const newShipment = mockEngine.dispatchShipment({
      originWarehouseCode: 'W-ROT-01',
      destinationCity: 'Milan',
      destinationCountry: 'Italy',
      carrier: 'DHL Freight',
      transportMode: 'ROAD_FREIGHT'
    });

    expect(newShipment).toBeDefined();
    expect(newShipment.trackingNumber).toMatch(/^TRK-/);
    expect(newShipment.status).toBe('IN_TRANSIT');
    expect(mockEngine.getShipments().length).toBe(initialShipments + 1);
    expect(mockEngine.getOutboxEvents().length).toBe(initialEvents + 1);
  });

  it('should scan barcode item in picking batch', () => {
    const scanResult = mockEngine.scanItem('735008239006');
    expect(scanResult.success).toBe(true);
    expect(scanResult.message).toContain('Scanned SKU LGX-3002-SCK-WHT successfully!');
    expect(scanResult.batch.items.find(i => i.barcode === '735008239006')?.isScanned).toBe(true);
  });

  it('should reprocess failed outbox events', () => {
    const failedEvent = mockEngine.publishOutboxEvent(
      'Order',
      'ORD-999',
      'ORDER_CANCELLED',
      'supplychain.orders.deadletter',
      '{"reason": "timeout"}'
    );
    failedEvent.status = 'FAILED';

    const reprocessed = mockEngine.reprocessOutboxEvent(failedEvent.id);
    expect(reprocessed.status).toBe('PUBLISHED');
    expect(reprocessed.retryCount).toBeGreaterThan(0);
  });

  it('should return executive dashboard summary and telemetry', () => {
    const summary = mockEngine.getDashboardSummary();
    expect(summary.totalInventoryValuation).toBe(48920000);
    expect(summary.activeShipmentsCount).toBe(1428);
    expect(summary.orderFulfillmentSlaRate).toBe(99.4);

    const telemetry = mockEngine.getTelemetry();
    expect(telemetry.jvmMemoryUtilizationPercent).toBe(68.4);
    expect(telemetry.dbPoolSaturationPercent).toBe(42.7);
    expect(telemetry.messageThroughputPerSec).toBe(12500);
  });
});
