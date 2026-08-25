package com.alxnrocha.logisync.mapper;

import com.alxnrocha.logisync.domain.entity.Warehouse;
import com.alxnrocha.logisync.dto.WarehouseResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WarehouseMapper {

    @Mapping(target = "utilizationPercent", expression = "java(calculateUtilizationPercent(entity))")
    WarehouseResponseDTO toDTO(Warehouse entity);

    List<WarehouseResponseDTO> toDTOList(List<Warehouse> entities);

    default Double calculateUtilizationPercent(Warehouse entity) {
        if (entity == null || entity.getCapacityPallets() == null || entity.getCapacityPallets() == 0) {
            return 0.0;
        }
        int current = entity.getCurrentUtilization() != null ? entity.getCurrentUtilization() : 0;
        double pct = ((double) current / entity.getCapacityPallets()) * 100.0;
        return Math.round(pct * 10.0) / 10.0;
    }
}
