package com.parking.vehicle_log_service.service;

import com.parking.vehicle_log_service.dto.VehicleEntryRequest;
import com.parking.vehicle_log_service.dto.VehicleExitRequest;
import com.parking.vehicle_log_service.dto.VehicleLogResponse;

import java.util.List;

public interface VehicleLogService {

    VehicleLogResponse logVehicleEntry(VehicleEntryRequest request);

    VehicleLogResponse logVehicleExit(VehicleExitRequest request);

    List<VehicleLogResponse> getAllLogs();

    VehicleLogResponse getLogById(Long id);

    
}
