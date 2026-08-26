import { create } from 'zustand';

export type NavTab = 'home' | 'shipments' | 'inventory' | 'warehouses' | 'picking' | 'tracking' | 'outbox';

interface SupplyChainStore {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  selectedWarehouseCode: string;
  setSelectedWarehouseCode: (code: string) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  isPickingDrawerOpen: boolean;
  setIsPickingDrawerOpen: (open: boolean) => void;

  isCreateShipmentModalOpen: boolean;
  setIsCreateShipmentModalOpen: (open: boolean) => void;

  isStockTransferModalOpen: boolean;
  setIsStockTransferModalOpen: (open: boolean) => void;

  selectedShipmentTracking: string | null;
  setSelectedShipmentTracking: (tracking: string | null) => void;

  selectedOutboxEventId: string | null;
  setSelectedOutboxEventId: (id: string | null) => void;

  notificationCount: number;
  clearNotifications: () => void;
}

export const useSupplyChainStore = create<SupplyChainStore>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedWarehouseCode: 'ALL',
  setSelectedWarehouseCode: (code) => set({ selectedWarehouseCode: code }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  isPickingDrawerOpen: false,
  setIsPickingDrawerOpen: (open) => set({ isPickingDrawerOpen: open }),

  isCreateShipmentModalOpen: false,
  setIsCreateShipmentModalOpen: (open) => set({ isCreateShipmentModalOpen: open }),

  isStockTransferModalOpen: false,
  setIsStockTransferModalOpen: (open) => set({ isStockTransferModalOpen: open }),

  selectedShipmentTracking: 'TRK-45872',
  setSelectedShipmentTracking: (tracking) => set({ selectedShipmentTracking: tracking }),

  selectedOutboxEventId: '10000000-0000-0000-0000-000000000001',
  setSelectedOutboxEventId: (id) => set({ selectedOutboxEventId: id }),

  notificationCount: 7,
  clearNotifications: () => set({ notificationCount: 0 }),
}));
