export type TransportMode = 'ROAD_FREIGHT' | 'MARITIME' | 'AIR_CARGO' | 'RAIL_FREIGHT';
export type ShipmentStatus = 'DRAFT' | 'PENDING_PICK' | 'PICKED' | 'DISPATCHED' | 'IN_TRANSIT' | 'CUSTOMS_HOLD' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type OutboxStatus = 'PENDING' | 'PUBLISHED' | 'FAILED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ReorderStatus = 'OK' | 'LOW' | 'CRITICAL';
export type PickingBatchStatus = 'PENDING' | 'IN_PROGRESS' | 'PACKED' | 'VERIFIED' | 'DISPATCHED' | 'CANCELLED';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  capacityPallets: number;
  currentUtilization: number;
  utilizationPercent: number;
  status: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unitCost: number;
  unitOfMeasure: string;
  minThreshold: number;
  leadTimeDays: number;
}

export interface InventoryItem {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  productId: string;
  sku: string;
  barcode: string;
  productName: string;
  category: string;
  unitCost: number;
  batchNumber: string;
  locationAisle: string;
  locationRack: string;
  locationShelf: string;
  locationFormatted: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  expirationDate: string | null;
  reorderStatus: ReorderStatus;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  originWarehouseId: string;
  originWarehouseCode: string;
  originWarehouseName: string;
  destinationCity: string;
  destinationCountry: string;
  carrier: string;
  status: ShipmentStatus;
  transportMode: TransportMode;
  currentLatitude: number;
  currentLongitude: number;
  progressPercent: number;
  dispatchedAt: string;
  estimatedArrival: string;
  deliveredAt: string | null;
}

export interface PickingItem {
  id: string;
  inventoryItemId: string;
  sku: string;
  barcode: string;
  productName: string;
  batchNumber: string;
  locationFormatted: string;
  requiredQuantity: number;
  pickedQuantity: number;
  isScanned: boolean;
  status: string;
  expirationDate: string | null;
}

export interface PickingBatch {
  id: string;
  batchCode: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  customerName: string;
  priority: PriorityLevel;
  status: PickingBatchStatus;
  totalItems: number;
  pickedItems: number;
  progressPercent: number;
  totalWeightKg: number;
  totalVolumeM3: number;
  items: PickingItem[];
}

export interface OutboxEvent {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  routingKey: string;
  payload: string;
  status: OutboxStatus;
  retryCount: number;
  errorMemo: string | null;
  traceId: string;
  spanId: string;
  deliveryLatencyMs: number;
  createdAt: string;
  publishedAt: string | null;
}

export interface DashboardSummary {
  totalInventoryValuation: number;
  totalStockOnHand: number;
  totalQuantityReserved: number;
  activeShipmentsCount: number;
  orderFulfillmentSlaRate: number;
  warehouseUtilizationIndex: number;
  warehouses: Warehouse[];
  activeShipments: Shipment[];
  stockAlerts: InventoryItem[];
  recentOutboxEvents: OutboxEvent[];
}

export interface TelemetryMetrics {
  jvmMemoryUsedGb: number;
  jvmMemoryMaxGb: number;
  jvmMemoryUtilizationPercent: number;
  dbActiveConnections: number;
  dbMaxConnections: number;
  dbPoolSaturationPercent: number;
  messageThroughputPerSec: number;
  deadLetterQueueErrors: number;
  rabbitMqNodesHealthy: number;
  rabbitMqQueuesActive: number;
  rabbitMqConsumersActive: number;
  totalOutboxEventsProcessed: number;
  pendingOutboxEvents: number;
  failedOutboxEvents: number;
  deliverySuccessRatePercent: number;
}
