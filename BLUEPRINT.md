# ✦ LOGISYNC ENTERPRISE — BLUEPRINT OFICIAL ✦
## ERP Full Stack, Event-Driven Supply Chain & Global Logistics Platform

> **Portfólio Profissional — Projeto 20 (O Ápice do Portfólio)**  
> **Repositório GitHub:** `https://github.com/alxnrocha/java-fullstack-enterprise`  
> **Stack:** React 19 • TypeScript 5.8 • Vite 8 • Tailwind CSS v4 • Java 21 LTS • Spring Boot 3.3+ • Spring Data JPA • PostgreSQL 17 • RabbitMQ 3.13 (Event-Driven / Transactional Outbox Pattern) • Redis 7 • Flyway Migration • Springdoc OpenAPI 3.0 • Prometheus & Grafana • Testcontainers • Vitest • TanStack Table v8 • Recharts • Leaflet Maps • Docker Compose Multi-Container

---

## 1. Visão Executiva do Produto

**LogiSync Enterprise** é a plataforma definitiva de ERP e Gestão de Cadeia de Suprimentos (*Supply Chain Management*) com arquitetura orientada a eventos (*Event-Driven Architecture*), rastreamento logístico em tempo real e observabilidade industrial completa. Concebida para orquestrar operações de múltiplos armazéns globais (*Rotterdam, Barcelona, Frankfurt*), gestão de estoques por SKU/Lote/Validade, ordens de compra, separação de pedidos (*picking & packing*) e despacho rastreado.

### Pilares de Negócio:
1. **Rastreamento de Estoque Multi-Armazém & Localização Física:** Controle detalhado por Armazém, Corredor (*Aisle*), Rack e Prateleira (*Shelf*), incluindo lote de fabricação e validade com alertas automáticos de reposição e ruptura de estoque.
2. **Arquitetura Event-Driven com Transactional Outbox Pattern:** Garante consistência transacional atômica no PostgreSQL 17 antes de despachar eventos de negócio assíncronos (`ORDER_CREATED`, `INVENTORY_ALLOCATED`, `SHIPMENT_DISPATCHED`, `TELEMETRY_RECORDED`) para tópicos e filas do **RabbitMQ**, eliminando perda de mensagens e inconsistências de estado (*Dual-Write Problem*).
3. **Torre de Controle Logística & Rastreamento em Tempo Real:** Visualização geográfica interativa de remessas e frotas terrestres/marítimas, telemetria de trânsito, cálculo de SLA de entrega e estimativas dinâmicas de chegada (ETA).
4. **Terminal de Operações de Armazém & Picking Ágil:** Interface de alta densidade para operários e gerentes com conferência via código de barras, checklist guiado de separação e consolidação de pacotes para expedição.
5. **Observabilidade Total & Métricas de Telemetria:** Painel integrado de métricas em tempo real (taxa de vazão de mensagens RabbitMQ, saturação de pool HikariCP, uso de memória JVM, latência de filas e integridade da tabela de Outbox).

---

## 2. Arquitetura do Sistema

