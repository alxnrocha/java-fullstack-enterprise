package com.alxnrocha.logisync.dto;

import com.alxnrocha.logisync.domain.enums.TransportMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record DispatchShipmentRequestDTO(
    @NotNull UUID originWarehouseId,
    @NotBlank String destinationCity,
    @NotBlank String destinationCountry,
    @NotBlank String carrier,
    @NotNull TransportMode transportMode,
    String notes
) {}
