package com.barbershop.service;

import com.barbershop.dto.report.*;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportService {
    PerformanceReportDto getPerformanceReport(LocalDateTime startDate, LocalDateTime endDate, String reportType, List<Long> serviceIds, List<Long> masterIds);
    SalesReportDataDto getSalesData(LocalDateTime startDate, LocalDateTime endDate, List<Long> serviceIds, List<Long> masterIds);

    ServiceReportDataDto getServiceData(LocalDateTime startDate, LocalDateTime endDate, List<Long> serviceIds);

    MasterReportDataDto getMasterData(LocalDateTime startDate, LocalDateTime endDate, List<Long> masterIds);
}