package com.parking.vehicle_log_service.controller;

import com.parking.vehicle_log_service.dto.VehicleEntryRequest;
import com.parking.vehicle_log_service.dto.VehicleExitRequest;
import com.parking.vehicle_log_service.dto.VehicleLogResponse;
import com.parking.vehicle_log_service.service.VehicleLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicle-log")
@RequiredArgsConstructor
public class VehicleLogController {

    private final VehicleLogService logService;


    // 🔹 Log vehicle entry (STAFF or ADMIN)
    @PostMapping("/entry")
    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> logEntry(@RequestBody VehicleEntryRequest request) {
        VehicleLogResponse response = logService.logVehicleEntry(request);
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Vehicle entry recorded");
        res.put("log", response);
        return ResponseEntity.ok(res);
    }

    // 🔹 Log vehicle exit (STAFF or ADMIN)
    @PostMapping("/exit")
    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> logExit(@RequestBody VehicleExitRequest request) {
        VehicleLogResponse response = logService.logVehicleExit(request);
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Vehicle exit recorded");
        res.put("log", response);
        return ResponseEntity.ok(res);
    }

    // 🔹 Get all logs (ADMIN only)
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllLogs() {
        List<VehicleLogResponse> logs = logService.getAllLogs();
        Map<String, Object> res = new HashMap<>();
        res.put("count", logs.size());
        res.put("logs", logs);
        return ResponseEntity.ok(res);
    }

    // 🔹 Get a specific log by ID (ADMIN only)
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<VehicleLogResponse> getLogById(@PathVariable Long id) {
        return ResponseEntity.ok(logService.getLogById(id));
    }
}
