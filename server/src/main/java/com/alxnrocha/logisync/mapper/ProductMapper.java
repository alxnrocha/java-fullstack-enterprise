package com.alxnrocha.logisync.mapper;

import com.alxnrocha.logisync.domain.entity.Product;
import com.alxnrocha.logisync.dto.ProductResponseDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductResponseDTO toDTO(Product entity);

    List<ProductResponseDTO> toDTOList(List<Product> entities);
}
