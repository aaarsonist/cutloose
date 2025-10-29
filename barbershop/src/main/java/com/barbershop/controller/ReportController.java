package com.barbershop.controller;

import com.barbershop.dto.report.PerformanceReportDto;
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
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/performance")
    public ResponseEntity<PerformanceReportDto> getPerformanceReport(
            @RequestParam String reportType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> endDate,
            @RequestParam Optional<List<Long>> serviceIds,
            @RequestParam Optional<List<Long>> masterIds
    ) {
        System.out.println(">>> ReportController received reportType: " + reportType);
        System.out.println(">>> ReportController received startDate: " + startDate);
        System.out.println(">>> ReportController received endDate: " + endDate);
        System.out.println(">>> ReportController received serviceIds: " + serviceIds);
        System.out.println(">>> ReportController received masterIds: " + masterIds);

        if (!"services".equals(reportType) && !"masters".equals(reportType) && !"sales".equals(reportType)) {
            return ResponseEntity.badRequest().body(null);
        }
        try {
            PerformanceReportDto report = reportService.getPerformanceReport(
                    startDate.orElse(null),
                    endDate.orElse(null),
                    reportType,
                    serviceIds.orElse(null),
                    masterIds.orElse(null)
            );

            if (report != null) {
                return ResponseEntity.ok(report);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println(">>> ERROR: Error generating performance report: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}