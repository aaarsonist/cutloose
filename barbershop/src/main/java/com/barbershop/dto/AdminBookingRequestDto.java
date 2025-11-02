package com.barbershop.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdminBookingRequestDto {
    // Данные клиента
    private String clientName;
    private String clientEmail;

    // Данные записи
    private Long masterId;
    private Long serviceId;
    private LocalDateTime appointmentTime;
}