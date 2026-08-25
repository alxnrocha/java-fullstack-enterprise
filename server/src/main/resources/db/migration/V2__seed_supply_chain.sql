-- ==============================================================================
-- LOGISYNC ENTERPRISE CORE — DATABASE SEED V2 (PostgreSQL 17)
-- High-Fidelity Enterprise Supply Chain, Inventory Lots, Shipments & Outbox
-- ==============================================================================

-- 1. Insert 3 European Warehouse Hubs
INSERT INTO warehouses (id, code, name, city, country, latitude, longitude, capacity_pallets, current_utilization, status)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'W-ROT-01', 'Rotterdam Central', 'Rotterdam', 'Netherlands', 51.924420, 4.477733, 50000, 43600, 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000002', 'W-BCN-02', 'Barcelona Hub', 'Barcelona', 'Spain', 41.387917, 2.169919, 35000, 28000, 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000003', 'W-FRA-03', 'Frankfurt Terminal', 'Frankfurt', 'Germany', 50.110922, 8.682127, 40000, 31200, 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Products Master Catalog
INSERT INTO products (id, sku, barcode, name, category, unit_cost, unit_of_measure, min_threshold, lead_time_days)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'LGX-1001-RED-XL', '735008239001', 'LogiSync Premium T-Shirt Red / XL', 'APPAREL', 18.50, 'PCS', 50, 4),
    ('b0000000-0000-0000-0000-000000000002', 'LGX-1002-BLU-L', '735008239002', 'LogiSync Hoodie Blue / Large', 'APPAREL', 45.00, 'PCS', 40, 5),
    ('b0000000-0000-0000-0000-000000000003', 'LGX-2001-MUG-BLK', '735008239003', 'LogiSync Coffee Mug Black', 'ACCESSORIES', 12.00, 'PCS', 80, 3),
    ('b0000000-0000-0000-0000-000000000004', 'LGX-2002-BOT-750', '735008239004', 'LogiSync Water Bottle 750ml', 'ACCESSORIES', 19.90, 'PCS', 70, 4),
    ('b0000000-0000-0000-0000-000000000005', 'LGX-3001-CAP-BLK', '735008239005', 'LogiSync Baseball Cap Black', 'APPAREL', 16.00, 'PCS', 60, 3),
    ('b0000000-0000-0000-0000-000000000006', 'LGX-3002-SCK-WHT', '735008239006', 'LogiSync Socks White / Pack of 3', 'APPAREL', 9.50, 'PACK', 120, 2),
    ('b0000000-0000-0000-0000-000000000007', 'LGX-4001-BAG-GRY', '735008239007', 'LogiSync Backpack Grey', 'LUGGAGE', 68.00, 'PCS', 30, 7),
    ('b0000000-0000-0000-0000-000000000008', 'LGX-4002-WLT-8RN', '735008239008', 'LogiSync Wallet Brown Leather', 'ACCESSORIES', 32.00, 'PCS', 25, 4),
    ('b0000000-0000-0000-0000-000000000009', 'LGX-5001-USB-128', '735008239009', 'LogiSync USB Drive 128GB', 'ELECTRONICS', 24.50, 'PCS', 100, 3),
    ('b0000000-0000-0000-0000-000000000010', 'LGX-5002-PWR-BNK', '735008239010', 'LogiSync Power Bank 10000mAh', 'ELECTRONICS', 39.00, 'PCS', 50, 5),
    ('b0000000-0000-0000-0000-000000000011', 'SKU-LGX-4421', '735008239011', 'Industrial Servo Actuator 24V', 'INDUSTRIAL', 240.00, 'PCS', 150, 4),
    ('b0000000-0000-0000-0000-000000000012', 'SKU-TRK-7712', '735008239012', 'Hydraulic High-Pressure Flow Valve', 'HYDRAULICS', 310.00, 'PCS', 350, 6),
    ('b0000000-0000-0000-0000-000000000013', 'SKU-BXC-5520', '735008239013', 'Precision Optic Sensor Module', 'ELECTRONICS', 85.00, 'PCS', 80, 5)
