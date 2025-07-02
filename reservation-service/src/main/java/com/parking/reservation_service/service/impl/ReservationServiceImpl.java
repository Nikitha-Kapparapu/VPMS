package com.parking.reservation_service.service.impl;
 
import com.parking.reservation_service.dto.*;
import com.parking.reservation_service.entity.*;
import com.parking.reservation_service.repository.ReservationRepository;
import com.parking.reservation_service.service.ReservationService;
import com.parking.reservation_service.feign.SlotClient;
 
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {
 
    private final ReservationRepository reservationRepo;
    private final SlotClient slotClient;

    @Scheduled(fixedRate = 60000) // runs every 60 seconds
public void completeExpiredReservations() {
    List<Reservation> expired = reservationRepo.findByStatusAndEndTimeBefore(ReservationStatus.ACTIVE, LocalDateTime.now());
    for (Reservation r : expired) {
        r.setStatus(ReservationStatus.COMPLETED);
        // Mark the slot as available again
        slotClient.markSlotAvailable(r.getSlotId());
    }
    reservationRepo.saveAll(expired);
}
 
    @Override
    public ReservationResponseDTO createReservation(ReservationRequestDTO dto) {
        // Check for existing ACTIVE reservation on same slot and time
        List<Reservation> conflicts = reservationRepo.findBySlotIdAndStatus(dto.getSlotId(), ReservationStatus.ACTIVE);
        for (Reservation r : conflicts) {
            if (dto.getStartTime().isBefore(r.getEndTime()) && dto.getEndTime().isAfter(r.getStartTime())) {
                throw new RuntimeException("Slot already reserved for the selected time.");
            }
        }
 
        // Call slot-service to mark it as occupied
        slotClient.markSlotOccupied(dto.getSlotId());
 
        Reservation reservation = Reservation.builder()
                .userId(dto.getUserId())
                .slotId(dto.getSlotId())
                .vehicleNumber(dto.getVehicleNumber())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .status(ReservationStatus.ACTIVE)
                .build();
 
        reservationRepo.save(reservation);
 
        return mapToDTO(reservation);
    }
    @Override
    public ReservationResponseDTO updateReservation(Long id, ReservationRequestDTO dto) {
        Reservation reservation = reservationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    
        reservation.setStartTime(dto.getStartTime());
        reservation.setEndTime(dto.getEndTime());
        reservation.setVehicleNumber(dto.getVehicleNumber());
    
        reservationRepo.save(reservation);
        return mapToDTO(reservation);
    }
  
    @Override
    public void cancelReservation(Long id) {
        Reservation reservation = reservationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepo.save(reservation);
 
        // Call slot-service to mark it as available again
        slotClient.markSlotAvailable(reservation.getSlotId());
    }
 
    @Override
    public ReservationResponseDTO getReservationById(Long id) {
        return reservationRepo.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    }
 
    @Override
    public List<ReservationResponseDTO> getAllReservations() {
        return reservationRepo.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
 
    @Override
    public List<ReservationResponseDTO> getReservationsByUser(Long userId) {
        return reservationRepo.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
 
    private ReservationResponseDTO mapToDTO(Reservation reservation) {
        return new ReservationResponseDTO(
                reservation.getReservationId(),
                reservation.getUserId(),
                reservation.getSlotId(),
                reservation.getVehicleNumber(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                reservation.getStatus()
        );
    }
}
 