package com.barbershop.controller;

import com.barbershop.model.WorkSchedule;
import com.barbershop.service.WorkScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-schedule")
@PreAuthorize("hasRole('ADMIN')") // Весь контроллер только для Админа
public class WorkScheduleController {

    @Autowired
    private WorkScheduleService workScheduleService;

    /**
     * Получает сводный график для ВСЕХ мастеров
     */
    @GetMapping("/all")
    public ResponseEntity<List<WorkSchedule>> getAllSchedules() {
        List<WorkSchedule> schedules = workScheduleService.getAllSchedules();
        return ResponseEntity.ok(schedules);
    }

    /**
     * Обновляет или создает одну запись в графике (одну "ячейку")
     */
    @PostMapping
    public ResponseEntity<WorkSchedule> updateScheduleEntry(@RequestBody WorkSchedule scheduleData) {
        // scheduleData должен прийти с { master: { id: 5 }, dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00" }
        // Или startTime: null для "Выходного"

        if (scheduleData.getMaster() == null || scheduleData.getMaster().getId() == null || scheduleData.getDayOfWeek() == null) {
            return ResponseEntity.badRequest().build(); // Необходимые данные отсутствуют
        }

        WorkSchedule updatedSchedule = workScheduleService.updateSchedule(scheduleData);
        return ResponseEntity.ok(updatedSchedule);
    }
}