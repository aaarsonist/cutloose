package com.barbershop.impl;

import com.barbershop.model.BookingStatus;
import org.springframework.security.access.AccessDeniedException;

import com.barbershop.model.Timetable;
import com.barbershop.model.User;
import com.barbershop.repository.TimetableRepository;
import com.barbershop.repository.UserRepository;
import com.barbershop.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class TimetableServiceImpl implements TimetableService {

    private final TimetableRepository timetableRepository;
    private final UserRepository userRepository;

    @Autowired
    public TimetableServiceImpl(TimetableRepository timetableRepository, UserRepository userRepository) {
        this.timetableRepository = timetableRepository;
        this.userRepository = userRepository;
    }
    @Override
    public List<Timetable> getAllAppointments() {
        return timetableRepository.findByStatusAndAppointmentTimeAfter(BookingStatus.BOOKED, LocalDateTime.now());
    }
    @Override
    @Transactional
    public Timetable bookAppointment(Timetable timetable, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));

        timetable.setBookedBy(user);
        timetable.setStatus(BookingStatus.BOOKED);
        return timetableRepository.save(timetable);
    }

    @Override
    public List<Timetable> getCompletedAppointmentsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));

        return timetableRepository.findCompletedAppointmentsForUserWithoutReview(user);
    }
    @Override
    public List<Timetable> getUpcomingAppointmentsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));

        // Ищем только активные (BOOKED) записи
        return timetableRepository.findByBookedByAndStatus(user, BookingStatus.BOOKED);
    }

    @Override
    @Transactional
    public void cancelAppointment(Long appointmentId, Long userId) {
        Timetable appointment = timetableRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Запись с ID " + appointmentId + " не найдена."));

        // Проверка, что пользователь удаляет СВОЮ запись
        if (!appointment.getBookedBy().getId().equals(userId)) {
            throw new AccessDeniedException("Вы не можете удалить чужую запись.");
        }

        // Доп. проверка: можно отменить только 'BOOKED' запись
        if (appointment.getStatus() != BookingStatus.BOOKED) {
            throw new RuntimeException("Нельзя отменить завершенную запись.");
        }

        // По твоему ТЗ - просто удаляем
        timetableRepository.delete(appointment);
    }
}
