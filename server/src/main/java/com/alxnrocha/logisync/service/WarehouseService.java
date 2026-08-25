package com.alxnrocha.logisync.service;

import com.alxnrocha.logisync.domain.entity.Warehouse;
import com.alxnrocha.logisync.dto.WarehouseResponseDTO;
import com.alxnrocha.logisync.mapper.WarehouseMapper;
import com.alxnrocha.logisync.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

    @Transactional(readOnly = true)
    public List<WarehouseResponseDTO> getAllWarehouses() {
        List<Warehouse> warehouses = warehouseRepository.findAll();
        return warehouseMapper.toDTOList(warehouses);
    }

    @Transactional(readOnly = true)
    public WarehouseResponseDTO getWarehouseById(UUID id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found: " + id));
        return warehouseMapper.toDTO(warehouse);
    }

    @Transactional(readOnly = true)
    public WarehouseResponseDTO getWarehouseByCode(String code) {
        Warehouse warehouse = warehouseRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with code: " + code));
        return warehouseMapper.toDTO(warehouse);
    }
}
