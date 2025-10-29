package com.barbershop.impl;

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
        return timetableRepository.findAll();
    }
    @Override
    @Transactional
    public Timetable bookAppointment(Timetable timetable, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));

        timetable.setBookedBy(user);

        return timetableRepository.save(timetable);
    }

    @Override
    public List<Timetable> getCompletedAppointmentsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));

        return timetableRepository.findByBookedByAndAppointmentTimeBefore(user, LocalDateTime.now());
    }
}
