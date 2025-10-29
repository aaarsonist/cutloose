package com.barbershop.impl;

import com.barbershop.dto.report.AverageRatingDto;
import com.barbershop.dto.report.PerformanceReportDto;
import com.barbershop.dto.report.ServiceReportDataDto;
import com.barbershop.dto.report.VisitDataPointDto;
import com.barbershop.dto.report.MasterPerformanceDataDto;
import com.barbershop.dto.report.MasterReportDataDto;
import com.barbershop.dto.report.DailyRevenueDataPointDto;
import com.barbershop.dto.report.SalesReportDataDto;
import com.barbershop.repository.ReviewRepository;
import com.barbershop.repository.TimetableRepository;
import com.barbershop.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final TimetableRepository timetableRepository;
    private final ReviewRepository reviewRepository;
    // возможно ServiceRepository, MasterRepository, UserRepository

    @Autowired
    public ReportServiceImpl(TimetableRepository timetableRepository, ReviewRepository reviewRepository) {
        this.timetableRepository = timetableRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    public PerformanceReportDto getPerformanceReport(LocalDateTime startDate, LocalDateTime endDate, String reportType, List<Long> serviceIds, List<Long> masterIds) {
        PerformanceReportDto report = new PerformanceReportDto();
        report.setReportType(reportType);
        report.setStartDate(startDate);
        report.setEndDate(endDate);

        if ("services".equals(reportType)) {
            report.setServiceReportData(getServicePerformanceReportData(startDate, endDate, serviceIds));
        }
        if ("masters".equals(reportType)) {
            System.out.println(">>> DEBUG: ReportServiceImpl calling getMasterPerformanceReportData with startDate: " + startDate + ", endDate: " + endDate + ", masterIds: " + masterIds);
            report.setMasterReportData(getMasterPerformanceReportData(startDate, endDate, masterIds));
        }
        else if ("sales".equals(reportType)) { // *** ДОБАВЛЕНО: Обработка типа "sales" ***
            System.out.println(">>> DEBUG: ReportServiceImpl calling getSalesReportData with startDate: " + startDate + ", endDate: " + endDate + ", serviceIds: " + serviceIds + ", masterIds: " + masterIds);
            report.setSalesReportData(getSalesReportData(startDate, endDate, serviceIds, masterIds));
        }
        return report;
    }

    private ServiceReportDataDto getServicePerformanceReportData(LocalDateTime startDate, LocalDateTime endDate, List<Long> serviceIds) {
        ServiceReportDataDto serviceReportData = new ServiceReportDataDto();
        List<Object[]> visitCountsRaw = timetableRepository.countVisitsByDayAndService(startDate, endDate, serviceIds);

        Map<LocalDate, List<Object[]>> visitsByDate = visitCountsRaw.stream()
                .collect(Collectors.groupingBy(
                        row -> ((java.sql.Date) row[0]).toLocalDate()
                ));

        List<VisitDataPointDto> visitDataPoints = visitsByDate.entrySet().stream()
                .map(entry -> {
                    VisitDataPointDto dto = new VisitDataPointDto();
                    dto.setDate(entry.getKey());

                    Map<String, Long> serviceVisitCounts = entry.getValue().stream()
                            .collect(Collectors.toMap(
                                    row -> (String) row[1],
                                    row -> (Long) row[2]
                            ));
                    dto.setServiceVisitCounts(serviceVisitCounts);

                    dto.setTotalVisits(serviceVisitCounts.values().stream().mapToLong(Long::longValue).sum());

                    return dto;
                })
                .sorted(Comparator.comparing(VisitDataPointDto::getDate))
                .collect(Collectors.toList());

        serviceReportData.setVisitData(visitDataPoints);

        List<Object[]> averageRatingsData = reviewRepository.findAverageRatingByServiceWithinPeriod(startDate, endDate, serviceIds); // <-- Вызов репозитория с фильтрами

        List<AverageRatingDto> averageRatings = averageRatingsData.stream()
                .map(row -> {
                    AverageRatingDto dto = new AverageRatingDto();
                    dto.setServiceId((Long) row[0]);
                    dto.setServiceName((String) row[1]);
                    dto.setAverageRating((Double) row[2]);
                    return dto;
                })
                .collect(Collectors.toList());

        serviceReportData.setAverageRatings(averageRatings);

        return serviceReportData;
    }

    private MasterReportDataDto getMasterPerformanceReportData(LocalDateTime startDate, LocalDateTime endDate, List<Long> masterIds) {
        List<Object[]> countDataRaw = timetableRepository.countAppointmentsByMaster(startDate, endDate, masterIds);

        List<Object[]> revenueDataRaw = timetableRepository.sumServicePricesByMaster(startDate, endDate, masterIds);

        List<Object[]> ratingDataRaw = reviewRepository.findAverageRatingByMasterWithinPeriod(startDate, endDate, masterIds);

        Map<Long, MasterPerformanceDataDto> masterDataMap = new HashMap<>();

        for (Object[] row : countDataRaw) {
            Long masterId = (Long) row[0];
            String masterName = (String) row[1];
            Long count = (Long) row[2];
            masterDataMap.put(masterId, new MasterPerformanceDataDto(masterId, masterName, count, BigDecimal.ZERO, null));
        }

        for (Object[] row : revenueDataRaw) {
            Long masterId = (Long) row[0];
            Object rawRevenue = row[2];

            BigDecimal revenue;
            if (rawRevenue instanceof Number) {
                revenue = BigDecimal.valueOf(((Number) rawRevenue).doubleValue());
            } else {
                revenue = BigDecimal.ZERO;
                System.err.println(">>> WARNING: Unexpected type for revenue: " + rawRevenue);
            }

            MasterPerformanceDataDto dto = masterDataMap.get(masterId);
            if (dto != null) {
                dto.setTotalRevenue(revenue);
            }
        }

        for (Object[] row : ratingDataRaw) {
            Long masterId = (Long) row[0];
            Double rating = (Double) row[2];
            MasterPerformanceDataDto dto = masterDataMap.get(masterId);
            if (dto != null) {
                dto.setAverageRating(rating);
            }
        }

        List<MasterPerformanceDataDto> masterPerformanceDataList = new ArrayList<>(masterDataMap.values());

        masterPerformanceDataList.sort(Comparator.comparing(MasterPerformanceDataDto::getMasterFullName));

        MasterReportDataDto masterReportData = new MasterReportDataDto();
        masterReportData.setMasterPerformanceData(masterPerformanceDataList);

        return masterReportData;
    }

    private SalesReportDataDto getSalesReportData(LocalDateTime startDate, LocalDateTime endDate, List<Long> serviceIds, List<Long> masterIds) {
        // 1. Получаем суммарную стоимость записей по дням с фильтрами
        List<Object[]> dailyRevenueRaw = timetableRepository.sumServicePricesByDay(startDate, endDate, serviceIds, masterIds);

        // Преобразуем сырые данные в List<DailyRevenueDataPointDto>
        List<DailyRevenueDataPointDto> dailyRevenueDataPoints = dailyRevenueRaw.stream()
                .map(row -> {
                    DailyRevenueDataPointDto dto = new DailyRevenueDataPointDto();
                    // Индекс 0 - дата (java.sql.Date или LocalDate)
                    if (row[0] instanceof java.sql.Date) {
                        dto.setDate(((java.sql.Date) row[0]).toLocalDate());
                    } else if (row[0] instanceof LocalDate) {
                        dto.setDate((LocalDate) row[0]);
                    } else {
                        // Если тип даты неожиданный
                        System.err.println(">>> WARNING: Unexpected date type in daily revenue: " + row[0]);
                        // Можно пропустить эту точку или установить null/другую дату по умолчанию
                        return null; // Пропускаем некорректные точки
                    }


                    // Индекс 1 - суммарная стоимость (BigDecimal, Double или другой числовой тип)
                    Object rawRevenue = row[1];
                    BigDecimal revenue;
                    if (rawRevenue instanceof Number) {
                        // Преобразуем любое числовое значение в BigDecimal
                        revenue = BigDecimal.valueOf(((Number) rawRevenue).doubleValue());
                    } else {
                        // Если это не число (что маловероятно для SUM)
                        revenue = BigDecimal.ZERO;
                        System.err.println(">>> WARNING: Unexpected revenue type in daily revenue: " + rawRevenue);
                    }
                    dto.setTotalRevenue(revenue);

                    return dto;
                })
                .filter(Objects::nonNull) // Отфильтровываем точки, которые вернули null (из-за некорректной даты)
                .sorted(Comparator.comparing(DailyRevenueDataPointDto::getDate)) // Сортируем по дате
                .collect(Collectors.toList());

        SalesReportDataDto salesReportData = new SalesReportDataDto();
        salesReportData.setDailyRevenueDataPoints(dailyRevenueDataPoints);

        return salesReportData;
    }
}