```text
20-java-fullstack-enterprise/
├── client/                               # Frontend React 19 + TypeScript + Vite + Tailwind v4
│   ├── src/
│   │   ├── api/                          # Cliente HTTP Axios tipado com suporte a modo Mock Standalone
│   │   ├── assets/                       # Estilos globais e tokens Enterprise ERP (Flexport/Samsara UI)
│   │   ├── components/
│   │   │   ├── dashboard/                # KPICards, FleetMap, OutboxStream, StockAlertsCard
│   │   │   ├── inventory/                # InventoryGrid (TanStack Table), SKUDetailDrawer, LocationBadge
│   │   │   ├── warehouses/               # WarehouseSelector, CapacityGauge, ZoneLayout
│   │   │   ├── picking/                  # PickingTerminalModal, BarcodeScanChecklist, DispatchAction
│   │   │   ├── shipments/                # ShipmentTrackerMap, TrackingTimeline, CarrierBadge
│   │   │   ├── outbox/                   # OutboxEventInspector, RabbitMQQueueMonitor, JSONPayloadViewer
│   │   │   ├── telemetry/                # PrometheusMetricsCharts, HikariPoolGauge, JvmMemoryCard
│   │   │   ├── layout/                   # AppHeader, SidebarNavigation, OutboxBrokerStatusBadge
│   │   │   └── ui/                       # Primitivas: Button, Card, Badge, Modal, Input, Select, Toast
│   │   ├── data/                         # Mock datasets realistas para preview perfeito no GitHub Pages
│   │   ├── stores/                       # Zustand 5 (SupplyChainState, SelectedWarehouse, FilterStore)
│   │   ├── types/                        # Interfaces e DTOs TypeScript espelhados no backend Java
│   │   ├── App.tsx                       # Layout mestre responsivo Industrial ERP
│   │   └── main.tsx                      # Ponto de entrada React
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                               # Backend Java 21 LTS + Spring Boot 3.3+
│   ├── src/main/java/com/alxnrocha/logisync/
│   │   ├── config/                       # RabbitMqConfig, OpenApiConfig, CorsConfig, JacksonConfig
│   │   ├── controller/                   # InventoryController, ShipmentController, OutboxController, MetricsController
│   │   ├── dto/                          # Java 21 Records (InventoryItemDTO, ShipmentDTO, OutboxEventDTO, CreateOrderDTO)
│   │   ├── entity/                       # JPA Entities (@Entity Warehouse, Product, InventoryItem, Shipment, OutboxEvent)
│   │   ├── enums/                        # ShipmentStatus, OutboxStatus, StockMovementType, PriorityLevel
│   │   ├── exception/                    # GlobalExceptionHandler (@RestControllerAdvice, RFC 7807)
│   │   ├── mapper/                       # MapStruct Mappers (Entity <-> DTO)
│   │   ├── outbox/                       # OutboxPublisherService, OutboxEventScheduler (@Scheduled)
│   │   ├── repository/                   # Spring Data JPA Repositories com queries customizadas JPQL
│   │   ├── service/                      # InventoryService, ShipmentService, OrderFulfillmentService, TelemetryService
│   │   └── LogiSyncApplication.java      # Spring Boot Main Class
│   ├── src/main/resources/
│   │   ├── db/migration/                 # V1__initial_schema.sql, V2__seed_supply_chain.sql (Flyway)
│   │   └── application.yml               # Configurações do datasource, RabbitMQ, Actuator e Swagger
│   ├── src/test/java/com/alxnrocha/logisync/
│   │   ├── integration/                  # Testes com Testcontainers (PostgreSQL 17 + RabbitMQ 3.13)
│   │   └── service/                      # Testes unitários do motor transacional e outbox (JUnit 5 + Mockito)
│   ├── pom.xml                           # Configuração Maven com Java 21, Spring Boot 3.3, AMQP
│   └── mvnw / mvnw.cmd                   # Maven Wrapper para execução autônoma
├── compose.yaml                          # Multi-container: Frontend Nginx + Backend + Postgres + RabbitMQ + Prometheus
├── design/
│   ├── mockup.png                        # Mockups oficiais de alta fidelidade
│   └── PROMPTS.md                        # Prompts de UI/UX (local, no .gitignore)
├── .github/workflows/deploy.yml          # CI/CD Pipeline (Maven build + Vitest + GitHub Pages Deploy)
├── .gitignore
├── BLUEPRINT.md
└── README.md                             # Documentação Executiva em Espanhol
```

---

## 3. Modelo de Banco de Dados Relacional (PostgreSQL 17)

