package com.barbershop.service;

import com.barbershop.model.Timetable;

import java.util.List;

public interface TimetableService {
    List<Timetable> getAllAppointments();
    Timetable bookAppointment(Timetable timetable, Long userId);
    List<Timetable> getCompletedAppointmentsForUser(Long userId);
}
