package com.alxnrocha.logisync.mapper;

import com.alxnrocha.logisync.domain.entity.InventoryItem;
import com.alxnrocha.logisync.dto.InventoryItemResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseCode", source = "warehouse.code")
    @Mapping(target = "warehouseName", source = "warehouse.name")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "barcode", source = "product.barcode")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "category", source = "product.category")
    @Mapping(target = "unitCost", source = "product.unitCost")
    @Mapping(target = "locationFormatted", expression = "java(formatLocation(entity))")
    @Mapping(target = "quantityAvailable", expression = "java(calculateAvailable(entity))")
    InventoryItemResponseDTO toDTO(InventoryItem entity);

    List<InventoryItemResponseDTO> toDTOList(List<InventoryItem> entities);

    default String formatLocation(InventoryItem entity) {
        if (entity == null) return "";
        return String.format("%s / %s / %s",
                entity.getLocationAisle() != null ? entity.getLocationAisle() : "",
                entity.getLocationRack() != null ? entity.getLocationRack() : "",
                entity.getLocationShelf() != null ? entity.getLocationShelf() : "");
    }

    default Integer calculateAvailable(InventoryItem entity) {
        if (entity == null || entity.getQuantityOnHand() == null) return 0;
        int reserved = entity.getQuantityReserved() != null ? entity.getQuantityReserved() : 0;
        return Math.max(0, entity.getQuantityOnHand() - reserved);
    }
}
