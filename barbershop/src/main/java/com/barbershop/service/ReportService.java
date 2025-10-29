package com.barbershop.service;

import com.barbershop.dto.report.PerformanceReportDto;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportService {
    PerformanceReportDto getPerformanceReport(LocalDateTime startDate, LocalDateTime endDate, String reportType, List<Long> serviceIds, List<Long> masterIds);
}