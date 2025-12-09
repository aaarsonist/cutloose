package com.barbershop.controller;

import com.barbershop.dto.AppointmentDto;
import com.barbershop.dto.AdminBookingRequestDto;
import com.barbershop.model.Timetable;
import com.barbershop.model.User;
import com.barbershop.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentDto>> getAllAppointments() {
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
    @GetMapping("/user/upcoming")
    public ResponseEntity<List<Timetable>> getUpcomingUserAppointments(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Timetable> upcomingAppointments = timetableService.getUpcomingAppointmentsForUser(currentUser.getId());
        return ResponseEntity.ok(upcomingAppointments);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            timetableService.cancelAppointment(id, currentUser.getId());
            return ResponseEntity.noContent().build(); // Стандартный ответ для DELETE
        } catch (RuntimeException e) {
            // Если запись не найдена или уже прошла
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Если пользователь пытается удалить чужую запись (AccessDeniedException)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adminDeleteAppointment(@PathVariable Long id) {
        try {
            timetableService.adminCancelAppointment(id);
            return ResponseEntity.ok().build(); // 200 OK
        } catch (IllegalStateException e) {
            // 400 Bad Request (Нельзя отменить прошедшую запись)
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            // 404 Not Found (Запись не найдена)
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping("/admin/book")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Timetable> adminBookAppointment(@RequestBody AdminBookingRequestDto request) {
        try {
            Timetable newAppointment = timetableService.adminBookAppointment(request);
            return ResponseEntity.ok(newAppointment);
        } catch (Exception e) {
            // (На случай, если мастер/услуга не найдены)
            return ResponseEntity.badRequest().build();
        }
    }
}
