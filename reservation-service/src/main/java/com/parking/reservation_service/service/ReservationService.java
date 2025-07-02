package com.parking.reservation_service.service;
 
import com.parking.reservation_service.dto.ReservationRequestDTO;
import com.parking.reservation_service.dto.ReservationResponseDTO;


 
import java.util.List;
 
public interface ReservationService {
 
    ReservationResponseDTO createReservation(ReservationRequestDTO requestDTO);
 
    ReservationResponseDTO updateReservation(Long id, ReservationRequestDTO requestDTO);
 
    void cancelReservation(Long id);
 
    ReservationResponseDTO getReservationById(Long id);
 
    List<ReservationResponseDTO> getAllReservations();
 
    List<ReservationResponseDTO> getReservationsByUser(Long userId);    
}
 