```mermaid
erDiagram
    WAREHOUSES ||--o{ INVENTORY_ITEMS : "armazena"
    PRODUCTS ||--o{ INVENTORY_ITEMS : "possui estoque"
    SUPPLIERS ||--o{ PURCHASE_ORDERS : "fornece"
    PURCHASE_ORDERS ||--o{ ORDER_ITEMS : "contem"
    PRODUCTS ||--o{ ORDER_ITEMS : "item do pedido"
    WAREHOUSES ||--o{ SHIPMENTS : "origem"
    SHIPMENTS ||--o{ OUTBOX_EVENTS : "gera eventos"
    INVENTORY_ITEMS ||--o{ OUTBOX_EVENTS : "gera eventos"

    WAREHOUSES {
        uuid id PK
        string code UK "W-ROT-01"
        string name "Rotterdam Hub"
        string city "Rotterdam"
        string country "Netherlands"
        decimal latitude
        decimal longitude
        int capacity_pallets
        int current_utilization
        string status "ACTIVE"
    }

    PRODUCTS {
        uuid id PK
        string sku UK "SKU-IND-9021"
        string barcode UK "735008239012"
        string name "Precision Hydraulic Valve"
        string category "HYDRAULICS"
        decimal unit_cost
        int min_threshold
        string unit_of_measure "PCS"
    }

    INVENTORY_ITEMS {
        uuid id PK
        uuid warehouse_id FK
        uuid product_id FK
        string batch_number "LOT-2026-X4"
        string location_aisle "A04"
        string location_rack "R02"
        string location_shelf "S01"
        int quantity_on_hand
        int quantity_reserved
        date expiration_date
        timestamp created_at
    }

    SHIPMENTS {
        uuid id PK
        string tracking_number UK "TRK-EU-948291"
        uuid origin_warehouse_id FK
        string destination_city "Barcelona"
        string destination_country "Spain"
        string carrier "DHL Freight"
        string status "IN_TRANSIT"
        decimal latitude_current
        decimal longitude_current
        timestamp estimated_arrival
        timestamp dispatched_at
        timestamp delivered_at
    }

    OUTBOX_EVENTS {
        uuid id PK
        string aggregate_type "SHIPMENT / INVENTORY"
        uuid aggregate_id
        string event_type "SHIPMENT_DISPATCHED"
        string routing_key "supplychain.events.dispatch"
        jsonb payload
        string status "PENDING / PUBLISHED / FAILED"
        int retry_count
        timestamp created_at
        timestamp published_at
    }
```

---

## 4. Plano de Milestones & Issues (Protocolo FORGE-DEV)

### Milestone 1: Multi-Module Scaffolding & PostgreSQL Database Schema
- **Issue #1:** Bootstrap multi-module Java 21 LTS + Spring Boot 3.3 backend and React 19 SPA client.
- **Issue #3:** Implement PostgreSQL 17 Flyway migrations for supply chain schema and demo seeds.
- **Issue #4:** Develop JPA entities, repositories with custom JPQL queries, and domain enums.

### Milestone 2: RabbitMQ AMQP Infrastructure & Transactional Outbox Pattern
- **Issue #5:** Configure RabbitMQ infrastructure, exchange bindings, queues, and DLQ routing.
- **Issue #6:** Develop Transactional Outbox Pattern engine with atomic scheduler publisher.

### Milestone 3: REST API Controllers & Prometheus Observability Metrics
- **Issue #7:** Build REST API controllers (/inventory, /warehouses, /shipments, /outbox, /telemetry) with OpenAPI Swagger.

### Milestone 4: Industrial Design System & Standalone Mock Database Engine
- **Issue #10:** Implement Enterprise ERP design system (Tailwind v4), navigation shell, and theme tokens.
- **Issue #8:** Develop standalone mock database engine and typed API client for GitHub Pages demo mode.

### Milestone 5: Enterprise React 19 Logistics & Supply Chain UI Modules
- **Issue #9:** Build executive Supply Chain dashboard with KPI summary, route network map, and Recharts trends.
- **Issue #11:** Develop multi-warehouse inventory matrix using TanStack Table v8 with SKU drawer and filters.
- **Issue #12:** Build warehouse picking and packing terminal with barcode checklist and outbox dispatch trigger.
- **Issue #13:** Implement fleet and shipment tracking control tower with interactive route map and transit timeline.
- **Issue #14:** Develop outbox event inspector, RabbitMQ queue telemetry, and JSON payload viewer.

### Milestone 6: Automated Quality Assurance, CI/CD Pipeline & Production Deploy
- **Issue #15:** Write comprehensive automated test suite with JUnit 5, Mockito, Testcontainers (PostgreSQL + RabbitMQ) and Vitest.
- **Issue #16:** Configure GitHub Actions CI/CD pipeline, executive Spanish documentation, MIT License, and GitHub Pages deploy.
- **Issue #17:** Configure official GitHub repository settings (About, Homepage, Topics, and Badges).
