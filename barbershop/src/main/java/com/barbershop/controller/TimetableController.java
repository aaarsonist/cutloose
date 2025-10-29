package com.barbershop.controller;

import com.barbershop.model.Timetable;
import com.barbershop.model.User;
import com.barbershop.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.barbershop.repository.UserRepository;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableService timetableService;
    private final UserRepository userRepository;
    @Autowired
    public TimetableController(TimetableService timetableService, UserRepository userRepository) {
        this.timetableService = timetableService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Timetable>> getAllAppointments() {
        return ResponseEntity.ok(timetableService.getAllAppointments());
    }
    @PostMapping
    public ResponseEntity<Timetable> bookAppointment(@RequestBody Timetable timetable, Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username);

        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        Timetable bookedTimetable = timetableService.bookAppointment(timetable, currentUser.getId());
        return ResponseEntity.ok(bookedTimetable);
    }

    @GetMapping("/user/completed")
    public ResponseEntity<List<Timetable>> getCompletedUserAppointments(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username);

        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        List<Timetable> completedAppointments = timetableService.getCompletedAppointmentsForUser(currentUser.getId());
        return ResponseEntity.ok(completedAppointments);
    }

}
