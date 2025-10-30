package com.barbershop.service;

import com.barbershop.model.Timetable;

import java.util.List;

public interface TimetableService {
    List<Timetable> getAllAppointments();
    Timetable bookAppointment(Timetable timetable, Long userId);
    List<Timetable> getCompletedAppointmentsForUser(Long userId);
    /**
     * Получает предстоящие (активные) записи пользователя.
     */
    List<Timetable> getUpcomingAppointmentsForUser(Long userId);

    /**
     * Отменяет (удаляет) запись. Проверяет, что отменяет владелец.
     */
    void cancelAppointment(Long appointmentId, Long userId);
}
