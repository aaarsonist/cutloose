package com.barbershop.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter// Геттеры, сеттеры и т.д.
public class AppointmentDto {
    private Long id;
    private String title; // "Имя Услуги (Имя Мастера)"
    private LocalDateTime start;
    private LocalDateTime end;

    private String clientName;
    private String clientEmail;
    private String serviceName;
    private String masterName;
}