package com.parking.reservation_service.dto;
 
import com.parking.reservation_service.entity.ReservationStatus;
import lombok.*;
 
import java.time.LocalDateTime;
 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponseDTO {
    private Long reservationId;
    private Long userId;
    private Long slotId;
    private String vehicleNumber;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ReservationStatus status;
}
 