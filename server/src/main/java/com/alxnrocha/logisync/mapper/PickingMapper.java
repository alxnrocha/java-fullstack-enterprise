package com.alxnrocha.logisync.mapper;

import com.alxnrocha.logisync.domain.entity.PickingBatch;
import com.alxnrocha.logisync.domain.entity.PickingItem;
import com.alxnrocha.logisync.dto.PickingBatchResponseDTO;
import com.alxnrocha.logisync.dto.PickingItemResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PickingMapper {

    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseCode", source = "warehouse.code")
    @Mapping(target = "warehouseName", source = "warehouse.name")
    @Mapping(target = "progressPercent", expression = "java(calculateProgress(entity))")
    @Mapping(target = "items", source = "items")
    PickingBatchResponseDTO toDTO(PickingBatch entity);

    List<PickingBatchResponseDTO> toDTOList(List<PickingBatch> entities);

    @Mapping(target = "inventoryItemId", source = "inventoryItem.id")
    @Mapping(target = "sku", source = "inventoryItem.product.sku")
    @Mapping(target = "barcode", source = "inventoryItem.product.barcode")
    @Mapping(target = "productName", source = "inventoryItem.product.name")
    @Mapping(target = "batchNumber", source = "inventoryItem.batchNumber")
    @Mapping(target = "locationFormatted", expression = "java(formatItemLocation(entity))")
    @Mapping(target = "expirationDate", source = "inventoryItem.expirationDate")
    PickingItemResponseDTO toItemDTO(PickingItem entity);

    List<PickingItemResponseDTO> toItemDTOList(List<PickingItem> entities);

    default Double calculateProgress(PickingBatch entity) {
        if (entity == null || entity.getTotalItems() == null || entity.getTotalItems() == 0) {
            return 0.0;
        }
        int picked = entity.getPickedItems() != null ? entity.getPickedItems() : 0;
        double pct = ((double) picked / entity.getTotalItems()) * 100.0;
        return Math.round(pct * 10.0) / 10.0;
    }

    default String formatItemLocation(PickingItem entity) {
        if (entity == null || entity.getInventoryItem() == null) return "";
        var inv = entity.getInventoryItem();
        return String.format("%s / %s / %s",
                inv.getLocationAisle() != null ? inv.getLocationAisle() : "",
                inv.getLocationRack() != null ? inv.getLocationRack() : "",
                inv.getLocationShelf() != null ? inv.getLocationShelf() : "");
    }
}
