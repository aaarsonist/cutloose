package com.barbershop.service;

import com.barbershop.model.WorkSchedule;
import java.util.List;

public interface WorkScheduleService {

    /**
     * Возвращает полный график работы для всех мастеров.
     */
    List<WorkSchedule> getAllSchedules();

    /**
     * Обновляет или создает одну запись в графике.
     * @param scheduleDto DTO или модель, содержащая masterId, dayOfWeek, startTime, endTime.
     * @return Сохраненный объект WorkSchedule.
     */
    WorkSchedule updateSchedule(WorkSchedule scheduleDto);
}