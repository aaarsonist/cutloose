package com.barbershop.dto.forecast;

import lombok.Data;
import java.time.DayOfWeek;

@Data
public class ForecastDto {

    private DayOfWeek dayOfWeek;
    private String dayOfWeekRussian; // Для удобства фронтенда

    private double supplyHours;      // Предложение (из WorkSchedule)
    private double demandHours;      // Спрос (из Timetable)
    private double occupancy;        // Загрузка (demand / supply)

    private String recommendationLevel; // "LOW", "OPTIMAL", "HIGH", "CRITICAL"
    private String recommendationText;  // "НИЗКАЯ ЭФФЕКТИВНОСТЬ..."
}