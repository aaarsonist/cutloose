package com.barbershop.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data // Геттеры, сеттеры, toString и т.д.
public class AppointmentDto {
    private Long id;
    private String title; // "Имя Услуги (Имя Мастера)"
    private LocalDateTime start;
    private LocalDateTime end;

    // Доп. информация для модального окна
    private String clientName;
    private String clientEmail;
    private String serviceName;
    private String masterName;
}