package com.barbershop.service;

import com.barbershop.dto.forecast.ForecastDto;
import java.util.List;

public interface ForecastService {

    /**
     * Выполняет полный анализ Спроса (Timetable)
     * и Предложения (WorkSchedule)
     * и возвращает 7 DTO (по одному на каждый день недели)
     * с расчетами и рекомендациями.
     */
    List<ForecastDto> getWeeklyForecast();
}