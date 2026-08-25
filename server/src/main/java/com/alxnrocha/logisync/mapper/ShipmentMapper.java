package com.alxnrocha.logisync.mapper;

import com.alxnrocha.logisync.domain.entity.Shipment;
import com.alxnrocha.logisync.dto.ShipmentResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ShipmentMapper {

    @Mapping(target = "originWarehouseId", source = "originWarehouse.id")
    @Mapping(target = "originWarehouseCode", source = "originWarehouse.code")
    @Mapping(target = "originWarehouseName", source = "originWarehouse.name")
    ShipmentResponseDTO toDTO(Shipment entity);

    List<ShipmentResponseDTO> toDTOList(List<Shipment> entities);
}
