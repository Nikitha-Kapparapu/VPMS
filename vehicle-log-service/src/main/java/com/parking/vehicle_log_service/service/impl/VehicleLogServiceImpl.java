package com.parking.vehicle_log_service.service.impl;
import com.parking.vehicle_log_service.feign.SlotServiceClient;

import org.springframework.beans.factory.annotation.Value;

import com.parking.vehicle_log_service.dto.VehicleEntryRequest;
import com.parking.vehicle_log_service.dto.VehicleExitRequest;
import com.parking.vehicle_log_service.dto.VehicleLogResponse;
import com.parking.vehicle_log_service.entity.VehicleLog;
import com.parking.vehicle_log_service.repository.VehicleLogRepository;
import com.parking.vehicle_log_service.service.VehicleLogService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
 
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
public class VehicleLogServiceImpl implements VehicleLogService {
 
    private final VehicleLogRepository logRepo;
    private final SlotServiceClient slotServiceClient;
    @Value("${slot.occupancy.field:occupied}")
    private String occupancyField;
 
    @Override
    public VehicleLogResponse logVehicleEntry(VehicleEntryRequest request) {
        VehicleLog log = new VehicleLog();
        log.setVehicleNumber(request.getVehicleNumber());
        log.setUserId(request.getUserId());
        log.setSlotId(request.getSlotId());
        log.setEntryTime(LocalDateTime.now());
 
        logRepo.save(log);
        // Update slot occupancy to true
        slotServiceClient.updatedSlot(
            request.getSlotId(),
            Map.of(occupancyField, true)
        );

 
        return mapToResponse(log);
    }
 
   
    @Override
public VehicleLogResponse logVehicleExit(VehicleExitRequest request) {
    VehicleLog log = logRepo.findById(request.getLogId())
            .orElseThrow(() -> new RuntimeException("Log not found"));

    if (log.getExitTime() != null) {
        throw new RuntimeException("Exit already recorded for this log");
    }

    log.setExitTime(LocalDateTime.now());
    Duration duration = Duration.between(log.getEntryTime(), log.getExitTime());
    long seconds = duration.getSeconds();
    String formattedDuration = String.format("%02d:%02d:%02d",
            seconds / 3600,
            (seconds % 3600) / 60,
            seconds % 60);

    // If you want to store as String in VehicleLog:
    // log.setDuration(formattedDuration);

    // If you want to keep minutes as long, keep log.setDurationMinutes(duration.toMinutes());

    logRepo.save(log);
    slotServiceClient.updatedSlot(
        log.getSlotId(),
        Map.of(occupancyField, false)
    );

    // Pass formattedDuration to your response DTO if needed
    return new VehicleLogResponse(
        log.getLogId(),
        log.getVehicleNumber(),
        log.getEntryTime(),
        log.getExitTime(),
        formattedDuration, 
        log.getUserId(),
        log.getSlotId()
    );
}
 
    @Override
    public List<VehicleLogResponse> getAllLogs() {
        return logRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
 
    @Override
    public VehicleLogResponse getLogById(Long id) {
        VehicleLog log = logRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));
        return mapToResponse(log);
    }
 
    private VehicleLogResponse mapToResponse(VehicleLog log) {
        String formattedDuration = null;
        if (log.getEntryTime() != null && log.getExitTime() != null) {
            Duration duration = Duration.between(log.getEntryTime(), log.getExitTime());
            long seconds = duration.getSeconds();
            formattedDuration = String.format("%02d:%02d:%02d",
                    seconds / 3600,
                    (seconds % 3600) / 60,
                    seconds % 60);
        }
        return new VehicleLogResponse(
                log.getLogId(),
                log.getVehicleNumber(),
                log.getEntryTime(),
                log.getExitTime(),
                formattedDuration,
                log.getUserId(),
                log.getSlotId()
        );
    }
}
 