package com.parking.vehicle_log_service.service.impl;
 
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
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
public class VehicleLogServiceImpl implements VehicleLogService {
 
    private final VehicleLogRepository logRepo;
 
    @Override
    public VehicleLogResponse logVehicleEntry(VehicleEntryRequest request) {
        VehicleLog log = new VehicleLog();
        log.setVehicleNumber(request.getVehicleNumber());
        log.setUserId(request.getUserId());
        log.setSlotId(request.getSlotId());
        log.setEntryTime(LocalDateTime.now());
 
        logRepo.save(log);
 
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
        long duration = Duration.between(log.getEntryTime(), log.getExitTime()).toMinutes();
        log.setDurationMinutes(duration);
        logRepo.save(log);
 
        return mapToResponse(log);
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
        return new VehicleLogResponse(
                log.getLogId(),
                log.getVehicleNumber(),
                log.getEntryTime(),
                log.getExitTime(),
                log.getDurationMinutes(),
                log.getUserId(),
                log.getSlotId()
        );
    }
}
 