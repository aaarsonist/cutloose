package com.barbershop.impl;

import com.barbershop.model.BookingStatus;
import org.springframework.security.access.AccessDeniedException;

import com.barbershop.dto.AppointmentDto;
import com.barbershop.model.*;
import com.barbershop.repository.TimetableRepository;
import com.barbershop.repository.ReviewRepository;
import com.barbershop.repository.UserRepository;
import com.barbershop.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class TimetableServiceImpl implements TimetableService {

    @Autowired
    private TimetableRepository timetableRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    public TimetableServiceImpl(TimetableRepository timetableRepository, UserRepository userRepository) {
        this.timetableRepository = timetableRepository;
        this.userRepository = userRepository;
    }
    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDto> getAllAppointments() {
        List<Timetable> appointments = timetableRepository.findAll();
        // Конвертируем Timetable в AppointmentDto
        return appointments.stream().map(this::mapToDto).collect(Collectors.toList());
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

        timetableRepository.delete(appointment);
    }

    private AppointmentDto mapToDto(Timetable t) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(t.getId());

        String serviceName = (t.getService() != null) ? t.getService().getName() : "Услуга";
        String masterName = (t.getMaster() != null) ? t.getMaster().getName() : "Мастер";
        Integer duration = (t.getService() != null) ? t.getService().getDuration() : 60;

        // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
        String clientName;
        String clientEmail;

        if (t.getUser() != null) {
            clientName = t.getUser().getName();
            // Мы используем .getUsername(), так как в User.java поле называется 'username'
            clientEmail = t.getUser().getUsername();
        } else {
            clientName = "Клиент";
            clientEmail = "N/A";
        }

        dto.setTitle(serviceName + " (" + masterName + ")");
        dto.setStart(t.getAppointmentTime());
        dto.setEnd(t.getAppointmentTime().plusMinutes(duration));

        dto.setServiceName(serviceName);
        dto.setMasterName(masterName);
        dto.setClientName(clientName);
        dto.setClientEmail(clientEmail);

        return dto;
    }

    @Override
    @Transactional
    public void adminCancelAppointment(Long id) {
        // 1. Находим запись в БД
        Timetable appointment = timetableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Запись не найдена с id: " + id));

        // 2. ПРОВЕРЯЕМ ДАТУ! (Ваша новая логика)
        if (appointment.getAppointmentTime().isBefore(LocalDateTime.now())) {
            // Если запись в прошлом, бросаем ошибку
            throw new IllegalStateException("Нельзя отменить прошедшую запись.");
        }

        // 3. Если проверка пройдена (запись в будущем), удаляем отзывы
        reviewRepository.deleteByAppointmentId(id);

        // 4. ...и саму запись
        timetableRepository.deleteById(id);
    }
}
