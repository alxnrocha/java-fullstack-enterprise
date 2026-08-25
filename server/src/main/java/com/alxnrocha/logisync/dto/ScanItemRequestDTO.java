package com.alxnrocha.logisync.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ScanItemRequestDTO(
    @NotNull UUID pickingItemId,
    @NotBlank String scannedBarcode
) {}
