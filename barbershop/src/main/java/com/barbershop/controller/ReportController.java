package com.barbershop.controller;

import com.barbershop.dto.report.PerformanceReportDto;
import com.barbershop.dto.report.MasterReportDataDto;
import com.barbershop.dto.report.SalesReportDataDto;
import com.barbershop.dto.report.ServiceReportDataDto;
import com.barbershop.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    private LocalDateTime parseDate(Optional<LocalDateTime> date) {
        return date.orElse(null);
    }

    // Вспомогательный метод для обработки Optional
    private List<Long> parseIds(Optional<List<Long>> ids) {
        return ids.orElse(null);
    }
    @GetMapping("/sales")
    public ResponseEntity<SalesReportDataDto> getSalesData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> endDate,
            @RequestParam Optional<List<Long>> serviceIds,
            @RequestParam Optional<List<Long>> masterIds
    ) {
        SalesReportDataDto data = reportService.getSalesData(
                parseDate(startDate), parseDate(endDate), parseIds(serviceIds), parseIds(masterIds)
        );
        return ResponseEntity.ok(data);
    }

    /**
     * Эндпоинт для ГРАФИКА ПОСЕЩЕНИЙ и ТАБЛИЦЫ ОЦЕНОК
     */
    @GetMapping("/services")
    public ResponseEntity<ServiceReportDataDto> getServiceData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> endDate,
            @RequestParam Optional<List<Long>> serviceIds
    ) {
        ServiceReportDataDto data = reportService.getServiceData(
                parseDate(startDate), parseDate(endDate), parseIds(serviceIds)
        );
        return ResponseEntity.ok(data);
    }

    /**
     * Эндпоинт для ТАБЛИЦЫ МАСТЕРОВ
     */
    @GetMapping("/masters")
    public ResponseEntity<MasterReportDataDto> getMasterData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> endDate,
            @RequestParam Optional<List<Long>> masterIds
    ) {
        MasterReportDataDto data = reportService.getMasterData(
                parseDate(startDate), parseDate(endDate), parseIds(masterIds)
        );
        return ResponseEntity.ok(data);
    }
}