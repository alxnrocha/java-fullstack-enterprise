package com.alxnrocha.logisync.mapper;

import com.alxnrocha.logisync.domain.entity.OutboxEvent;
import com.alxnrocha.logisync.dto.OutboxEventResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Duration;
import java.util.List;

@Mapper(componentModel = "spring")
public interface OutboxMapper {

    @Mapping(target = "deliveryLatencyMs", expression = "java(calculateLatency(entity))")
    OutboxEventResponseDTO toDTO(OutboxEvent entity);

    List<OutboxEventResponseDTO> toDTOList(List<OutboxEvent> entities);

    default Long calculateLatency(OutboxEvent entity) {
        if (entity == null || entity.getCreatedAt() == null || entity.getPublishedAt() == null) {
            return 0L;
        }
        return Math.max(0L, Duration.between(entity.getCreatedAt(), entity.getPublishedAt()).toMillis());
    }
}