ON CONFLICT (sku) DO NOTHING;

-- 3. Insert Inventory Items (Physical Stock & Shelf Assignment in Rotterdam W-ROT-01)
INSERT INTO inventory_items (id, warehouse_id, product_id, batch_number, location_aisle, location_rack, location_shelf, quantity_on_hand, quantity_reserved, expiration_date, reorder_status)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'LOT-2025-05-001', 'A3/04', 'Rack-B', 'Shelf-02', 120, 15, '2026-05-15', 'OK'),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'LOT-2025-05-002', 'A3/04', 'Rack-B', 'Shelf-03', 85, 20, '2026-06-20', 'LOW'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'LOT-2025-05-003', 'A3/05', 'Rack-A', 'Shelf-01', 340, 40, '2027-01-10', 'OK'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'LOT-2025-04-015', 'A3/05', 'Rack-A', 'Shelf-02', 210, 60, '2027-03-05', 'LOW'),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'LOT-2025-05-004', 'A3/06', 'Rack-C', 'Shelf-01', 560, 80, NULL, 'OK'),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'LOT-2025-05-005', 'A3/06', 'Rack-C', 'Shelf-02', 1250, 100, '2026-11-30', 'OK'),
    ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'LOT-2025-04-020', 'A3/07', 'Rack-D', 'Shelf-01', 65, 10, NULL, 'CRITICAL'),
    ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'LOT-2025-05-006', 'A3/07', 'Rack-D', 'Shelf-02', 95, 5, NULL, 'OK'),
    ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000009', 'LOT-2025-05-007', 'A3/08', 'Rack-E', 'Shelf-01', 430, 30, '2030-12-31', 'OK'),
    ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', 'LOT-2025-05-008', 'A3/08', 'Rack-E', 'Shelf-02', 180, 25, '2027-07-15', 'LOW'),
    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 'LOT-2025-03-011', 'A1/02', 'Rack-A', 'Shelf-01', 120, 10, NULL, 'CRITICAL'),
    ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012', 'LOT-2025-02-044', 'A1/03', 'Rack-B', 'Shelf-01', 320, 45, NULL, 'LOW'),
    ('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000013', 'LOT-2025-04-099', 'A2/01', 'Rack-A', 'Shelf-02', 450, 30, NULL, 'OK')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Active European Shipments & Live Freight Fleet
INSERT INTO shipments (id, tracking_number, origin_warehouse_id, destination_city, destination_country, carrier, status, transport_mode, current_latitude, current_longitude, progress_percent, dispatched_at, estimated_arrival)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'TRK-45872', 'a0000000-0000-0000-0000-000000000001', 'Barcelona', 'Spain', 'DHL Freight Express', 'IN_TRANSIT', 'ROAD_FREIGHT', 45.764043, 4.835659, 78, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '6 hours'),
    ('d0000000-0000-0000-0000-000000000002', 'TRK-88491', 'a0000000-0000-0000-0000-000000000003', 'Rotterdam', 'Netherlands', 'Kuehne + Nagel', 'IN_TRANSIT', 'ROAD_FREIGHT', 51.227741, 6.773456, 45, CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP + INTERVAL '14 hours'),
    ('d0000000-0000-0000-0000-000000000003', 'SHP-77421', 'a0000000-0000-0000-0000-000000000001', 'Barcelona', 'Spain', 'Maersk Line Maritime', 'IN_TRANSIT', 'MARITIME', 38.722252, -9.139337, 62, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '1 day'),
    ('d0000000-0000-0000-0000-000000000004', 'TRK-10294', 'a0000000-0000-0000-0000-000000000002', 'Frankfurt', 'Germany', 'DB Schenker Logistics', 'DELIVERED', 'ROAD_FREIGHT', 50.110922, 8.682127, 100, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '4 hours')
ON CONFLICT (tracking_number) DO NOTHING;

