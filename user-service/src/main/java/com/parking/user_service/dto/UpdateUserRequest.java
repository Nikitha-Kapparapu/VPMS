package com.parking.user_service.dto;
 
import lombok.*;
 
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequest {
    private String name;
    private String email;
    private String password; // optional — update if present
}
 