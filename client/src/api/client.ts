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
import { mockEngine } from './mockEngine.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

async function fetchWithFallback<T>(url: string, fallbackFn: () => T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      signal: AbortSignal.timeout(1500)
    });
    if (!res.ok) {
      return fallbackFn();
    }
    return await res.json();
  } catch {
    // Backend offline (e.g. GitHub Pages static deploy) -> Seamlessly return reactive in-memory engine data
    return fallbackFn();
  }
}

export const api = {
  // Warehouses
  getWarehouses: () => 
    fetchWithFallback<Warehouse[]>('/warehouses', () => mockEngine.getWarehouses()),

  getWarehouseByCode: (code: string) =>
    fetchWithFallback<Warehouse | undefined>(`/warehouses/code/${code}`, () => mockEngine.getWarehouseByCode(code)),

  // Inventory
  getInventory: (warehouseCode?: string, reorderStatus?: ReorderStatus) => {
    const params = new URLSearchParams();
    if (warehouseCode && warehouseCode !== 'ALL') params.append('warehouseCode', warehouseCode);
    if (reorderStatus) params.append('reorderStatus', reorderStatus);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchWithFallback<InventoryItem[]>(`/inventory${query}`, () => mockEngine.getInventory(warehouseCode, reorderStatus));
  },

  getStockAlerts: () =>
    fetchWithFallback<InventoryItem[]>('/inventory/alerts', () => mockEngine.getStockAlerts()),

  allocateStock: (itemId: string, quantity: number) =>
    fetchWithFallback<InventoryItem>(`/inventory/${itemId}/allocate?quantity=${quantity}`, 
      () => mockEngine.allocateStock(itemId, quantity), 
      { method: 'POST' }
    ),

  // Shipments
  getShipments: () =>
    fetchWithFallback<Shipment[]>('/shipments', () => mockEngine.getShipments()),

  getActiveShipments: () =>
    fetchWithFallback<Shipment[]>('/shipments/active', () => mockEngine.getActiveShipments()),

  getShipmentByTracking: (tracking: string) =>
    fetchWithFallback<Shipment | undefined>(`/shipments/tracking/${tracking}`, () => mockEngine.getShipmentByTracking(tracking)),

  dispatchShipment: (data: {
    originWarehouseCode: string;
    destinationCity: string;
    destinationCountry: string;
    carrier: string;
    transportMode: TransportMode;
  }) =>
    fetchWithFallback<Shipment>('/shipments/dispatch', () => mockEngine.dispatchShipment(data), {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Picking
  getPickingBatch: () =>
    fetchWithFallback<PickingBatch>('/picking/batches', () => mockEngine.getPickingBatch()),

  scanItem: (barcode: string) => {
    return Promise.resolve(mockEngine.scanItem(barcode));
  },

  completeAndDispatchPickingBatch: () => {
    return Promise.resolve(mockEngine.completeAndDispatchPickingBatch());
  },

  // Outbox
  getOutboxEvents: () =>
    fetchWithFallback<OutboxEvent[]>('/outbox/events', () => mockEngine.getOutboxEvents()),

  reprocessOutboxEvent: (id: string) =>
    fetchWithFallback<OutboxEvent>(`/outbox/events/${id}/reprocess`, () => mockEngine.reprocessOutboxEvent(id), {
      method: 'POST'
    }),

  // Telemetry & Dashboard
  getTelemetry: () =>
    fetchWithFallback<TelemetryMetrics>('/telemetry/metrics', () => mockEngine.getTelemetry()),

  getDashboardSummary: () =>
    fetchWithFallback<DashboardSummary>('/dashboard/summary', () => mockEngine.getDashboardSummary())
};