-- 5. Insert Active Picking Batch #PK-8842 (Rotterdam Hub)
INSERT INTO picking_batches (id, batch_code, warehouse_id, customer_name, priority, status, total_items, picked_items, total_weight_kg, total_volume_m3)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'PK-8842', 'a0000000-0000-0000-0000-000000000001', 'Global Retail Corp.', 'HIGH', 'IN_PROGRESS', 12, 6, 48.75, 0.86)
ON CONFLICT (batch_code) DO NOTHING;

-- 6. Insert Picking Items for #PK-8842
INSERT INTO picking_items (id, batch_id, inventory_item_id, required_quantity, picked_quantity, is_scanned, status)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 15, 15, TRUE, 'COMPLETED'),
    ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 40, 40, TRUE, 'COMPLETED'),
    ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 100, 60, FALSE, 'IN_PROGRESS'),
    ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 10, 0, FALSE, 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Initial Transactional Outbox Events
INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, routing_key, payload, status, retry_count, trace_id, span_id, created_at, published_at)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'Order',
        'ORD-884721',
        'ORDER_CREATED',
        'supplychain.orders',
        '{"orderNumber": "ORD-2025-001884721", "customerId": "CUST-100987", "orderDate": "2026-08-25T14:32:18Z", "items": [{"sku": "LGX-4421", "quantity": 2, "unitPrice": 129.99}]}'::jsonb,
        'PUBLISHED',
        0,
        '1-683e2f4a-7b9c2d8a0e3f4b2a1c6d7e8f',
        '6b7a8c9d0e1f2a3b',
        CURRENT_TIMESTAMP - INTERVAL '10 minutes',
        CURRENT_TIMESTAMP - INTERVAL '10 minutes' + INTERVAL '14 milliseconds'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'Inventory',
        'SKU-LGX-4421',
        'INVENTORY_ALLOCATED',
        'inventory.allocated',
        '{"sku": "LGX-4421", "warehouseCode": "W-ROT-01", "allocatedQuantity": 2, "remainingAvailable": 118}'::jsonb,
        'PUBLISHED',
        0,
        '2-794f3a5b-8c0d3e9b1f4a5c3b2d7e8f9a',
        '7c8b9d0e1f2a3b4c',
        CURRENT_TIMESTAMP - INTERVAL '8 minutes',
        CURRENT_TIMESTAMP - INTERVAL '8 minutes' + INTERVAL '16 milliseconds'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Shipment',
        'TRK-45872',
        'SHIPMENT_DISPATCHED',
        'supplychain.events.dispatch',
        '{"trackingNumber": "TRK-45872", "origin": "Rotterdam Central", "destination": "Barcelona Hub", "carrier": "DHL Freight Express", "carrierType": "ROAD_FREIGHT"}'::jsonb,
        'PUBLISHED',
        0,
        '3-8a5a4b6c-9d1e4f0c2a5b6d4c3e8f9a0b',
        '8d9c0e1f2a3b4c5d',
        CURRENT_TIMESTAMP - INTERVAL '5 minutes',
        CURRENT_TIMESTAMP - INTERVAL '5 minutes' + INTERVAL '12 milliseconds'
    ),
    (
        '10000000-0000-0000-0000-000000000004',
        'Telemetry',
        'TRK-45872',
        'TELEMETRY_INGESTED',
        'logistics.telemetry',
        '{"trackingNumber": "TRK-45872", "latitude": 45.764043, "longitude": 4.835659, "speedKmh": 82.4, "fuelPercent": 74.0}'::jsonb,
        'PUBLISHED',
        0,
        '4-9b6b5c7d-0e2f5a1d3b6c7e5d4f9a0b1c',
        '9e0d1f2a3b4c5d6e',
        CURRENT_TIMESTAMP - INTERVAL '2 minutes',
        CURRENT_TIMESTAMP - INTERVAL '2 minutes' + INTERVAL '9 milliseconds'
    )
ON CONFLICT (id) DO NOTHING;
