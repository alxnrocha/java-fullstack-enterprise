package com.alxnrocha.logisync.domain.entity;

import com.alxnrocha.logisync.domain.enums.ShipmentStatus;
import com.alxnrocha.logisync.domain.enums.TransportMode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 50)
    private String trackingNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "origin_warehouse_id", nullable = false)
    private Warehouse originWarehouse;

    @Column(name = "destination_city", nullable = false, length = 100)
    private String destinationCity;

    @Column(name = "destination_country", nullable = false, length = 100)
    private String destinationCountry;

    @Column(nullable = false, length = 100)
    private String carrier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ShipmentStatus status = ShipmentStatus.IN_TRANSIT;

    @Enumerated(EnumType.STRING)
    @Column(name = "transport_mode", nullable = false, length = 30)
    @Builder.Default
    private TransportMode transportMode = TransportMode.ROAD_FREIGHT;

    @Column(name = "current_latitude", precision = 10, scale = 6)
    private BigDecimal currentLatitude;

    @Column(name = "current_longitude", precision = 10, scale = 6)
    private BigDecimal currentLongitude;

    @Column(name = "progress_percent", nullable = false)
    @Builder.Default
    private Integer progressPercent = 0;

    @Column(name = "dispatched_at")
    private OffsetDateTime dispatchedAt;

    @Column(name = "estimated_arrival")
    private OffsetDateTime estimatedArrival;

    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
