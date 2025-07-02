package com.parking.vehicle_log_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "slot-service")
public interface SlotServiceClient {

    @PutMapping("/api/slots/slot/{slotId}")
    Map<String, Object> updatedSlot(@PathVariable("slotId") Long slotId, @RequestBody Map<String, Object> request);
}