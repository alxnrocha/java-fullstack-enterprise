import { describe, it, expect, beforeEach } from 'vitest';
import { useSupplyChainStore } from '../stores/useSupplyChainStore.ts';

describe('useSupplyChainStore', () => {
  beforeEach(() => {
    useSupplyChainStore.setState({
      activeTab: 'home',
      selectedWarehouseCode: 'ALL',
      searchQuery: '',
      isPickingDrawerOpen: false,
      isCreateShipmentModalOpen: false,
      isStockTransferModalOpen: false,
      selectedShipmentTracking: 'TRK-45872',
      selectedOutboxEventId: '10000000-0000-0000-0000-000000000001',
      notificationCount: 7,
    });
  });

  it('should initialize with default state', () => {
    const state = useSupplyChainStore.getState();
    expect(state.activeTab).toBe('home');
    expect(state.selectedWarehouseCode).toBe('ALL');
    expect(state.isCreateShipmentModalOpen).toBe(false);
    expect(state.searchQuery).toBe('');
    expect(state.selectedShipmentTracking).toBe('TRK-45872');
  });

  it('should update active tab correctly', () => {
    const { setActiveTab } = useSupplyChainStore.getState();
    setActiveTab('inventory');
    expect(useSupplyChainStore.getState().activeTab).toBe('inventory');

    setActiveTab('picking');
    expect(useSupplyChainStore.getState().activeTab).toBe('picking');

    setActiveTab('outbox');
    expect(useSupplyChainStore.getState().activeTab).toBe('outbox');
  });

  it('should toggle create shipment modal', () => {
    const { setIsCreateShipmentModalOpen } = useSupplyChainStore.getState();
    setIsCreateShipmentModalOpen(true);
    expect(useSupplyChainStore.getState().isCreateShipmentModalOpen).toBe(true);

    setIsCreateShipmentModalOpen(false);
    expect(useSupplyChainStore.getState().isCreateShipmentModalOpen).toBe(false);
  });

  it('should update search query', () => {
    const { setSearchQuery } = useSupplyChainStore.getState();
    setSearchQuery('ROB-ARM-770');
    expect(useSupplyChainStore.getState().searchQuery).toBe('ROB-ARM-770');
  });

  it('should select warehouse code and shipment tracking', () => {
    const { setSelectedWarehouseCode, setSelectedShipmentTracking, setSelectedOutboxEventId } = useSupplyChainStore.getState();
    setSelectedWarehouseCode('W-FRA-03');
    setSelectedShipmentTracking('TRK-88491');
    setSelectedOutboxEventId('evt-001');

    expect(useSupplyChainStore.getState().selectedWarehouseCode).toBe('W-FRA-03');
    expect(useSupplyChainStore.getState().selectedShipmentTracking).toBe('TRK-88491');
    expect(useSupplyChainStore.getState().selectedOutboxEventId).toBe('evt-001');
  });

  it('should clear notifications count', () => {
    const { clearNotifications } = useSupplyChainStore.getState();
    expect(useSupplyChainStore.getState().notificationCount).toBe(7);

    clearNotifications();
    expect(useSupplyChainStore.getState().notificationCount).toBe(0);
  });
});
